/**
 * @forge/portal - API Security Middleware (2026 LTS)
 * Hardened CSRF Cross-Origin State Mutation Guard & In-Memory Sliding-Window Rate Limiter
 *
 * @requirements [HLR-PORTAL-201] [LLR-UI-001] [SR-SEC-001]
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitBuckets = new Map<string, RateLimitRecord>();

/**
 * Validates state-changing requests (POST, PUT, PATCH, DELETE) against CSRF and cross-site tampering.
 * @requirements [HLR-PORTAL-201] [SR-SEC-001]
 */
export function validateMutatingRequest(req: Request): Response | null {
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return null;
  }

  // 1. Check Fetch Metadata (W3C standard supported across modern browsers)
  const secFetchSite = req.headers.get('sec-fetch-site');
  if (secFetchSite === 'cross-site') {
    return Response.json(
      {
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Forbidden',
        status: 403,
        detail: 'Cross-site state modification blocked by Portal CSRF defense',
      },
      {
        status: 403,
        headers: { 'Content-Type': 'application/problem+json' },
      }
    );
  }

  // 2. Custom Anti-Tamper Header bypass (allowed for programmatic API / tools)
  const hasCustomHeader =
    req.headers.has('x-requested-with') ||
    req.headers.has('x-forge-action') ||
    req.headers.get('content-type')?.includes('application/json');

  // 3. Origin verification
  const origin = req.headers.get('origin');
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const host = originUrl.hostname;
      const isAllowedHost =
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host.endsWith('.local') ||
        host.includes('forge') ||
        (process.env.BRAND_DOMAIN && host === process.env.BRAND_DOMAIN);

      if (!isAllowedHost && !hasCustomHeader) {
        return Response.json(
          {
            type: 'https://tools.ietf.org/html/rfc7807',
            title: 'Forbidden',
            status: 403,
            detail: 'Origin not recognized by Portal CSRF defense',
          },
          {
            status: 403,
            headers: { 'Content-Type': 'application/problem+json' },
          }
        );
      }
    } catch {
      return Response.json(
        {
          type: 'https://tools.ietf.org/html/rfc7807',
          title: 'Forbidden',
          status: 403,
          detail: 'Malformed origin header',
        },
        {
          status: 403,
          headers: { 'Content-Type': 'application/problem+json' },
        }
      );
    }
  }

  return null;
}

/**
 * Sliding-window rate limiter for high-traffic or resource-intensive portal API queries.
 * @requirements [HLR-PORTAL-201] [SR-SEC-001]
 */
export function checkPortalRateLimit(
  key: string,
  maxRequests: number = 60,
  windowSeconds: number = 60
): Response | null {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const cutoff = now - windowMs;

  let record = rateLimitBuckets.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitBuckets.set(key, record);
  }

  // Filter expired timestamps
  record.timestamps = record.timestamps.filter((ts) => ts > cutoff);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const retryAfter = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return Response.json(
      {
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Too Many Requests',
        status: 429,
        detail: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowSeconds}s window.`,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Content-Type': 'application/problem+json',
          'Retry-After': String(retryAfter),
        },
      }
    );
  }

  record.timestamps.push(now);
  return null;
}

/**
 * Reset rate limit cache (used exclusively in test suites)
 */
export function resetRateLimitBuckets(): void {
  rateLimitBuckets.clear();
}

/**
 * Sanitizes and masks employee PII for non-privileged callers.
 * Privileged roles ('roles/admin', 'roles/hr', 'roles/executive', 'roles/security_officer') view unmasked records.
 * Standard callers receive masked emails (e.g. j***e@domain.com) and stripped metadata.
 * @requirements [HLR-PORTAL-201] [SR-SEC-001]
 */
export function sanitizeEmployeeDirectory(
  members: any[],
  callerRoles: string[] = []
): any[] {
  const isPrivileged = callerRoles.some((r) =>
    ['roles/admin', 'roles/hr', 'roles/executive', 'roles/security_officer', 'roles/super_admin'].includes(r)
  );
  if (isPrivileged) return members;

  return members.map((m) => {
    const email = m.email || '';
    let maskedEmail = email;
    if (email.includes('@')) {
      const [local, domain] = email.split('@');
      if (local.length <= 2) {
        maskedEmail = `${local[0]}***@${domain}`;
      } else {
        maskedEmail = `${local[0]}${'*'.repeat(Math.min(local.length - 2, 5))}${local[local.length - 1]}@${domain}`;
      }
    }
    return {
      ...m,
      email: maskedEmail,
      phone: undefined,
      personal_email: undefined,
      salary: undefined,
    };
  });
}

