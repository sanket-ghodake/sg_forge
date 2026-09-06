/**
 * @forge/portal - Tier 2 Integration: REST API Endpoints & Request Lifecycles
 * 3A Pattern (Arrange, Act, Assert) Testing Suite
 */

import { describe, expect, it } from 'bun:test';
import { createInternalServiceToken } from '@forge/sdk';
import { startPortalServer } from '../../src/server';

describe('Tier 2 Integration: Portal REST API Endpoints Lifecycle [HLR-PORTAL-201]', () => {
  it('Arrange, Act, Assert: serves /api/v1/portal/apps dynamic catalog', async () => {
    // Arrange: Start portal on ephemeral port 0
    const server = startPortalServer(0);
    const token = createInternalServiceToken(['roles/employee'], 'usr_portal_tester');

    try {
      // Act
      const res = await fetch(`http://localhost:${server.port}/api/v1/portal/apps`, {
        headers: { Cookie: `forge_session=${token}` },
      });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.ok).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    } finally {
      server.stop();
    }
  });

  it('Arrange, Act, Assert: manages full app access request lifecycle (GET, POST, CANCEL)', async () => {
    const server = startPortalServer(0);
    const token = createInternalServiceToken(['roles/employee'], 'usr_req_user');

    try {
      // 1. Create app access request
      const postRes = await fetch(`http://localhost:${server.port}/api/v1/portal/apps/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `forge_session=${token}`,
        },
        body: JSON.stringify({
          appId: 'billing',
          appName: 'Invoicing & Billing Service',
          reasonType: 'Quarterly Audit',
          notes: 'Required for fiscal close review',
        }),
      });
      expect(postRes.status).toBe(200);
      const postData = await postRes.json();
      expect(postData.ok).toBe(true);
      const requestId = postData.data.id;
      expect(requestId).toBeDefined();

      // 2. Query user access requests
      const getRes = await fetch(`http://localhost:${server.port}/api/v1/portal/apps/requests`, {
        headers: { Cookie: `forge_session=${token}` },
      });
      expect(getRes.status).toBe(200);
      const getData = await getRes.json();
      expect(getData.ok).toBe(true);
      expect(getData.data.some((r: any) => r.id === requestId)).toBe(true);

      // 3. Cancel the request
      const cancelRes = await fetch(`http://localhost:${server.port}/api/v1/portal/apps/requests/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `forge_session=${token}`,
        },
        body: JSON.stringify({ id: requestId }),
      });
      expect(cancelRes.status).toBe(200);
      const cancelData = await cancelRes.json();
      expect(cancelData.ok).toBe(true);
    } finally {
      server.stop();
    }
  });

  it('Arrange, Act, Assert: manages Developer Personal Access Token lifecycle (CREATE, LIST, REVOKE)', async () => {
    const server = startPortalServer(0);
    const token = createInternalServiceToken(['roles/employee'], 'usr_dev_token_user');

    try {
      // 1. Mint developer token
      const createRes = await fetch(`http://localhost:${server.port}/api/v1/portal/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `forge_session=${token}`,
        },
        body: JSON.stringify({ name: 'CI/CD Pipeline Integration' }),
      });
      expect(createRes.status).toBe(200);
      const createData = await createRes.json();
      expect(createData.ok).toBe(true);
      const tokenId = createData.data.item.id;
      expect(tokenId).toBeDefined();
      expect(createData.data.token).toContain('forge_pat_');

      // 2. List developer tokens
      const listRes = await fetch(`http://localhost:${server.port}/api/v1/portal/tokens`, {
        headers: { Cookie: `forge_session=${token}` },
      });
      expect(listRes.status).toBe(200);
      const listData = await listRes.json();
      expect(listData.ok).toBe(true);
      expect(listData.data.some((t: any) => t.id === tokenId)).toBe(true);

      // 3. Revoke developer token
      const revokeRes = await fetch(`http://localhost:${server.port}/api/v1/portal/tokens/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `forge_session=${token}`,
        },
        body: JSON.stringify({ id: tokenId }),
      });
      expect(revokeRes.status).toBe(200);
      const revokeData = await revokeRes.json();
      expect(revokeData.ok).toBe(true);
    } finally {
      server.stop();
    }
  });

  it('Arrange, Act, Assert: strictly guards /api/v1/portal/audit logs with RBAC', async () => {
    const server = startPortalServer(0);
    const nonAdminToken = createInternalServiceToken(['roles/employee'], 'usr_standard_staff');

    try {
      // 1. Non-admin is blocked with 403
      const blockedRes = await fetch(`http://localhost:${server.port}/api/v1/portal/audit`, {
        headers: { Cookie: `forge_session=${nonAdminToken}` },
      });
      expect(blockedRes.status).toBe(403);
    } finally {
      server.stop();
    }
  });
});
