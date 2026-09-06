/**
 * @forge/sdk - Tier 1 Unit: Directory & Scoped Hierarchy Client
 */

import { describe, expect, it, mock } from 'bun:test';
import {
  fetchOrgDirectory,
  getMyHierarchy,
  getScopedHierarchy,
  isManagerOf,
} from '../../src/directory-client';

describe('Tier 1 Unit: Directory & Scoped Hierarchy Client [LLR-DB-001] [HLR-SDK-302]', () => {
  it('should fetch complete organization directory', async () => {
    const mockResponse = {
      organization: { id: 'org-1', name: 'SG Forge', domain: 'forge.internal' },
      nodes: [{ id: 'node-1', name: 'Engineering', path: '/root/tech', parentId: null }],
      users: [{ id: 'usr-1', displayName: 'Alice', email: 'alice@forge.internal' }],
    };

    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify(mockResponse), { status: 200 });
    }) as any;

    try {
      const result = await fetchOrgDirectory('http://mock-auth:3004');
      expect(result.organization.name).toBe('SG Forge');
      expect(result.nodes.length).toBe(1);
      expect(result.users.length).toBe(1);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('should fetch targeted scoped hierarchy for specific user', async () => {
    const mockHierarchy = {
      status: 'SUCCESS',
      employee: { id: 'usr-alice', displayName: 'Alice Chen', email: 'alice@forge.internal' },
      managementChain: [
        { level: 1, relationship: 'LINE_MANAGER', id: 'usr-bob', displayName: 'Bob Miller', email: 'bob@forge.internal' },
      ],
      directReports: [],
      summary: { totalManagersAbove: 1, totalDirectReports: 0, isTopLevel: false },
    };

    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify(mockHierarchy), { status: 200 });
    }) as any;

    try {
      const hierarchy = await getScopedHierarchy('usr-alice', 'http://mock-auth:3004');
      expect(hierarchy.status).toBe('SUCCESS');
      expect(hierarchy.employee.id).toBe('usr-alice');
      expect(hierarchy.managementChain[0].id).toBe('usr-bob');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('should verify isManagerOf relationship accurately', async () => {
    const mockHierarchy = {
      status: 'SUCCESS',
      employee: { id: 'usr-alice', displayName: 'Alice Chen', email: 'alice@forge.internal' },
      managementChain: [
        { level: 1, relationship: 'LINE_MANAGER', id: 'usr-bob', displayName: 'Bob Miller', email: 'bob@forge.internal' },
        { level: 2, relationship: 'LINE_MANAGER', id: 'usr-superadmin', displayName: 'Alex', email: 'admin@forge.internal' },
      ],
      directReports: [],
      summary: { totalManagersAbove: 2, totalDirectReports: 0, isTopLevel: false },
    };

    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify(mockHierarchy), { status: 200 });
    }) as any;

    try {
      const isBobManager = await isManagerOf('usr-bob', 'usr-alice', 'http://mock-auth:3004');
      const isAlexManager = await isManagerOf('usr-superadmin', 'usr-alice', 'http://mock-auth:3004');
      const isStrangerManager = await isManagerOf('usr-stranger', 'usr-alice', 'http://mock-auth:3004');

      expect(isBobManager).toBe(true);
      expect(isAlexManager).toBe(true);
      expect(isStrangerManager).toBe(false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('should reject with descriptive error when directory API returns HTTP 500', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () => {
      return new Response('Internal Server Error', { status: 500 });
    }) as any;

    try {
      await expect(fetchOrgDirectory('http://mock-auth:3004')).rejects.toThrow('HTTP 500');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('should handle network timeout/rejection gracefully', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(async () => {
      throw new Error('Connection refused: ECONNREFUSED');
    }) as any;

    try {
      await expect(getScopedHierarchy('usr-1', 'http://mock-auth:3004')).rejects.toThrow('ECONNREFUSED');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

