/**
 * @forge-apps/code - Tier 3 Security: Zero-Trust Auth Guard & RBAC Verification
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { createInternalServiceToken } from '../../src/lib/sdk';
import { startCodeServer } from '../../src/server';

describe('Tier 3 Security: Code Workstation Zero-Trust Auth Gate', () => {
  it('Arrange, Act, Assert: blocks unauthenticated requests with 302 redirect to /auth/login preserving return_url', async () => {
    const server = startCodeServer(0);

    try {
      const res = await fetch(`http://localhost:${server.port}/editor?file=main.ts`, {
        headers: { 'x-forwarded-prefix': '/apps/code' },
        redirect: 'manual',
      });
      expect(res.status).toBe(302);
      const location = res.headers.get('location') || '';
      expect(location).toContain('/auth/login?return_url=');
      expect(decodeURIComponent(location)).toContain('/apps/code/editor?file=main.ts');
    } finally {
      server.stop();
    }
  });

  it('Arrange, Act, Assert: allows authorized employees with signed session token', async () => {
    const server = startCodeServer(0);
    const token = createInternalServiceToken(['roles/employee'], 'usr_code_tester');

    try {
      const res = await fetch(`http://localhost:${server.port}/`, {
        headers: { Cookie: `forge_session=${token}` },
      });
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain('VS Code');
    } finally {
      server.stop();
    }
  });

  it('Arrange, Act, Assert: returns 403 when user lacks required role', async () => {
    const server = startCodeServer(0);
    const token = createInternalServiceToken(['roles/external_guest'], 'usr_unauthorized');

    try {
      const res = await fetch(`http://localhost:${server.port}/`, {
        headers: { Cookie: `forge_session=${token}` },
      });
      expect(res.status).toBe(403);
    } finally {
      server.stop();
    }
  });

  it('Arrange, Act, Assert: rejects forged token signature with 302 redirect', async () => {
    const server = startCodeServer(0);
    const token = createInternalServiceToken(['roles/employee'], 'usr_code_tester');
    const parts = token.split('.');
    const forgedToken = `${parts[0]}.${parts[1]}.invalidSignatureBase64String`;

    try {
      const res = await fetch(`http://localhost:${server.port}/`, {
        headers: { Cookie: `forge_session=${forgedToken}` },
        redirect: 'manual',
      });
      expect(res.status).toBe(302);
      expect(res.headers.get('location')).toContain('/auth/login');
    } finally {
      server.stop();
    }
  });

  it('Arrange, Act, Assert: returns RFC 7807 401 for forged token on JSON API requests', async () => {
    const server = startCodeServer(0);
    const parts = createInternalServiceToken(['roles/employee'], 'usr_tampered').split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({ sub: 'usr_hacked', roles: ['roles/super_admin'], exp: Math.floor(Date.now() / 1000) + 3600 })
    ).toString('base64url');
    const forgedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    try {
      const res = await fetch(`http://localhost:${server.port}/api/projects`, {
        headers: {
          Cookie: `forge_session=${forgedToken}`,
          Accept: 'application/json',
        },
      });
      expect(res.status).toBe(401);
      const json: any = await res.json();
      expect(json.title).toBe('Unauthorized');
      expect(json.detail).toContain('signature');
    } finally {
      server.stop();
    }
  });
});

