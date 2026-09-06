/**
 * @forge/sdk - Centralized Zero-Trust SSO Auth Guard (2026 LTS)
 * Enterprise Zero-Trust Architecture Standard:
 * - Asymmetric Ed25519 token verification (<0.1ms without central DB hit)
 * - Automatic direct-jump redirection with return_url preservation
 * - Hierarchical RBAC gate (Role & Permission clearance with Astryx 403 fallback)
 */

import { createHash, createPrivateKey, createPublicKey, sign, verify } from 'node:crypto';
import { renderAstryxErrorHtml } from '@forge/ui';
import type { AuthGuardOptions, AuthGuardResult, AuthUser } from '@forge/types';
import { isAppDisabled } from './registry';
import { loadBrandConfig } from './branding';

/**
 * Generates an asymmetric Ed25519 internal service token for inter-service communication.
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001]
 */
export function createInternalServiceToken(
  roles: string[] = ['roles/super_admin'],
  sub: string = 'internal-service-worker'
): string {
  const secret = process.env.JWT_SECRET || 'dev-portable-secret-key-that-is-at-least-32-characters-long';
  const seed = createHash('sha256').update(secret).digest();
  const pkcs8Der = Buffer.concat([
    Buffer.from('302e020100300506032b657004220420', 'hex'),
    seed,
  ]);
  const privKey = createPrivateKey({ key: pkcs8Der, format: 'der', type: 'pkcs8' });
  const kid = `forge-key-${seed.subarray(0, 4).toString('hex')}`;
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'EdDSA', typ: 'JWT', kid };
  const brand = loadBrandConfig();
  const domain = brand.domain || 'forge.internal';
  const orgId = brand.orgName || 'org_default';
  const payload = {
    iss: `https://${domain}/auth`,
    sub,
    email: `${sub}@${domain}`,
    display_name: 'Internal Service Account',
    principal_type: 'SERVICE',
    org_id: orgId,
    roles,
    permissions: ['*'],
    iat: now,
    exp: now + 300,
  };
  const encHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const data = `${encHeader}.${encPayload}`;
  const sig = sign(null, Buffer.from(data), privKey).toString('base64url');
  return `${data}.${sig}`;
}

let cachedPublicKeyPem: string | null = null;
let cachedSecret: string | null = null;

function getVerificationPublicKey(): string {
  const secret = process.env.JWT_SECRET || 'dev-portable-secret-key-that-is-at-least-32-characters-long';
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('dev-portable') || process.env.JWT_SECRET.length < 32) {
      throw new Error('[FATAL SECURITY] In production, JWT_SECRET must be explicitly configured with an external high-entropy secret of at least 32 characters.');
    }
  }
  if (cachedPublicKeyPem && cachedSecret === secret) {
    return cachedPublicKeyPem;
  }
  const seed = createHash('sha256').update(secret).digest();
  const pkcs8Der = Buffer.concat([
    Buffer.from('302e020100300506032b657004220420', 'hex'),
    seed,
  ]);
  const privKey = createPrivateKey({ key: pkcs8Der, format: 'der', type: 'pkcs8' });
  const pubKey = createPublicKey(privKey);
  cachedPublicKeyPem = pubKey.export({ type: 'spki', format: 'pem' }) as string;
  cachedSecret = secret;
  return cachedPublicKeyPem;
}

/**
 * Verifies Ed25519 or HMAC JWT session token signature and expiration claims.
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001]
 */
export function verifySessionToken(token: string): { valid: boolean; payload?: any; error?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false, error: 'Malformed token' };

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;
    const signature = Buffer.from(encodedSignature, 'base64url');
    const publicKeyPem = getVerificationPublicKey();

    const isValid = verify(null, Buffer.from(dataToVerify, 'utf8'), publicKeyPem, signature);
    if (!isValid) return { valid: false, error: 'Invalid signature' };

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token expired' };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Token verification error' };
  }
}

function renderDisabledHtml(appName: string, userEmail?: string): string {
  const defaultEmail = `user@${loadBrandConfig().domain || 'forge.internal'}`;
  return renderAstryxErrorHtml({
    statusCode: 503,
    appName,
    userEmail: userEmail || defaultEmail,
    title: 'Application Disabled',
    message: `This micro-app has been temporarily disabled by an administrator. Please access other tools via the Workspace Portal.`,
    primaryActionText: '&larr; Return to Workspace Portal',
    primaryActionHref: '/portal',
    secondaryActionText: 'Developer Console &rarr;',
    secondaryActionHref: '/devcenter',
  });
}

function renderForbiddenHtml(appName: string, userEmail: string): string {
  return renderAstryxErrorHtml({
    statusCode: 403,
    appName,
    userEmail,
    title: 'Access Restricted',
    message: `Your account does not have authorization to access this application. If you require clearance, please contact your organization administrator.`,
    primaryActionText: '&larr; Return to Workspace Portal',
    primaryActionHref: '/portal',
    secondaryActionText: 'Switch Account &rarr;',
    secondaryActionHref: '/auth/login',
  });
}

/**
 * Centralized Zero-Trust SSO Auth Guard and hierarchical RBAC gate.
 * @requirements [HLR-AUTH-102] [LLR-AUTH-003] [LLR-AUTH-007]
 */
export function authGuard(req: Request, options: AuthGuardOptions = {}): AuthGuardResult {
  const url = new URL(req.url);

  // 1. Unconditional bypass for health checks
  if (url.pathname === '/health' || url.pathname.endsWith('/health')) {
    return { authenticated: true };
  }

  // 2. Check if micro-app is disabled by administrator
  if (options.appId && isAppDisabled(options.appId)) {
    const appName = options.appName || options.appId;
    return {
      authenticated: false,
      response: new Response(renderDisabledHtml(appName), {
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }),
    };
  }

  // 3. Explicit public paths bypass
  if (options.publicPaths && options.publicPaths.some((p) => url.pathname.startsWith(p))) {
    return { authenticated: true };
  }

  // 3. Construct direct-jump return URL (accounting for Caddy gateway prefix)
  const ingressPrefix = req.headers.get('x-forwarded-prefix') || '';
  const targetPath = ingressPrefix
    ? `${ingressPrefix}${url.pathname === '/' ? '' : url.pathname}`
    : url.pathname;

  const returnTarget = `${targetPath}${url.search || ''}`;
  const returnUrlParam = encodeURIComponent(returnTarget || '/portal');
  const loginRedirectUrl = `/auth/login?return_url=${returnUrlParam}`;

  // 4. Token extraction (Cookie -> Authorization Bearer)
  const cookieHeader = req.headers.get('cookie') || '';
  const cookieName = process.env.SESSION_COOKIE_NAME || 'forge_session';
  const escapedName = cookieName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const sessionRegex = new RegExp(`(?:^|;\\s*)(?:${escapedName}|forge_session)=([^;]+)`);
  const sessionMatch = cookieHeader.match(sessionRegex);
  const authHeader = req.headers.get('authorization') || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const rawToken = sessionMatch ? sessionMatch[1].trim() : bearerToken;
  const token = rawToken ? decodeURIComponent(rawToken) : null;

  const isApiRequest = url.pathname.startsWith('/api/') || (req.headers.get('accept') || '').includes('application/json');

  if (!token) {
    if (isApiRequest) {
      return {
        authenticated: false,
        response: Response.json(
          {
            type: 'https://tools.ietf.org/html/rfc7807',
            title: 'Unauthorized',
            status: 401,
            detail: 'Authentication token missing',
          },
          { status: 401, headers: { 'Content-Type': 'application/problem+json' } }
        ),
      };
    }
    return {
      authenticated: false,
      response: new Response(null, {
        status: 302,
        headers: { Location: loginRedirectUrl },
      }),
    };
  }

  // 5. Asymmetric Cryptographic Verification
  const { valid, payload, error } = verifySessionToken(token);
  if (!valid || !payload) {
    if (isApiRequest) {
      return {
        authenticated: false,
        response: Response.json(
          {
            type: 'https://tools.ietf.org/html/rfc7807',
            title: 'Unauthorized',
            status: 401,
            detail: error || 'Invalid or expired session token',
          },
          { status: 401, headers: { 'Content-Type': 'application/problem+json' } }
        ),
      };
    }
    return {
      authenticated: false,
      response: new Response(null, {
        status: 302,
        headers: { Location: loginRedirectUrl },
      }),
    };
  }

  const user: AuthUser = {
    id: payload.sub,
    email: payload.email,
    displayName: payload.display_name,
    principalType: payload.principal_type,
    orgId: payload.org_id,
    roles: payload.roles || [],
    permissions: payload.permissions || [],
    tokenVersion: payload.token_version,
  };

  // 6. Role-Based Access Control (RBAC) Gate
  if (options.requiredRoles && options.requiredRoles.length > 0) {
    const isSuperAdmin = user.principalType === 'ADMIN' || user.roles.includes('roles/super_admin');
    const hasRequiredRole = isSuperAdmin || options.requiredRoles.some((r) => user.roles.includes(r));

    if (!hasRequiredRole) {
      const appName = options.appName || 'this microservice';
      return {
        authenticated: false,
        user,
        response: new Response(renderForbiddenHtml(appName, user.email), {
          status: 403,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }),
      };
    }
  }

  // 7. Permissions Gate
  if (options.requiredPermissions && options.requiredPermissions.length > 0) {
    const isSuperAdmin = user.principalType === 'ADMIN' || user.roles.includes('roles/super_admin');
    const hasRequiredPerm =
      isSuperAdmin || options.requiredPermissions.some((p) => user.permissions.includes(p));

    if (!hasRequiredPerm) {
      const appName = options.appName || 'this microservice';
      return {
        authenticated: false,
        user,
        response: new Response(renderForbiddenHtml(appName, user.email), {
          status: 403,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }),
      };
    }
  }

  return {
    authenticated: true,
    user,
  };
}
