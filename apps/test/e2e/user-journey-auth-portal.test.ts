/**
 * @forge/platform - Complete Cross-Service Auth to Portal User Journey (Tier 5)
 * Live Network Loopback Test (Testing for Truth - Enterprise SRE Standard)
 * 3A Pattern (Arrange, Act, Assert)
 */

import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import { seedAuthDatabase } from '../../src/auth/src/db/seed';
import { handleLogin, handleSetPassword } from '../../src/auth/src/backend/api-handlers';
import { startPortalServer } from '../../src/portal/src/server';
import { getAuthDb } from '../../src/auth/src/db/db';
import { createSafeHandler, loadBrandConfig } from '@forge/sdk';

describe('Tier 5 E2E Journey: End-to-End Auth Gateway to Portal Live Network Handoff', () => {
  let authServer: any = null;
  let portalServer: any = null;
  let authPort: number = 0;
  let portalPort: number = 0;

  beforeEach(() => {
    seedAuthDatabase(true);
  });

  afterEach(() => {
    if (authServer) authServer.stop(true);
    if (portalServer) portalServer.stop(true);
    seedAuthDatabase(true);
  });

  it('should complete dynamic live HTTP lifecycle: unauthenticated 302 -> login -> password setup -> cookie handoff -> portal 200 OK (no redirect loop)', async () => {
    // 1. Arrange: Start live HTTP listeners on ephemeral ports (port 0 = OS assigns free port)
    const authHandler = createSafeHandler('auth-live-test', async (req) => {
      const url = new URL(req.url);
      if (url.pathname === '/api/v1/auth/login') return handleLogin(req);
      if (url.pathname === '/api/v1/auth/set-password') return handleSetPassword(req);
      return new Response('Not Found', { status: 404 });
    });

    authServer = Bun.serve({ port: 0, fetch: authHandler });
    authPort = authServer.port;

    portalServer = startPortalServer(0);
    portalPort = portalServer.port;

    const db = getAuthDb();
    const seededUser = db.query("SELECT id, email, display_name, must_change_password FROM auth_users WHERE principal_type = 'ADMIN' LIMIT 1;").get() as {
      id: string;
      email: string;
      display_name: string;
      must_change_password: number;
    };

    expect(seededUser).toBeDefined();
    expect(seededUser.must_change_password).toBe(1);

    const portalUrl = `http://localhost:${portalPort}/portal`;

    // 2. Act - Step 1: Unauthenticated request to Portal over live HTTP socket
    const initialPortalRes = await fetch(portalUrl, {
      redirect: 'manual', // Do not auto-follow to inspect the 302 redirect location
      signal: AbortSignal.timeout(3000),
    });

    // 3. Assert - Step 1: Portal returns 302 Redirect to Auth gateway
    expect(initialPortalRes.status).toBe(302);
    const redirectLocation = initialPortalRes.headers.get('location');
    expect(redirectLocation).toBeDefined();
    expect(redirectLocation).toContain('/auth/login?return_url=');

    // 4. Act - Step 2: User performs initial login on Auth server over live HTTP
    const loginRes = await fetch(`http://localhost:${authPort}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: seededUser.email,
        password: 'password123',
      }),
      signal: AbortSignal.timeout(3000),
    });

    const loginPayload = await loginRes.json();

    // 5. Assert - Step 2: First-time login intercepts with MUST_CHANGE_PASSWORD
    expect(loginRes.status).toBe(200);
    expect(loginPayload.status).toBe('MUST_CHANGE_PASSWORD');
    expect(loginPayload.tempToken).toBeDefined();

    // 6. Act - Step 3: User completes password upgrade
    const setPwdRes = await fetch(`http://localhost:${authPort}/api/v1/auth/set-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tempToken: loginPayload.tempToken,
        newPassword: 'UpgradedEnterprisePassword2026!#',
      }),
      signal: AbortSignal.timeout(3000),
    });

    const setPwdPayload = await setPwdRes.json();

    // 7. Assert - Step 3: Auth server responds with 200 and issues session cookies
    expect(setPwdRes.status).toBe(200);
    expect(setPwdPayload.status).toBe('SUCCESS');
    expect(setPwdPayload.accessToken).toBeDefined();

    // Extract cookie from Set-Cookie headers
    const setCookieHeaders = setPwdRes.headers.get('set-cookie') || '';
    expect(setCookieHeaders).toContain('forge_session=');

    // Parse the forge_session cookie value
    const match = setCookieHeaders.match(/forge_session=([^;]+)/);
    expect(match).not.toBeNull();
    const sessionCookieValue = match![1];

    // 8. Act - Step 4: Browser navigates to Portal with the received session cookie
    const authenticatedPortalRes = await fetch(portalUrl, {
      method: 'GET',
      headers: {
        'Cookie': `forge_session=${sessionCookieValue}`,
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(3000),
    });

    const brand = loadBrandConfig();
    const htmlBody = await authenticatedPortalRes.text();
    expect(htmlBody).toContain(`${brand.name} Portal`);
    expect(htmlBody).toContain(seededUser.email);
    expect(htmlBody).not.toContain('Sign In to Workspace');
  });
});
