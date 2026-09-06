/**
 * @forge/platform - Direct-Jump Microservice SSO & RBAC Journey (Tier 5)
 * Live Network Loopback Test (Testing for Truth - Enterprise SRE Standard)
 * 3A Pattern (Arrange, Act, Assert)
 */

import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import { seedAuthDatabase } from '../../src/auth/src/db/seed';
import { handleLogin, handleSetPassword } from '../../src/auth/src/backend/api-handlers';
import { createSafeHandler, authGuard } from '@forge/sdk';

describe('Tier 5 E2E Journey: Direct-Jump Microservice SSO & RBAC Access Enforcement', () => {
  let authServer: any = null;
  let employeeAppServer: any = null;
  let adminAppServer: any = null;
  let publicAppServer: any = null;

  beforeEach(() => {
    seedAuthDatabase(true);
  });

  afterEach(() => {
    if (authServer) authServer.stop(true);
    if (employeeAppServer) employeeAppServer.stop(true);
    if (adminAppServer) adminAppServer.stop(true);
    if (publicAppServer) publicAppServer.stop(true);
  });

  it('should redirect unauthenticated jump, establish SSO session, enforce RBAC, and serve public apps without auth', async () => {
    // 1. Arrange: Start live HTTP listeners on ephemeral ports
    const authHandler = createSafeHandler('auth-live-test', async (req) => {
      const url = new URL(req.url);
      if (url.pathname === '/api/v1/auth/login') return handleLogin(req);
      if (url.pathname === '/api/v1/auth/set-password') return handleSetPassword(req);
      return new Response('Not Found', { status: 404 });
    });

    authServer = Bun.serve({ port: 0, fetch: authHandler });

    // Public app (no auth needed)
    publicAppServer = Bun.serve({
      port: 0,
      fetch: createSafeHandler('public-test-app', async () => {
        return new Response('<html><body>PUBLIC ACCESS - Telemetry Overview</body></html>', {
          headers: { 'Content-Type': 'text/html' },
        });
      }),
    });

    // Employee-level protected app (requires employee role)
    employeeAppServer = Bun.serve({
      port: 0,
      fetch: createSafeHandler('employee-test-app', async (req) => {
        const guard = authGuard(req, { requiredRoles: ['roles/employee'] });
        if (!guard.authenticated && guard.response) return guard.response;
        const user = guard.user;
        return new Response(`<html><body><h1>Employee Portal Workspace</h1><p>${user?.email}</p></body></html>`, {
          headers: { 'Content-Type': 'text/html' },
        });
      }),
    });

    // Admin-level protected app (requires admin role)
    adminAppServer = Bun.serve({
      port: 0,
      fetch: createSafeHandler('admin-test-app', async (req) => {
        const guard = authGuard(req, { requiredRoles: ['roles/super_admin'] });
        if (!guard.authenticated && guard.response) return guard.response;
        const user = guard.user;
        return new Response(`<html><body><h1>Admin Control Center</h1><p>${user?.email}</p></body></html>`, {
          headers: { 'Content-Type': 'text/html' },
        });
      }),
    });

    const publicUrl = `http://localhost:${publicAppServer.port}/apps/telemetry`;
    const employeeAppUrl = `http://localhost:${employeeAppServer.port}/apps/code`;
    const adminAppUrl = `http://localhost:${adminAppServer.port}/apps/admin`;

    // 2. Act - Step 1: Public App access (Telemetry) requires NO auth
    const publicRes = await fetch(publicUrl, { signal: AbortSignal.timeout(3000) });
    expect(publicRes.status).toBe(200);
    const publicHtml = await publicRes.text();
    expect(publicHtml).toContain('PUBLIC ACCESS');

    // 3. Act - Step 2: Unauthenticated jump to Protected App (redirects to login)
    const initialJumpRes = await fetch(employeeAppUrl, { redirect: 'manual', signal: AbortSignal.timeout(3000) });
    expect(initialJumpRes.status).toBe(302);
    const redirectLocation = initialJumpRes.headers.get('location');
    expect(redirectLocation).toContain('/auth/login?return_url=');

    // 4. Act - Step 3: Login as standard employee (Alice)
    const loginRes = await fetch(`http://localhost:${authServer.port}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice.eng@forge.internal', password: 'password123' }),
      signal: AbortSignal.timeout(3000),
    });
    const loginData = await loginRes.json();

    const setPwdRes = await fetch(`http://localhost:${authServer.port}/api/v1/auth/set-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempToken: loginData.tempToken, newPassword: 'AliceNewSecurePass9988!#' }),
      signal: AbortSignal.timeout(3000),
    });
    const setCookie = setPwdRes.headers.get('set-cookie') || '';
    const match = setCookie.match(/forge_session=([^;]+)/);
    expect(match).not.toBeNull();
    const aliceSession = match![1];

    // 5. Act - Step 4: Access Employee App with Alice's session cookie -> 200 OK
    const authedEmployeeRes = await fetch(employeeAppUrl, {
      headers: { Cookie: `forge_session=${aliceSession}` },
      redirect: 'manual',
      signal: AbortSignal.timeout(3000),
    });
    expect(authedEmployeeRes.status).toBe(200);
    const employeeHtml = await authedEmployeeRes.text();
    expect(employeeHtml).toContain('alice.eng@forge.internal');
    expect(employeeHtml).toContain('Employee Portal Workspace');

    // 6. Act - Step 5: Jump to Admin-Only App with same session (Alice lacks super_admin role) -> 403 Forbidden
    const forbiddenAdminRes = await fetch(adminAppUrl, {
      headers: { Cookie: `forge_session=${aliceSession}` },
      redirect: 'manual',
      signal: AbortSignal.timeout(3000),
    });
    expect(forbiddenAdminRes.status).toBe(403);
    const forbiddenHtml = await forbiddenAdminRes.text();
    expect(forbiddenHtml).toContain('403');
    expect(forbiddenHtml).toContain('Access Restricted');
    expect(forbiddenHtml).toContain('alice.eng@forge.internal');

    // 7. Act - Step 6: Login as Super Admin (Rajesh)
    const adminLogin = await fetch(`http://localhost:${authServer.port}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@forge.internal', password: 'password123' }),
      signal: AbortSignal.timeout(3000),
    });
    const adminData = await adminLogin.json();

    const adminSetPwd = await fetch(`http://localhost:${authServer.port}/api/v1/auth/set-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempToken: adminData.tempToken, newPassword: 'SuperAdminPass2026!#' }),
      signal: AbortSignal.timeout(3000),
    });
    const adminCookie = (adminSetPwd.headers.get('set-cookie') || '').match(/forge_session=([^;]+)/)![1];

    // 8. Act - Step 7: Access Admin App with Rajesh's session -> 200 OK
    const adminOkRes = await fetch(adminAppUrl, {
      headers: { Cookie: `forge_session=${adminCookie}` },
      redirect: 'manual',
      signal: AbortSignal.timeout(3000),
    });
    expect(adminOkRes.status).toBe(200);
    const adminHtml = await adminOkRes.text();
    expect(adminHtml).toContain('superadmin@forge.internal');
    expect(adminHtml).toContain('Admin Control Center');
  });
});
