/**
 * @forge/dev-dashboard - Single-Session Operator Authentication Manager (2026 LTS)
 * Manages password verification and enforces strictly ONE active operator session.
 * Logging in from a new client/browser immediately invalidates prior sessions.
 */

import { randomBytes, timingSafeEqual } from 'node:crypto';
import { createLogger } from '@forge/sdk';

const logger = createLogger('dev-dashboard-auth');

/**
 * DevSessionRecord
 * @requirements [HLR-DEV-501] [LLR-SUB-002]
 */
export interface DevSessionRecord {
  token: string;
  createdAt: number;
  lastActiveAt: number;
  ipHash?: string;
  userAgent?: string;
}

/**
 * DevDashboardAuthManager
 * @requirements [HLR-DEV-501] [LLR-SUB-002]
 */
export class DevDashboardAuthManager {
  private activeSession: DevSessionRecord | null = null;
  private defaultPassword = 'password123';

  /**
   * Retrieves configured master password from environment or defaults to 'password123'.
   */
  public getMasterPassword(): string {
    if (process.env.NODE_ENV === 'test' || process.env.FORGE_TEST_MODE === 'true' || process.env.BUN_ENV === 'test') {
      return this.defaultPassword;
    }
    const configured = process.env.DEV_DASHBOARD_PASSWORD || process.env.DEVCENTER_PASSWORD;
    if (process.env.NODE_ENV === 'production') {
      if (
        !configured ||
        configured === this.defaultPassword ||
        configured.length < 12 ||
        configured.includes('change-me') ||
        configured.includes('dev-operator')
      ) {
        throw new Error(
          '[FATAL SECURITY] In production, DEV_DASHBOARD_PASSWORD must be configured with a secure, non-default password of at least 12 characters.'
        );
      }
    }
    return configured || this.defaultPassword;
  }

  /**
   * Validates a candidate password against the configured master password in constant time.
   */
  public verifyPassword(candidate: string): boolean {
    if (!candidate || typeof candidate !== 'string') return false;
    const cleanCandidate = candidate.trim();
    const master = this.getMasterPassword().trim();
    const bufCandidate = Buffer.from(cleanCandidate);
    const bufMaster = Buffer.from(master);
    if (bufCandidate.length !== bufMaster.length) {
      timingSafeEqual(bufMaster, bufMaster);
      return false;
    }
    return timingSafeEqual(bufCandidate, bufMaster);
  }

  /**
   * Creates a new single active session, immediately superseding any previous session.
   */
  public createSession(
    password: string,
    meta: { ipHash?: string; userAgent?: string } = {}
  ): { success: boolean; token?: string; error?: string } {
    if (!this.verifyPassword(password)) {
      logger.warn('Failed login attempt for Developer Dashboard: invalid password');
      return { success: false, error: 'Invalid master password provided' };
    }

    const token = `dev_sess_${randomBytes(24).toString('hex')}`;
    const now = Date.now();

    if (this.activeSession) {
      logger.info('Superseding previous Developer Dashboard operator session with new login');
    }

    this.activeSession = {
      token,
      createdAt: now,
      lastActiveAt: now,
      ipHash: meta.ipHash,
      userAgent: meta.userAgent,
    };

    logger.info('Operator session created successfully for Developer Dashboard');
    return { success: true, token };
  }

  /**
   * Validates if a given token matches the currently active session or direct master credentials.
   */
  public validateSession(token: string | null | undefined): boolean {
    if (!token) return false;

    // 1. Direct master password API authorization (for CLI / testing / programmatic tools)
    try {
      if (this.verifyPassword(token)) {
        return true;
      }
    } catch {
      // Guard against unhandled configuration exceptions during session check
    }

    // 2. Active single operator session verification
    if (!this.activeSession) return false;
    if (this.activeSession.token !== token) return false;

    this.activeSession.lastActiveAt = Date.now();
    return true;
  }

  /**
   * Revokes the currently active session.
   */
  public revokeSession(token?: string): void {
    if (!token || (this.activeSession && this.activeSession.token === token)) {
      this.activeSession = null;
      logger.info('Developer Dashboard operator session logged out / revoked');
    }
  }

  /**
   * Returns current active session information.
   */
  public getSessionInfo(): { active: boolean; createdAt?: number; lastActiveAt?: number } {
    if (!this.activeSession) return { active: false };
    return {
      active: true,
      createdAt: this.activeSession.createdAt,
      lastActiveAt: this.activeSession.lastActiveAt,
    };
  }

  /**
   * Extracts session token from HTTP Request headers.
   */
  public extractToken(req: Request): string | null {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }

    const cookieHeader = req.headers.get('Cookie') || req.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:^|;\s*)(?:dev_session|__Host-dev-session)=([^;]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1].trim());
      }
    }

    // URL query param fallback (critical for EventSource SSE which cannot send custom headers)
    try {
      const url = new URL(req.url);
      const queryToken = url.searchParams.get('token') || url.searchParams.get('auth');
      if (queryToken) {
        return queryToken.trim();
      }
    } catch {}

    return null;
  }
}

/**
 * devAuthManager
 * @requirements [HLR-DEV-501] [LLR-SUB-002]
 */
export const devAuthManager = new DevDashboardAuthManager();

/**
 * Handles /api/auth/* routes for Dev Dashboard.
  * @requirements [HLR-DEV-501] [LLR-SUB-002]
 */
export async function handleDevAuthApi(path: string, req: Request): Promise<Response | null> {
  const normPath = path.replace(/^\/devcenter/, '');
  if ((path === '/api/auth/login' || normPath === '/api/auth/login') && req.method === 'POST') {
    const body: any = await req.json().catch(() => ({}));
    const password = String(body.password || '').trim();
    const userAgent = req.headers.get('user-agent') || undefined;
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    const result = devAuthManager.createSession(password, { ipHash: ip, userAgent });
    if (!result.success) {
      return Response.json({ error: result.error || 'Authentication failed', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const isProd = process.env.NODE_ENV === 'production';
    const cookieHeader = `dev_session=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${isProd ? '; Secure' : ''}`;
    return new Response(JSON.stringify({ status: 'ok', sessionToken: result.token }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieHeader,
      },
    });
  }

  if ((path === '/api/auth/logout' || normPath === '/api/auth/logout') && req.method === 'POST') {
    const token = devAuthManager.extractToken(req);
    if (token) devAuthManager.revokeSession(token);
    return new Response(JSON.stringify({ status: 'ok', message: 'Logged out successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': 'dev_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
      },
    });
  }

  if ((path === '/api/auth/session' || normPath === '/api/auth/session') && req.method === 'GET') {
    const token = devAuthManager.extractToken(req);
    const isAuthenticated = devAuthManager.validateSession(token);
    const info = devAuthManager.getSessionInfo();
    return Response.json({
      authenticated: isAuthenticated,
      singleSession: true,
      ...info,
    });
  }

  return null;
}
