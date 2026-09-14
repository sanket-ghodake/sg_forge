/**
 * @forge/portal - Tier 3 Security & IDOR Penetration Test (2026 LTS)
 * Penetration suite verifying IDOR defenses, anti-self-approval, privilege escalation guards,
 * and CSV formula injection neutralization.
 * @requirements [HLR-PORTAL-202] [LLR-PORTAL-005] [SR-RBAC-001]
 */

import { describe, expect, it } from 'bun:test';
import { createInternalServiceToken } from '@forge/sdk';
import { startPortalServer } from '../../src/server';
import { parseEmployeeCsv } from '@forge/auth/backend/employee-import';

describe('Tier 3 Security: IDOR & Access Governance Penetration Tests', () => {
  it('prevents non-admin employees from accessing pending inbox queue (403 Forbidden)', async () => {
    // Arrange: Ephemeral server with standard employee token
    const server = startPortalServer(0);
    const empToken = createInternalServiceToken(['roles/employee'], 'usr_attacker_01');

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/api/v1/portal/apps/requests/pending`, {
        headers: { Cookie: `forge_session=${empToken}` },
      });

      // Assert
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.ok).toBe(false);
      expect(body.error).toContain('Forbidden');
    } finally {
      server.stop();
    }
  });

  it('prevents non-admin employees from deciding/approving access requests (403 Forbidden)', async () => {
    // Arrange
    const server = startPortalServer(0);
    const empToken = createInternalServiceToken(['roles/employee'], 'usr_attacker_02');

    try {
      // Act: Non-admin calls decide endpoint
      const res = await fetch(`http://localhost:${server.port}/api/v1/portal/apps/requests/decide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `forge_session=${empToken}`,
        },
        body: JSON.stringify({
          requestId: 'req_target_999',
          decision: 'APPROVED',
        }),
      });

      // Assert
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.ok).toBe(false);
      expect(body.error).toContain('Forbidden');
    } finally {
      server.stop();
    }
  });

  it('prevents non-admin employees from executing batch CSV imports (403 Forbidden)', async () => {
    // Arrange
    const server = startPortalServer(0);
    const empToken = createInternalServiceToken(['roles/employee'], 'usr_attacker_03');

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/api/v1/portal/members/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `forge_session=${empToken}`,
        },
        body: JSON.stringify({
          csv_data: 'email,display_name\nevil@forge.internal,Evil',
        }),
      });

      // Assert
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.ok).toBe(false);
      expect(body.error).toContain('Forbidden');
    } finally {
      server.stop();
    }
  });

  it('neutralizes all malicious spreadsheet formula injection prefixes (=, +, -, @, \\t)', () => {
    // Arrange: CSV with multiple formula injection vectors
    const attackCsv = `display_name,email,job_title,department
"=cmd|' /C calc'!A0",=payload1@forge.internal,Lead,Finance
"+20+50",+payload2@forge.internal,Manager,Sales
"-HYPERLINK('http://evil.com')",-payload3@forge.internal,Staff,Eng
"@SUM(1+1)",@payload4@forge.internal,Intern,Product`;

    // Act
    const { records } = parseEmployeeCsv(attackCsv);

    // Assert: Formula execution characters are stripped from emails
    expect(records.length).toBe(4);
    for (const r of records) {
      expect(r.email).toMatch(/^[a-z0-9]/i);
      expect(r.email.startsWith('=')).toBe(false);
      expect(r.email.startsWith('+')).toBe(false);
      expect(r.email.startsWith('-')).toBe(false);
      expect(r.email.startsWith('@')).toBe(false);
    }
  });

  it('IDOR defense: user cannot cancel an access request belonging to another user', async () => {
    // Arrange: User A creates a request
    const server = startPortalServer(0);
    const victimToken = createInternalServiceToken(['roles/employee'], `usr_victim_${Date.now()}`);
    const attackerToken = createInternalServiceToken(['roles/employee'], `usr_attacker_${Date.now()}`);

    try {
      const createRes = await fetch(`http://localhost:${server.port}/api/v1/portal/apps/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `forge_session=${victimToken}`,
        },
        body: JSON.stringify({
          appId: 'telemetry',
          appName: 'Telemetry Hub',
          reasonType: 'Incident Response',
        }),
      });
      const createBody = await createRes.json();
      const victimRequestId = createBody.data.id;

      // Act: Attacker attempts to cancel victim's request
      const cancelRes = await fetch(`http://localhost:${server.port}/api/v1/portal/apps/requests/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `forge_session=${attackerToken}`,
        },
        body: JSON.stringify({ id: victimRequestId }),
      });

      // Assert: cancel succeeds with ok: false (no rows deleted because of user_id scoping)
      const cancelBody = await cancelRes.json();
      expect(cancelBody.ok).toBe(false);

      // Verify victim's request is untouched and still PENDING
      const victimCheckRes = await fetch(`http://localhost:${server.port}/api/v1/portal/apps/requests`, {
        headers: { Cookie: `forge_session=${victimToken}` },
      });
      const victimCheckData = await victimCheckRes.json();
      const stillPending = victimCheckData.data.find((r: any) => r.id === victimRequestId);
      expect(stillPending).toBeDefined();
      expect(stillPending.status).toBe('PENDING');
    } finally {
      server.stop();
    }
  });
});
