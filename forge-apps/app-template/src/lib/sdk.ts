/**
 * SG Forge Micro-App Submodule - Standalone Micro-SDK (2026 LTS)
 * 100% Isolated: Zero imports from central platform monorepo.
 * Provides logging, Turso libSQL/SQLite database, and Zero-Trust auth guard.
 */

import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash, createPrivateKey, createPublicKey, sign, verify } from 'node:crypto';
import type { AuthGuardOptions, AuthGuardResult, AuthUser, ScopedHierarchyResponse } from './types';

// ==============================================================================
// 1. Standalone Structured Logger
// ==============================================================================
/**
 * StandaloneLogger
 * @requirements [HLR-SDK-301] [LLR-SUB-001]
 */
export class StandaloneLogger {
  private service: string;
  private logDir: string;

  constructor(service: string, logDir?: string) {
    const submoduleRoot = join(__dirname, '..', '..');
    this.service = service;
    this.logDir = logDir || process.env.LOG_DIR || (existsSync('/app/logs') ? '/app/logs' : join(submoduleRoot, 'logs'));
    if (!existsSync(this.logDir)) {
      try {
        mkdirSync(this.logDir, { recursive: true });
      } catch {}
    }
  }

  private write(level: string, message: string, meta?: Record<string, any>) {
    const entry = {
      timestamp: new Date().toISOString(),
      service: this.service,
      level,
      message,
      ...(meta || {}),
    };
    const line = JSON.stringify(entry) + '\n';
    console.log(`[${entry.timestamp}] [${this.service}] [${level}] ${message}`);
    try {
      appendFileSync(join(this.logDir, `${this.service}.log`), line, 'utf8');
    } catch {}
  }

  info(message: string, meta?: Record<string, any>) {
    this.write('INFO', message, meta);
  }

  warn(message: string, meta?: Record<string, any>) {
    this.write('WARN', message, meta);
  }

  error(message: string, meta?: Record<string, any>) {
    this.write('ERROR', message, meta);
  }

  logBrowserEvent(severity: string, message: string, payload?: any) {
    this.write(severity.toUpperCase(), `[BROWSER] ${message}`, { browserPayload: payload });
  }

  logDbQuery(query: string, durationMs: number) {
    this.write('DEBUG', `[DB] ${query.slice(0, 60)} (${durationMs.toFixed(2)}ms)`, { durationMs });
  }
}

/**
 * createLogger
 * @requirements [HLR-SDK-301] [LLR-SUB-001]
 */
export function createLogger(service: string, logDir?: string): StandaloneLogger {
  return new StandaloneLogger(service, logDir);
}

// ==============================================================================
// 2. Standalone Dedicated Turso (libSQL/SQLite) Database Client
// ==============================================================================
/**
 * getDatabaseClient
 * @requirements [HLR-SDK-301] [LLR-SUB-001]
 */
export function getDatabaseClient(dbFilename: string): Database {
  const isTest = process.env.NODE_ENV === 'test' || process.env.BUN_ENV === 'test';
  const submoduleRoot = join(__dirname, '..', '..');
  const dataDir = process.env.DATA_DIR || (existsSync('/app/data') ? '/app/data' : join(submoduleRoot, 'data'));

  if (!existsSync(dataDir)) {
    try {
      mkdirSync(dataDir, { recursive: true });
    } catch {}
  }

  const effectiveFilename = isTest ? `test_${dbFilename}` : dbFilename;
  const dbPath = join(dataDir, effectiveFilename);

  const db = new Database(dbPath, { create: true });
  db.run('PRAGMA journal_mode = WAL;');
  db.run('PRAGMA synchronous = NORMAL;');
  db.run('PRAGMA foreign_keys = ON;');
  return db;
}

// ==============================================================================
// 3. Standalone RFC 7807 Safe Handler
// ==============================================================================
/**
 * createSafeHandler
 * @requirements [HLR-SDK-301] [LLR-SUB-001]
 */
export function createSafeHandler(
  serviceName: string,
  handler: (req: Request) => Promise<Response> | Response,
  logDir?: string
): (req: Request) => Promise<Response> {
  const logger = createLogger(serviceName, logDir);

  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (err: any) {
      const traceId = `trace_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      logger.error(`Unhandled exception in ${serviceName}: ${err?.message || err}`, {
        traceId,
        stack: err?.stack,
      });

      return Response.json(
        {
          type: 'https://forge.internal/errors/internal-server-error',
          title: 'Internal Server Error',
          status: 500,
          detail: 'An unexpected error occurred. Please contact system administrator with traceId.',
          instance: req.url,
          traceId,
          timestamp: new Date().toISOString(),
        },
        {
          status: 500,
          headers: {
            'Content-Type': 'application/problem+json',
            'X-Trace-Id': traceId,
          },
        }
      );
    }
  };
}

// ==============================================================================
// 4. Standalone Zero-Trust Auth Guard
// ==============================================================================
const DEFAULT_DEV_SECRET = 'dev-portable-secret-key-that-is-at-least-32-characters-long';
let cachedPubKey: any = null;

/**
 * isSafeEgressUrl
 * @requirements [HLR-SDK-301] [LLR-SUB-001]
 */
export function isSafeEgressUrl(targetUrl: string): boolean {
  try {
    const url = new URL(targetUrl);
    const host = url.hostname.toLowerCase();
    if (host === '169.254.169.254' || host === 'metadata.google.internal') return false;
    if (process.env.NODE_ENV === 'production' && (host === 'localhost' || host === '127.0.0.1' || host === '::1')) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * getVerificationPublicKey
 * @requirements [HLR-SDK-301] [LLR-SUB-001]
 */
export function getVerificationPublicKey(): any {
  if (cachedPubKey) return cachedPubKey;
  const explicitPub = process.env.AUTH_PUBLIC_KEY;
  if (explicitPub) {
    try {
      cachedPubKey = createPublicKey(explicitPub);
      return cachedPubKey;
    } catch {}
  }
  const secret = process.env.JWT_SECRET || DEFAULT_DEV_SECRET;
  const seed = createHash('sha256').update(secret).digest();
  const pkcs8Der = Buffer.concat([
    Buffer.from('302e020100300506032b657004220420', 'hex'),
    seed,
  ]);
  const privKey = createPrivateKey({ key: pkcs8Der, format: 'der', type: 'pkcs8' });
  cachedPubKey = createPublicKey(privKey);
  return cachedPubKey;
}

/**
 * createInternalServiceToken
 * @requirements [HLR-SDK-301] [LLR-SUB-001]
 */
export function createInternalServiceToken(roles: string[] = ['roles/employee'], userId: string = 'usr_test'): string {
  const secret = process.env.JWT_SECRET || DEFAULT_DEV_SECRET;
  const seed = createHash('sha256').update(secret).digest();
  const pkcs8Der = Buffer.concat([
    Buffer.from('302e020100300506032b657004220420', 'hex'),
    seed,
  ]);
  const privKey = createPrivateKey({ key: pkcs8Der, format: 'der', type: 'pkcs8' });
  const now = Math.floor(Date.now() / 1000);
  const kid = `forge-key-${seed.subarray(0, 4).toString('hex')}`;
  const header = Buffer.from(JSON.stringify({ alg: 'EdDSA', typ: 'JWT', kid })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      userId,
      email: `${userId}@forge.internal`,
      displayName: 'Test User',
      roles,
      iat: now,
      exp: now + 3600,
    })
  ).toString('base64url');
  const data = `${header}.${payload}`;
  const sig = sign(null, Buffer.from(data), privKey).toString('base64url');
  return `${data}.${sig}`;
}

/**
 * createServiceAccountToken
 * @requirements [HLR-SDK-301] [LLR-SUB-001]
 */
export function createServiceAccountToken(serviceId: string, scopes: string[] = ['*']): string {
  const secret = process.env.JWT_SECRET || DEFAULT_DEV_SECRET;
  const seed = createHash('sha256').update(secret).digest();
  const pkcs8Der = Buffer.concat([
    Buffer.from('302e020100300506032b657004220420', 'hex'),
    seed,
  ]);
  const privKey = createPrivateKey({ key: pkcs8Der, format: 'der', type: 'pkcs8' });
  const now = Math.floor(Date.now() / 1000);
  const kid = `forge-key-${seed.subarray(0, 4).toString('hex')}`;
  const header = Buffer.from(JSON.stringify({ alg: 'EdDSA', typ: 'JWT', kid })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: `service:${serviceId}`,
      userId: `svc_${serviceId}`,
      email: `${serviceId}@service.forge.internal`,
      displayName: `Service Account: ${serviceId}`,
      principal_type: 'SERVICE',
      roles: ['roles/service_worker'],
      permissions: scopes,
      iat: now,
      exp: now + 300,
    })
  ).toString('base64url');
  const data = `${header}.${payload}`;
  const sig = sign(null, Buffer.from(data), privKey).toString('base64url');
  return `${data}.${sig}`;
}

/**
 * verifySessionToken
 * @requirements [HLR-SDK-301] [LLR-SUB-001]
 */
export function verifySessionToken(token: string): { valid: boolean; payload?: any; error?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false, error: 'Malformed token structure' };
    const [headerB64, payloadB64, sigB64] = parts;
    const data = `${headerB64}.${payloadB64}`;
    const pubKey = getVerificationPublicKey();
    const isValid = verify(null, Buffer.from(data), pubKey, Buffer.from(sigB64, 'base64url'));
    if (!isValid) return { valid: false, error: 'Invalid token signature' };
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Session token expired' };
    }
    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Token verification failed' };
  }
}

/**
 * authGuard
 * @requirements [HLR-SDK-301] [LLR-SUB-001]
 */
export function authGuard(req: Request, options: AuthGuardOptions = {}): AuthGuardResult {
  const url = new URL(req.url);

  // 1. Health checks bypass
  if (url.pathname === '/health' || url.pathname.endsWith('/health')) {
    return { authenticated: true };
  }

  // 2. Explicit public paths bypass
  if (options.publicPaths && options.publicPaths.some((p) => url.pathname.startsWith(p))) {
    return { authenticated: true };
  }

  const cookieHeader = req.headers.get('cookie') || '';
  const sessionCookieName = process.env.SESSION_COOKIE_NAME || 'forge_session';
  const cookieRegex = new RegExp(`(?:^|;\\s*)(?:auth_token|${sessionCookieName}|forge_session)=([^;]+)`);
  const tokenMatch = cookieHeader.match(cookieRegex);
  const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

  // Header fallback
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const effectiveToken = token || bearerToken;

  // Construct direct-jump return URL (accounting for Caddy gateway prefix)
  const ingressPrefix = req.headers.get('x-forwarded-prefix') || '';
  const targetPath = ingressPrefix
    ? `${ingressPrefix}${url.pathname === '/' ? '' : url.pathname}`
    : url.pathname;

  const returnTarget = `${targetPath}${url.search || ''}`;
  const returnUrlParam = encodeURIComponent(returnTarget || '/portal');

  const authBase = process.env.AUTH_SERVICE_URL?.trim().replace(/\/+$/, '') || '';
  const baseRedirect = options.redirectTo || (authBase ? `${authBase}/login` : '/auth/login');
  const loginRedirectUrl = baseRedirect.includes('return_url=')
    ? baseRedirect
    : baseRedirect.includes('?')
      ? `${baseRedirect}&return_url=${returnUrlParam}`
      : `${baseRedirect}?return_url=${returnUrlParam}`;

  const isApiRequest = url.pathname.startsWith('/api/') || (req.headers.get('accept') || '').includes('application/json');

  if (!effectiveToken) {
    if (isApiRequest) {
      return {
        authenticated: false,
        response: Response.json(
          { type: 'https://tools.ietf.org/html/rfc7807', title: 'Unauthorized', status: 401, detail: 'Authentication token missing' },
          { status: 401, headers: { 'Content-Type': 'application/problem+json' } }
        ),
      };
    }
    return {
      authenticated: false,
      response: Response.redirect(loginRedirectUrl, 302),
    };
  }

  // Cryptographic Signature Verification
  const { valid, payload, error } = verifySessionToken(effectiveToken);
  if (!valid || !payload) {
    if (isApiRequest) {
      return {
        authenticated: false,
        response: Response.json(
          { type: 'https://tools.ietf.org/html/rfc7807', title: 'Unauthorized', status: 401, detail: error || 'Invalid session signature' },
          { status: 401, headers: { 'Content-Type': 'application/problem+json' } }
        ),
      };
    }
    return {
      authenticated: false,
      response: Response.redirect(loginRedirectUrl, 302),
    };
  }

  const user: AuthUser = {
    id: payload.sub || payload.userId || 'user-1',
    email: payload.email || 'user@forge.internal',
    displayName: payload.displayName || payload.name || 'Authorized User',
    roles: Array.isArray(payload.roles) ? payload.roles : ['roles/employee'],
    principalType: payload.principal_type || payload.principalType || 'EMPLOYEE',
    department: payload.department || 'Engineering',
    orgId: payload.orgId || 'org-internal',
  };

  if (options.requiredRoles && options.requiredRoles.length > 0) {
    const hasRole = options.requiredRoles.some((r) => user.roles.includes(r) || user.roles.includes('roles/super_admin'));
    if (!hasRole) {
      if (isApiRequest) {
        return {
          authenticated: false,
          user,
          response: Response.json(
            { type: 'https://tools.ietf.org/html/rfc7807', title: 'Forbidden', status: 403, detail: 'Insufficient clearance for this micro-app' },
            { status: 403, headers: { 'Content-Type': 'application/problem+json' } }
          ),
        };
      }
      return {
        authenticated: false,
        user,
        response: new Response('403 Forbidden: Insufficient clearance for this micro-app', { status: 403 }),
      };
    }
  }

  return { authenticated: true, user };
}

// ==============================================================================
// 5. Standalone Branding & Hierarchy
// ==============================================================================
/**
 * loadBrandConfig
 * @requirements [HLR-SDK-301] [LLR-SUB-001]
 */
export function loadBrandConfig() {
  return {
    name: process.env.BRAND_NAME || 'SG Forge',
    domain: process.env.BRAND_DOMAIN || 'forge.internal',
  };
}

/**
 * getScopedHierarchy
 * @requirements [HLR-SDK-301] [LLR-SUB-001]
 */
export function getScopedHierarchy(_userIdOrReq?: string | Request): ScopedHierarchyResponse {
  return {
    employee: {
      id: 'emp_01',
      displayName: 'Assigned Engineer',
      email: 'engineer@forge.internal',
      departmentName: 'Autonomous Squad',
    },
    managementChain: [
      {
        id: 'mgr_01',
        displayName: 'Engineering Lead',
        email: 'lead@forge.internal',
        roleTitle: 'Squad Lead',
      },
    ],
  };
}

const SENSITIVE_KEY_REGEX = /pass(word)?|token|secret|auth|bearer|credential|key/i;
const BEARER_REGEX = /Bearer\s+([A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*)/gi;

/**
 * redactSensitiveData
 * @requirements [HLR-SDK-301] [LLR-SUB-001]
 */
export function redactSensitiveData(data: unknown, depth = 0): unknown {
  if (depth > 6 || data === null || data === undefined) return data;
  if (typeof data === 'string') return data.replace(BEARER_REGEX, 'Bearer [REDACTED]');
  if (Array.isArray(data)) return data.map((item) => redactSensitiveData(item, depth + 1));
  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
      if (SENSITIVE_KEY_REGEX.test(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof val === 'object' && val !== null) {
        sanitized[key] = redactSensitiveData(val, depth + 1);
      } else if (typeof val === 'string') {
        sanitized[key] = val.replace(BEARER_REGEX, 'Bearer [REDACTED]');
      } else {
        sanitized[key] = val;
      }
    }
    return sanitized;
  }
  return data;
}

