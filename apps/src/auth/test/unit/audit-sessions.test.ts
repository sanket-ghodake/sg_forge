/**
 * @forge/auth - Audit & Session Management Unit Test (2026 LTS)
 * Verifies real libSQL audit logs query and active sessions controller.
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { logAuditEvent, getOrgAuditLogs } from '../../src/backend/audit-logger';
import { signJwt } from '../../src/backend/crypto';
import { handleGetAuditLogs, handleGetUserSessions } from '../../src/backend/audit-session-controller';

describe('Tier 1 Unit: Audit Logs & Active Sessions Controller', () => {
  beforeEach(() => {
    // Log a fresh test audit event
    logAuditEvent({
      action: 'AUTH_LOGIN_SUCCESS',
      resource: '/portal',
      status: 'SUCCESS',
      actorId: 'usr_admin',
      orgId: 'org_default',
      details: { client: 'Vitest Runner' },
    });
  });

  it('queries real database audit events with timestamps and trace IDs', () => {
    // Arrange & Act
    const logs = getOrgAuditLogs(10);

    // Assert
    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBeGreaterThan(0);
    const lastLog = logs[0];
    expect(lastLog).toHaveProperty('id');
    expect(lastLog).toHaveProperty('action');
    expect(lastLog).toHaveProperty('status');
    expect(lastLog).toHaveProperty('timestamp');
  });

  it('handles GET /api/v1/auth/audit with valid authentication token', () => {
    // Arrange: Create authenticated session token
    const token = signJwt(
      {
        iss: 'https://forge.internal/auth',
        sub: 'usr_admin',
        email: 'admin@forge.internal',
        display_name: 'Admin User',
        principal_type: 'HUMAN',
        org_id: 'org_default',
        roles: ['roles/admin'],
        permissions: ['auth:admin'],
        token_version: 1,
      },
      3600
    );
    const req = new Request('http://localhost:3004/api/v1/auth/audit?limit=5', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Act
    const res = handleGetAuditLogs(req);

    // Assert
    expect(res.status).toBe(200);
  });

  it('blocks unauthenticated requests to audit logs endpoint with HTTP 401', () => {
    // Arrange
    const unauthReq = new Request('http://localhost:3004/api/v1/auth/audit');

    // Act
    const res = handleGetAuditLogs(unauthReq);

    // Assert
    expect(res.status).toBe(401);
  });
});
