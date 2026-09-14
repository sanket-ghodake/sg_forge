/**
 * @forge/sdk - Enterprise Foundation SDK: Organization Setup Client (v2.0.0 LTS)
 * Client methods for Org Profile, Dynamic Hierarchy Levels, Department Tree Nodes, and Sequential EID.
 * @requirements [HLR-AUTH-102] [LLR-DB-005] [LLR-AUTH-009]
 */

import { resolveAuthBaseUrl } from './directory-client';
import { createInternalServiceToken } from './auth-guard';

export interface OrgNodeTypeDto {
  id: string;
  org_id: string;
  name: string;
  level_order: number;
  description?: string | null;
}

export interface OrgDepartmentNodeDto {
  id: string;
  org_id: string;
  type_id: string;
  name: string;
  code?: string | null;
  parent_id?: string | null;
  path: string;
  type_name?: string;
  level_order?: number;
  employee_count?: number;
  child_count?: number;
  created_at: number;
  updated_at: number;
}

export interface OrgSetupDataDto {
  ok: boolean;
  status: string;
  organization: {
    id: string;
    name: string;
    domain: string;
    brand_name?: string | null;
    brand_tagline?: string | null;
    eid_prefix?: string;
    eid_padding?: number;
    eid_counter?: number;
    timezone?: string;
    contact_email?: string | null;
    settings?: string;
    created_at: number;
    updated_at: number;
  };
  nodeTypes: OrgNodeTypeDto[];
  nodes: OrgDepartmentNodeDto[];
}

function getInternalHeaders(userHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(userHeaders || {}) };
  const hasAuth = Object.keys(headers).some(
    (k) => k.toLowerCase() === 'authorization' || k.toLowerCase() === 'cookie'
  );
  if (!hasAuth) {
    try {
      const token = createInternalServiceToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch {}
  }
  return headers;
}

/**
 * Fetch complete organization setup (profile, level types, and department nodes).
 * @requirements [HLR-AUTH-102] [LLR-AUTH-009]
 */
export async function fetchOrgSetupData(options: {
  baseUrl?: string;
  headers?: Record<string, string>;
} = {}): Promise<OrgSetupDataDto> {
  const base = resolveAuthBaseUrl(options.baseUrl);
  const target = `${base}/api/v1/auth/org/setup`;
  const res = await fetch(target, {
    headers: getInternalHeaders({ Accept: 'application/json', ...(options.headers || {}) }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || err.error || `Failed to fetch org setup (HTTP ${res.status})`);
  }
  return await res.json();
}

/**
 * Update organization legal profile & branding identity.
 * @requirements [HLR-AUTH-102] [LLR-AUTH-009]
 */
export async function updateOrgProfileApi(
  profile: {
    name: string;
    domain: string;
    brand_name?: string;
    brand_tagline?: string;
    timezone?: string;
    contact_email?: string;
  },
  options: { baseUrl?: string; headers?: Record<string, string> } = {}
) {
  const base = resolveAuthBaseUrl(options.baseUrl);
  const target = `${base}/api/v1/auth/org/setup/profile`;
  const res = await fetch(target, {
    method: 'POST',
    headers: getInternalHeaders({ 'Content-Type': 'application/json', Accept: 'application/json', ...(options.headers || {}) }),
    body: JSON.stringify(profile),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || err.error || `Failed to update org profile (HTTP ${res.status})`);
  }
  return await res.json();
}

/**
 * Update employee identifier (EID) configuration.
 * @requirements [HLR-AUTH-102] [LLR-AUTH-009]
 */
export async function updateOrgEidConfigApi(
  config: { prefix: string; padding: number; counter?: number },
  options: { baseUrl?: string; headers?: Record<string, string> } = {}
) {
  const base = resolveAuthBaseUrl(options.baseUrl);
  const target = `${base}/api/v1/auth/org/setup/eid-config`;
  const res = await fetch(target, {
    method: 'POST',
    headers: getInternalHeaders({ 'Content-Type': 'application/json', Accept: 'application/json', ...(options.headers || {}) }),
    body: JSON.stringify(config),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || err.error || `Failed to update EID config (HTTP ${res.status})`);
  }
  return await res.json();
}

/**
 * Atomically allocates and reserves the next sequential EID string.
 * @requirements [HLR-AUTH-102] [LLR-AUTH-009]
 */
export async function generateNextEidApi(options: { baseUrl?: string; headers?: Record<string, string> } = {}): Promise<{ ok: boolean; status: string; eid: string; counter: number }> {
  const base = resolveAuthBaseUrl(options.baseUrl);
  const target = `${base}/api/v1/auth/org/setup/eid/next`;
  const res = await fetch(target, {
    method: 'POST',
    headers: getInternalHeaders({ Accept: 'application/json', ...(options.headers || {}) }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || err.error || `Failed to allocate sequential EID (HTTP ${res.status})`);
  }
  return await res.json();
}

/**
 * Preview the next formatted EID without incrementing the database counter.
 * @requirements [HLR-AUTH-102] [LLR-AUTH-009]
 */
export async function previewNextEidApi(options: { baseUrl?: string; headers?: Record<string, string> } = {}): Promise<{ ok: boolean; status: string; preview: string; nextCounter: number }> {
  const base = resolveAuthBaseUrl(options.baseUrl);
  const target = `${base}/api/v1/auth/org/setup/eid/preview`;
  const res = await fetch(target, {
    headers: getInternalHeaders({ Accept: 'application/json', ...(options.headers || {}) }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || err.error || `Failed to preview EID (HTTP ${res.status})`);
  }
  return await res.json();
}

/**
 * Create or update a dynamic hierarchy level tier (e.g. Division, Department, Team).
 * @requirements [HLR-AUTH-102] [LLR-AUTH-009]
 */
export async function upsertOrgNodeTypeApi(
  nodeType: { id?: string; name: string; level_order: number; description?: string },
  options: { baseUrl?: string; headers?: Record<string, string> } = {}
) {
  const base = resolveAuthBaseUrl(options.baseUrl);
  const target = `${base}/api/v1/auth/org/setup/node-types`;
  const res = await fetch(target, {
    method: 'POST',
    headers: getInternalHeaders({ 'Content-Type': 'application/json', Accept: 'application/json', ...(options.headers || {}) }),
    body: JSON.stringify(nodeType),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || err.error || `Failed to upsert level type (HTTP ${res.status})`);
  }
  return await res.json();
}

/**
 * Delete an unused hierarchy level type.
 * @requirements [HLR-AUTH-102] [LLR-AUTH-009]
 */
export async function deleteOrgNodeTypeApi(typeId: string, options: { baseUrl?: string; headers?: Record<string, string> } = {}) {
  const base = resolveAuthBaseUrl(options.baseUrl);
  const target = `${base}/api/v1/auth/org/setup/node-types/${encodeURIComponent(typeId)}`;
  const res = await fetch(target, {
    method: 'DELETE',
    headers: getInternalHeaders({ Accept: 'application/json', ...(options.headers || {}) }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || err.error || `Failed to delete level type (HTTP ${res.status})`);
  }
  return await res.json();
}

/**
 * Create or update a department / structural unit node.
 * @requirements [HLR-AUTH-102] [LLR-AUTH-009]
 */
export async function upsertOrgNodeApi(
  node: { id?: string; name: string; code?: string; type_id: string; parent_id?: string | null },
  options: { baseUrl?: string; headers?: Record<string, string> } = {}
) {
  const base = resolveAuthBaseUrl(options.baseUrl);
  const target = `${base}/api/v1/auth/org/setup/nodes`;
  const res = await fetch(target, {
    method: 'POST',
    headers: getInternalHeaders({ 'Content-Type': 'application/json', Accept: 'application/json', ...(options.headers || {}) }),
    body: JSON.stringify(node),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || err.error || `Failed to upsert department node (HTTP ${res.status})`);
  }
  return await res.json();
}

/**
 * Delete a department node (enforces cascade protection).
 * @requirements [HLR-AUTH-102] [LLR-AUTH-009]
 */
export async function deleteOrgNodeApi(nodeId: string, options: { baseUrl?: string; headers?: Record<string, string> } = {}) {
  const base = resolveAuthBaseUrl(options.baseUrl);
  const target = `${base}/api/v1/auth/org/setup/nodes/${encodeURIComponent(nodeId)}`;
  const res = await fetch(target, {
    method: 'DELETE',
    headers: getInternalHeaders({ Accept: 'application/json', ...(options.headers || {}) }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || err.error || `Failed to delete department node (HTTP ${res.status})`);
  }
  return await res.json();
}
