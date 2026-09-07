/**
 * @forge/app-template - Tier 3 Security: Zero-Trust Auth Guard & RBAC Verification
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { createInternalServiceToken } from '../../src/lib/sdk';
import { startTemplateServer } from '../../src/server';

describe('Tier 3 Security: App Template Zero-Trust Auth Gate', () => {
  it('Arrange, Act, Assert: blocks unauthenticated requests with 302 redirect to /auth/login', async () => {
    const server = startTemplateServer(0);

    try {
      const res = await fetch(`http://localhost:${server.port}/`, { redirect: 'manual' });
      expect(res.status).toBe(302);
      expect(res.headers.get('location')).toContain('/auth/login');
    } finally {
      server.stop();
    }
  });

  it('Arrange, Act, Assert: allows authorized employees with signed session token', async () => {
    const server = startTemplateServer(0);
    const token = createInternalServiceToken(['roles/employee'], 'usr_template_tester');

    try {
      const res = await fetch(`http://localhost:${server.port}/`, {
        headers: { Cookie: `forge_session=${token}` },
      });
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).toContain('Forge App Template');
    } finally {
      server.stop();
    }
  });

  it('Arrange, Act, Assert: returns 403 when user lacks required role', async () => {
    const server = startTemplateServer(0);
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
});
