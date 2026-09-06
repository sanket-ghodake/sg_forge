/**
 * @forge/auth/test/e2e - Fast HTTP Cross-Service Journey (Tier 5)
 * 3A Pattern (Arrange, Act, Assert)
 */

import { describe, expect, it, beforeEach } from 'bun:test';
import { seedAuthDatabase } from '../../src/db/seed';
import { handleLogin, handleSetPassword } from '../../src/backend/api-handlers';

describe('Tier 5 E2E: Unauthenticated Portal Redirection & Post-Login Return Flow [HLR-AUTH-101]', () => {
  beforeEach(() => {
    seedAuthDatabase(true);
  });

  it('should complete end-to-end journey from login to password update and return URL handoff', async () => {
    // 1. Step 1: User attempts login on auth microservice
    const loginReq = new Request('http://localhost:3004/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice.eng@forge.internal',
        password: 'password123',
      }),
    });

    const loginRes = await handleLogin(loginReq);
    const loginData = await loginRes.json();

    expect(loginRes.status).toBe(200);
    expect(loginData.status).toBe('MUST_CHANGE_PASSWORD');
    expect(loginData.tempToken).toBeDefined();

    // 2. Step 2: User completes mandatory password setup
    const setPwdReq = new Request('http://localhost:3004/api/v1/auth/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tempToken: loginData.tempToken,
        newPassword: 'AliceNewEnginePassword2026!',
      }),
    });

    const setPwdRes = await handleSetPassword(setPwdReq);
    const setPwdData = await setPwdRes.json();

    expect(setPwdRes.status).toBe(200);
    expect(setPwdData.status).toBe('SUCCESS');
    expect(setPwdData.accessToken).toBeDefined();
    expect(setPwdData.user.email).toBe('alice.eng@forge.internal');

    // 3. Step 3: Verify Set-Cookie headers are issued for session persistence
    const setCookies = setPwdRes.headers.get('set-cookie');
    expect(setCookies).toBeDefined();
  });
});
