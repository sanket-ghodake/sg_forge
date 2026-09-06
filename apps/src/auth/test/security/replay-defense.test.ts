/**
 * @forge/auth/test/security - Token Replay Attack Defense & Family Invalidation (Tier 3)
 * 3A Pattern (Arrange, Act, Assert)
 */

import { describe, expect, it, beforeEach } from 'bun:test';
import { seedAuthDatabase } from '../../src/db/seed';
import { createSession, rotateRefreshToken, getUserActiveSessions } from '../../src/backend/session-manager';

describe('Tier 3 Security: Token Replay Attack Detection & Family Invalidation [LLR-AUTH-004]', () => {
  beforeEach(() => {
    seedAuthDatabase(true);
  });

  it('should detect token theft and revoke the entire token family when a consumed token is replayed', () => {
    // 1. Arrange: Legit user logs in and rotates token
    const initialSession = createSession('usr-superadmin', 'Legit Laptop', '127.0.0.1');
    const tokenGen1 = initialSession!.refreshToken;

    const rotationResult = rotateRefreshToken(tokenGen1, 'Legit Laptop', '127.0.0.1');
    expect('error' in rotationResult).toBe(false);
    const tokenGen2 = (rotationResult as any).refreshToken;

    // 2. Act: Hacker gets hold of compromised tokenGen1 and attempts to rotate it again
    const hackerAttempt = rotateRefreshToken(tokenGen1, 'Hacker Device', '198.51.100.25');

    // 3. Assert: Hacker is rejected with REPLAY_DETECTED
    expect('error' in hackerAttempt).toBe(true);
    expect((hackerAttempt as any).error).toContain('revoked');

    // 4. Assert: Legit user's tokenGen2 is also invalidated to protect the account
    const legitUserNextAttempt = rotateRefreshToken(tokenGen2, 'Legit Laptop', '127.0.0.1');
    expect('error' in legitUserNextAttempt).toBe(true);

    const activeSessions = getUserActiveSessions('usr-superadmin');
    expect(activeSessions.length).toBe(0);
  });
});
