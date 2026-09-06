/**
 * @forge/sdk - Zero-Trust Auth Guard Unit Tests (Tier 1)
 * Enterprise Standards: 3A Pattern (Arrange, Act, Assert)
 */

import { describe, expect, it } from 'bun:test';
import { authGuard } from '../../src/auth-guard';
import { signJwt } from '@forge/auth';

describe('Tier 1 Unit: Centralized Zero-Trust SSO Auth Guard', () => {
  const sampleUser = {
    sub: 'usr-dev-123',
    email: 'dev@forge.internal',
    display_name: 'Dev Tester',
    principal_type: 'EMPLOYEE' as const,
    org_id: 'org-test',
    roles: ['roles/employee'],
    permissions: ['expenses.reports.submit'],
    token_version: 1,
  };

  it('should bypass authentication for health check endpoints', () => {
    const req = new Request('http://localhost:8085/health');
    const result = authGuard(req);
    expect(result.authenticated).toBe(true);
    expect(result.response).toBeUndefined();
  });

  it('should bypass authentication for explicit public paths', () => {
    const req = new Request('http://localhost:8085/public/status');
    const result = authGuard(req, { publicPaths: ['/public'] });
    expect(result.authenticated).toBe(true);
    expect(result.response).toBeUndefined();
  });

  it('should issue 302 redirect with preserved return_url when cookie is missing', () => {
    const req = new Request('http://localhost:8085/apps/expenses?tab=history', {
      headers: { 'x-forwarded-prefix': '/apps/expenses' },
    });
    const result = authGuard(req);
    expect(result.authenticated).toBe(false);
    expect(result.response).toBeDefined();
    expect(result.response!.status).toBe(302);
    
    const location = result.response!.headers.get('location') || '';
    expect(location).toContain('/auth/login?return_url=');
    expect(decodeURIComponent(location)).toContain('/apps/expenses?tab=history');
  });

  it('should reject invalid or tampered tokens with 302 redirect', () => {
    const req = new Request('http://localhost:8085/apps/expenses', {
      headers: {
        'Cookie': 'forge_session=invalid.tampered.token',
      },
    });
    const result = authGuard(req);
    expect(result.authenticated).toBe(false);
    expect(result.response!.status).toBe(302);
  });

  it('should authenticate valid JWT session token and populate user context', () => {
    const token = signJwt(sampleUser);
    const req = new Request('http://localhost:8085/apps/expenses', {
      headers: {
        'Cookie': `forge_session=${token}`,
      },
    });
    const result = authGuard(req);
    expect(result.authenticated).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user!.email).toBe('dev@forge.internal');
    expect(result.user!.roles).toContain('roles/employee');
  });

  it('should allow access when user possesses required role', () => {
    const token = signJwt(sampleUser);
    const req = new Request('http://localhost:8085/apps/expenses', {
      headers: {
        'Cookie': `forge_session=${token}`,
      },
    });
    const result = authGuard(req, { requiredRoles: ['roles/employee'] });
    expect(result.authenticated).toBe(true);
  });

  it('should return 403 Forbidden with Astryx HTML when user lacks required role', async () => {
    const token = signJwt(sampleUser);
    const req = new Request('http://localhost:8086/apps/billing', {
      headers: {
        'Cookie': `forge_session=${token}`,
      },
    });
    const result = authGuard(req, {
      appName: 'Invoicing & Billing Service',
      requiredRoles: ['roles/billing.admin'],
    });

    expect(result.authenticated).toBe(false);
    expect(result.response).toBeDefined();
    expect(result.response!.status).toBe(403);
    const html = await result.response!.text();
    expect(html).toContain('403');
    expect(html).toContain('Access Restricted');
    expect(html).toContain('dev@forge.internal');
  });

  it('should grant ADMIN users universal clearance overriding specific role checks', () => {
    const adminUser = {
      ...sampleUser,
      principal_type: 'ADMIN' as const,
      roles: ['roles/super_admin'],
    };
    const token = signJwt(adminUser);
    const req = new Request('http://localhost:8086/apps/billing', {
      headers: {
        'Cookie': `forge_session=${token}`,
      },
    });
    const result = authGuard(req, { requiredRoles: ['roles/billing.admin'] });
    expect(result.authenticated).toBe(true);
  });
});
