/**
 * @forge/platform - Token Rotation & Replay Attack Defense User Journey (Tier 5)
 * Dynamic, non-hardcoded multi-device session simulation using 3A Pattern.
 */

import { describe, expect, it, beforeEach } from 'bun:test';
import { seedAuthDatabase } from '../../src/auth/src/db/seed';
import { handleLogin, handleSetPassword, handleRefresh } from '../../src/auth/src/backend/api-handlers';
import { getAuthDb } from '../../src/auth/src/db/db';

describe('Tier 5 E2E Journey: Session Rotation & Attack Replay Family Invalidation', () => {
  beforeEach(() => {
    seedAuthDatabase(true);
  });

  it('should detect token replay and automatically revoke the entire compromised session family', async () => {
    // 1. Arrange: Authenticate legitimate user
    const db = getAuthDb();
    const user = db.query("SELECT email FROM auth_users WHERE email LIKE '%admin%' LIMIT 1;").get() as { email: string };

    const loginRes = await handleLogin(new Request('http://localhost:3004/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password: 'password123' }),
    }));
    const loginData = await loginRes.json();

    const setPwdRes = await handleSetPassword(new Request('http://localhost:3004/api/v1/auth/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempToken: loginData.tempToken, newPassword: 'StrongPassword9988!@#' }),
    }));

    // Extract original refresh token from Set-Cookie header
    const setCookie = setPwdRes.headers.get('set-cookie') || '';
    const match = setCookie.match(/forge_refresh_token=([^;]+)/);
    const originalRefreshToken = match ? match[1] : '';
    expect(originalRefreshToken.length).toBeGreaterThan(10);

    // 2. Act - Step 1: Legitimate client rotates refresh token
    const rotateRes1 = await handleRefresh(new Request('http://localhost:3004/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Cookie': `forge_refresh_token=${originalRefreshToken}`,
      },
    }));
    const rotateData1 = await rotateRes1.json();

    // 3. Assert - Step 1: Token rotated successfully with new tokens issued
    expect(rotateRes1.status).toBe(200);
    expect(rotateData1.accessToken).toBeDefined();

    const newSetCookie = rotateRes1.headers.get('set-cookie') || '';
    const newMatch = newSetCookie.match(/forge_refresh_token=([^;]+)/);
    const secondaryRefreshToken = newMatch ? newMatch[1] : '';
    expect(secondaryRefreshToken).not.toBe(originalRefreshToken);

    // 4. Act - Step 2: Adversary attempts replay attack using original (now stale) refresh token
    const replayRes = await handleRefresh(new Request('http://localhost:3004/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Cookie': `forge_refresh_token=${originalRefreshToken}`,
      },
    }));

    // 5. Assert - Step 2: System rejects replay attack with RFC 7807 problem details
    expect(replayRes.status).toBe(401);
    const replayProblem = await replayRes.json();
    expect(replayProblem.title).toContain('Unauthorized');

    // 6. Act - Step 3: Legitimate client attempts to use secondary refresh token from revoked family
    const subsequentRes = await handleRefresh(new Request('http://localhost:3004/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Cookie': `forge_refresh_token=${secondaryRefreshToken}`,
      },
    }));

    // 7. Assert - Step 3: Compromised family is entirely purged, protecting user accounts
    expect(subsequentRes.status).toBe(401);
  });
});
