/**
 * @forge/auth - Sliding Window Rate Limiter & Brute-Force Shield (2026 LTS)
 * Protects against credential stuffing, brute-force attacks and password spraying.
  * @requirements [HLR-AUTH-102] [LLR-AUTH-005]
 */

export interface RateLimitStatus {
  isBlocked: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
}

interface AttemptRecord {
  count: number;
  firstAttemptTime: number;
  lastAttemptTime: number;
}

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// In-memory buckets for IP and Email tracking
const ipAttempts = new Map<string, AttemptRecord>();
const emailAttempts = new Map<string, AttemptRecord>();

function getOrCleanRecord(map: Map<string, AttemptRecord>, key: string): AttemptRecord {
  const now = Date.now();
  const existing = map.get(key);

  if (!existing || now - existing.firstAttemptTime > WINDOW_MS) {
    const fresh: AttemptRecord = {
      count: 0,
      firstAttemptTime: now,
      lastAttemptTime: now,
    };
    map.set(key, fresh);
    return fresh;
  }

  return existing;
}

/**
 * checkRateLimit
 * @requirements [HLR-AUTH-102] [LLR-AUTH-005]
 */
export function checkRateLimit(ip: string, email: string): RateLimitStatus {
  const now = Date.now();
  const ipRec = getOrCleanRecord(ipAttempts, ip);
  const emailRec = getOrCleanRecord(emailAttempts, email.toLowerCase().trim());

  const maxCount = Math.max(ipRec.count, emailRec.count);

  if (maxCount >= MAX_FAILED_ATTEMPTS) {
    const oldestTime = Math.min(ipRec.firstAttemptTime, emailRec.firstAttemptTime);
    const elapsed = now - oldestTime;
    const retryAfterSeconds = Math.max(1, Math.ceil((WINDOW_MS - elapsed) / 1000));

    return {
      isBlocked: true,
      remainingAttempts: 0,
      retryAfterSeconds,
    };
  }

  return {
    isBlocked: false,
    remainingAttempts: MAX_FAILED_ATTEMPTS - maxCount,
    retryAfterSeconds: 0,
  };
}

/**
 * recordFailedAttempt
 * @requirements [HLR-AUTH-102] [LLR-AUTH-005]
 */
export function recordFailedAttempt(ip: string, email: string): void {
  const now = Date.now();
  const ipRec = getOrCleanRecord(ipAttempts, ip);
  const emailRec = getOrCleanRecord(emailAttempts, email.toLowerCase().trim());

  ipRec.count += 1;
  ipRec.lastAttemptTime = now;

  emailRec.count += 1;
  emailRec.lastAttemptTime = now;
}

/**
 * resetAttempts
 * @requirements [HLR-AUTH-102] [LLR-AUTH-005]
 */
export function resetAttempts(ip: string, email: string): void {
  ipAttempts.delete(ip);
  emailAttempts.delete(email.toLowerCase().trim());
}

/**
 * clearAllRateLimits
 * @requirements [HLR-AUTH-102] [LLR-AUTH-005]
 */
export function clearAllRateLimits(): void {
  ipAttempts.clear();
  emailAttempts.clear();
}
