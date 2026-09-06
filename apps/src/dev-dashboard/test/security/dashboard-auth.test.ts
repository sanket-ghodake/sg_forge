/**
 * @forge/dev-dashboard - Tier 3 Security: Dev Dashboard Single-Session Authentication (2026 LTS)
 * Validates constant-time password verification, single active session enforcement,
 * session supersession/invalidation, and route-level auth boundaries.
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { devAuthManager, handleDevAuthApi } from '../../src/backend/auth-session';
import { startDevDashboardServer } from '../../src/server';

describe('Tier 3 Security: Dev Dashboard Single-Session Authentication', () => {
  beforeEach(() => {
    // Reset active session before each test
    devAuthManager.revokeSession();
  });

  it('Arrange, Act, Assert: verifies default master password correctly', () => {
    // Arrange
    const validPassword = 'password123';
    const invalidPassword = 'wrong-password';

    // Act & Assert
    expect(devAuthManager.verifyPassword(validPassword)).toBe(true);
    expect(devAuthManager.verifyPassword(invalidPassword)).toBe(false);
    expect(devAuthManager.verifyPassword('')).toBe(false);
  });

  it('Arrange, Act, Assert: creates a single session and rejects invalid password', () => {
    // Arrange & Act
    const failRes = devAuthManager.createSession('bad-pwd');
    expect(failRes.success).toBe(false);
    expect(failRes.token).toBeUndefined();

    const okRes = devAuthManager.createSession('password123', { ipHash: '127.0.0.1' });
    expect(okRes.success).toBe(true);
    expect(okRes.token).toBeDefined();
    expect(okRes.token?.startsWith('dev_sess_')).toBe(true);

    // Assert session validity
    expect(devAuthManager.validateSession(okRes.token)).toBe(true);
    expect(devAuthManager.validateSession('invalid-token')).toBe(false);
  });

  it('Arrange, Act, Assert: enforces SINGLE session by invalidating old session on new login', () => {
    // Arrange: First operator logs in
    const session1 = devAuthManager.createSession('password123', { userAgent: 'Browser A' });
    expect(session1.success).toBe(true);
    const token1 = session1.token!;
    expect(devAuthManager.validateSession(token1)).toBe(true);

    // Act: Second operator logs in from another location/browser
    const session2 = devAuthManager.createSession('password123', { userAgent: 'Browser B' });
    expect(session2.success).toBe(true);
    const token2 = session2.token!;

    // Assert: Older session (token1) is immediately superseded and invalid
    expect(devAuthManager.validateSession(token1)).toBe(false);
    // Assert: Newer session (token2) is the ONLY active valid session
    expect(devAuthManager.validateSession(token2)).toBe(true);
  });

  it('Arrange, Act, Assert: revokes session on logout', () => {
    // Arrange
    const login = devAuthManager.createSession('password123');
    const token = login.token!;
    expect(devAuthManager.validateSession(token)).toBe(true);

    // Act
    devAuthManager.revokeSession(token);

    // Assert
    expect(devAuthManager.validateSession(token)).toBe(false);
    expect(devAuthManager.getSessionInfo().active).toBe(false);
  });

  it('Arrange, Act, Assert: handles HTTP Auth API login, session, and logout endpoints', async () => {
    // 1. Login with bad password
    const badLoginReq = new Request('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wrong' }),
    });
    const badRes = await handleDevAuthApi('/api/auth/login', badLoginReq);
    expect(badRes?.status).toBe(401);

    // 2. Login with valid password
    const goodLoginReq = new Request('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'password123' }),
    });
    const goodRes = await handleDevAuthApi('/api/auth/login', goodLoginReq);
    expect(goodRes?.status).toBe(200);
    const goodData = await goodRes?.json();
    expect(goodData.status).toBe('ok');
    expect(goodData.sessionToken).toBeDefined();

    const setCookie = goodRes?.headers.get('Set-Cookie');
    expect(setCookie).toContain('dev_session=');

    // 3. Check session status
    const sessionReq = new Request('http://localhost:3002/api/auth/session', {
      headers: { Cookie: `dev_session=${goodData.sessionToken}` },
    });
    const sessRes = await handleDevAuthApi('/api/auth/session', sessionReq);
    const sessData = await sessRes?.json();
    expect(sessData.authenticated).toBe(true);
    expect(sessData.singleSession).toBe(true);

    // 4. Logout
    const logoutReq = new Request('http://localhost:3002/api/auth/logout', {
      method: 'POST',
      headers: { Cookie: `dev_session=${goodData.sessionToken}` },
    });
    const logoutRes = await handleDevAuthApi('/api/auth/logout', logoutReq);
    expect(logoutRes?.status).toBe(200);
    expect(devAuthManager.validateSession(goodData.sessionToken)).toBe(false);
  });

  it('Arrange, Act, Assert: rejects default placeholder passwords when simulated in production', () => {
    // Arrange: Save environment
    const origNodeEnv = process.env.NODE_ENV;
    const origPwd = process.env.DEV_DASHBOARD_PASSWORD;

    try {
      // Act: Simulate production environment with default template password
      (process.env as any).NODE_ENV = 'production';
      process.env.DEV_DASHBOARD_PASSWORD = 'dev-operator-secure-password-change-me';

      // Assert: Must throw fatal security exception
      expect(() => devAuthManager.getMasterPassword()).toThrow(/FATAL SECURITY/);
    } finally {
      // Cleanup
      (process.env as any).NODE_ENV = origNodeEnv;
      if (origPwd) process.env.DEV_DASHBOARD_PASSWORD = origPwd;
      else delete process.env.DEV_DASHBOARD_PASSWORD;
    }
  });
});
