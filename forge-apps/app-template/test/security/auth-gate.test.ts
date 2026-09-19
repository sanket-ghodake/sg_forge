/**
 * @forge/app-template - Tier 3 Security: Zero-Trust Auth Guard & RBAC Verification
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { createInternalServiceToken, createServiceAccountToken, isSafeEgressUrl, verifySessionToken } from '../../src/lib/sdk';
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

  it('Arrange, Act, Assert: rejects forged token signature with 302 redirect', async () => {
    const server = startTemplateServer(0);
    // Tamper with signed token payload
    const token = createInternalServiceToken(['roles/employee'], 'usr_template_tester');
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
    const server = startTemplateServer(0);
    const parts = createInternalServiceToken(['roles/employee'], 'usr_tampered').split('.');
    const tamperedPayload = Buffer.from(JSON.stringify({ sub: 'usr_hacked', roles: ['roles/super_admin'], exp: Math.floor(Date.now()/1000) + 3600 })).toString('base64url');
    const forgedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    try {
      const res = await fetch(`http://localhost:${server.port}/`, {
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

  it('Arrange, Act, Assert: blocks cloud metadata and SSRF addresses in isSafeEgressUrl', () => {
    expect(isSafeEgressUrl('http://169.254.169.254/latest/meta-data')).toBe(false);
    expect(isSafeEgressUrl('http://metadata.google.internal/computeMetadata/v1/')).toBe(false);
    expect(isSafeEgressUrl('http://app-template.forge.internal/api')).toBe(true);
    expect(isSafeEgressUrl('invalid-url-schema')).toBe(false);
  });

  it('Arrange, Act, Assert: generates verifiable M2M service account tokens', () => {
    const m2mToken = createServiceAccountToken('template-bot', ['templates:read']);
    const verification = verifySessionToken(m2mToken);

    expect(verification.valid).toBe(true);
    expect(verification.payload.sub).toBe('service:template-bot');
    expect(verification.payload.principal_type).toBe('SERVICE');
    expect(verification.payload.permissions).toContain('templates:read');
  });
});

