/**
 * @forge/sdk - Enterprise Foundation SDK: Directory & Org Hierarchy Client (v2.0.0 LTS)
 * Enterprise IAM Standard:
 * - Real Org tree retrieval with progressive depth bounding
 * - Scoped employee hierarchy retrieval (Linear upward management chain + direct reports)
 * - Organization directory, search & CRUD client
 * - Fast deterministic approval chain validation (isManagerOf)
 */

import { existsSync } from 'node:fs';
import type { OrgDirectoryResponse, ScopedHierarchyResponse } from '@forge/types';
import { createInternalServiceToken } from './auth-guard';

/** @requirements [HLR-AUTH-102] [LLR-DB-005] */
export interface OrgTreeNodeDto {
  id: string;
  name: string;
  email: string;
  title: string;
  employeeCode?: string;
  department: string;
  division: string;
  managerId: string | null;
  level: number;
  status: 'ONLINE' | 'BUSY' | 'AWAY' | 'OFFLINE';
  directReportCount: number;
  totalSubtreeCount: number;
  hasMoreChildren: boolean;
  children: OrgTreeNodeDto[];
}

/** @requirements [HLR-AUTH-102] [LLR-DB-005] */
export interface OrgTreeResponseDto {
  organizationName: string;
  totalEmployees: number;
  maxRenderedDepth: number;
  divisions: Array<{ name: string; headCount: number }>;
  root: OrgTreeNodeDto | null;
}

/** @requirements [HLR-AUTH-102] [LLR-DB-005] */
export interface EmployeeListItemDto {
  id: string;
  org_id: string;
  email: string;
  display_name: string;
  principal_type: string;
  status: string;
  must_change_password: number;
  token_version: number;
  job_title: string | null;
  employee_code: string | null;
  org_node_id: string | null;
  department_name: string | null;
  department_path: string | null;
  manager_id: string | null;
  manager_name: string | null;
  manager_email: string | null;
  roles: string[];
  created_at: number;
  updated_at: number;
}

/** @requirements [HLR-AUTH-102] [LLR-DB-005] */
export interface ListEmployeesResponseDto {
  ok: boolean;
  status: string;
  items: EmployeeListItemDto[];
  total: number;
  departments: Array<{ id: string; name: string; code?: string; path?: string }>;
}

/**
 * Resolves the base URL for the Identity and Auth service.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export function resolveAuthBaseUrl(customUrl?: string): string {
  if (customUrl) return customUrl.replace(/\/+$/, '');
  const envUrl = process.env.TEST_AUTH_SERVICE_URL || process.env.AUTH_SERVICE_URL || process.env.NEXT_PUBLIC_AUTH_URL;
  if (envUrl) return envUrl.replace(/\/+$/, '');
  const authPort = process.env.AUTH_PORT || 3004;

  const isDocker =
    process.env.DOCKER_CONTAINER === 'true' ||
    process.env.IS_DOCKER === 'true' ||
    existsSync('/.dockerenv');

  const authHost = process.env.AUTH_HOST || (isDocker ? 'auth' : 'localhost');
  return `http://${authHost}:${authPort}`;
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
    } catch {
      // Ignore if crypto token generation is not available in environment
    }
  }
  return headers;
}

/**
 * Fetch the complete progressive organizational tree from the Auth service.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export async function fetchOrgTree(options: {
  maxDepth?: number;
  rootId?: string;
  department?: string;
  baseUrl?: string;
  headers?: Record<string, string>;
} = {}): Promise<OrgTreeResponseDto> {
  const base = resolveAuthBaseUrl(options.baseUrl);
  const params = new URLSearchParams();
  if (options.maxDepth) params.set('max_depth', String(options.maxDepth));
  if (options.rootId) params.set('root_id', options.rootId);
  if (options.department) params.set('department', options.department);

  const target = `${base}/api/v1/auth/org/tree?${params.toString()}`;
  const res = await fetch(target, {
    headers: getInternalHeaders({ Accept: 'application/json', ...(options.headers || {}) }),
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch org tree from ${target} (HTTP ${res.status})`);
  }

  const json = (await res.json()) as any;
  return (json.data || json) as OrgTreeResponseDto;
}

/**
 * List, search, and filter employees from the central Auth service.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export async function fetchEmployeesList(params: {
  search?: string;
  departmentId?: string;
  status?: string;
  limit?: number;
  offset?: number;
  baseUrl?: string;
  headers?: Record<string, string>;
} = {}): Promise<ListEmployeesResponseDto> {
  const base = resolveAuthBaseUrl(params.baseUrl);
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.departmentId) qs.set('departmentId', params.departmentId);
  if (params.status) qs.set('status', params.status);
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.offset) qs.set('offset', String(params.offset));

  const target = `${base}/api/v1/auth/org/employees?${qs.toString()}`;
  const res = await fetch(target, {
    headers: getInternalHeaders({ Accept: 'application/json', ...(params.headers || {}) }),
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch employee list from ${target} (HTTP ${res.status})`);
  }

  return (await res.json()) as ListEmployeesResponseDto;
}

/**
 * Fetch employee hierarchy & management chain from the Auth service.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export async function fetchEmployeeHierarchy(
  userId: string,
  options: { baseUrl?: string; headers?: Record<string, string> } = {}
) {
  const base = resolveAuthBaseUrl(options.baseUrl);
  const target = `${base}/api/v1/auth/org/employees/${encodeURIComponent(userId)}`;
  const res = await fetch(target, {
    headers: getInternalHeaders({ Accept: 'application/json', ...(options.headers || {}) }),
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch employee ${userId} (HTTP ${res.status})`);
  }

  return await res.json();
}

/**
 * Create a new employee via the Auth service.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export async function createEmployeeApi(
  payload: {
    display_name: string;
    email: string;
    job_title: string;
    employee_code?: string;
    department_id?: string;
    manager_id?: string;
    role?: string;
    status?: string;
  },
  options: { baseUrl?: string; headers?: Record<string, string> } = {}
) {
  const base = resolveAuthBaseUrl(options.baseUrl);
  const target = `${base}/api/v1/auth/org/employees`;
  const res = await fetch(target, {
    method: 'POST',
    headers: getInternalHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    }),
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || err.error || `Failed to create employee (HTTP ${res.status})`);
  }

  return await res.json();
}

/**
 * Update an existing employee via the Auth service.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export async function updateEmployeeApi(
  userId: string,
  payload: Record<string, any>,
  options: { baseUrl?: string; headers?: Record<string, string> } = {}
) {
  const base = resolveAuthBaseUrl(options.baseUrl);
  const target = `${base}/api/v1/auth/org/employees/${encodeURIComponent(userId)}`;
  const res = await fetch(target, {
    method: 'PATCH',
    headers: getInternalHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    }),
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || err.error || `Failed to update employee (HTTP ${res.status})`);
  }

  return await res.json();
}

/**
 * Invalidate an employee's active sessions.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export async function revokeEmployeeSessionsApi(
  userId: string,
  options: { baseUrl?: string; headers?: Record<string, string> } = {}
) {
  const base = resolveAuthBaseUrl(options.baseUrl);
  const target = `${base}/api/v1/auth/org/employees/${encodeURIComponent(userId)}/revoke`;
  const res = await fetch(target, {
    method: 'POST',
    headers: getInternalHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    }),
    body: JSON.stringify({ id: userId }),
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || err.error || `Failed to revoke sessions (HTTP ${res.status})`);
  }

  return await res.json();
}

/**
 * Ingest bulk CSV / JSON employee records via the Auth service.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export async function batchImportEmployeesApi(
  records: any[],
  importOptions: Record<string, any> = {},
  options: { baseUrl?: string; headers?: Record<string, string> } = {}
) {
  const base = resolveAuthBaseUrl(options.baseUrl);
  const target = `${base}/api/v1/auth/org/employees/import`;
  const res = await fetch(target, {
    method: 'POST',
    headers: getInternalHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    }),
    body: JSON.stringify({ records, options: importOptions }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || err.error || `Failed to batch import (HTTP ${res.status})`);
  }

  return await res.json();
}

/**
 * Execute a bulk action (activate, suspend, revoke) on multiple employee accounts.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export async function bulkActionEmployeesApi(
  action: 'activate' | 'suspend' | 'revoke',
  userIds: string[],
  options: { orgId?: string; baseUrl?: string; headers?: Record<string, string> } = {}
) {
  const base = resolveAuthBaseUrl(options.baseUrl);
  const target = `${base}/api/v1/auth/org/employees/bulk-action`;
  const res = await fetch(target, {
    method: 'POST',
    headers: getInternalHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    }),
    body: JSON.stringify({ action, userIds, orgId: options.orgId || 'org_main' }),
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || err.error || `Failed to execute bulk action (HTTP ${res.status})`);
  }

  return await res.json();
}

/**
 * Fetch the complete organization directory and department tree (Legacy alias).
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export async function fetchOrgDirectory(baseUrl?: string): Promise<OrgDirectoryResponse> {
  const target = `${resolveAuthBaseUrl(baseUrl)}/api/v1/auth/directory`;
  const res = await fetch(target, {
    headers: getInternalHeaders({ Accept: 'application/json' }),
    signal: AbortSignal.timeout(3000),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch organization directory from ${target} (HTTP ${res.status})`);
  }

  return (await res.json()) as OrgDirectoryResponse;
}

/**
 * Fetch targeted linear management chain and direct reports for a specific employee ID or email.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export async function getScopedHierarchy(
  userIdOrEmail: string,
  baseUrl?: string
): Promise<ScopedHierarchyResponse> {
  if (!userIdOrEmail) {
    throw new Error('Employee identifier (ID or Email) is required for hierarchy lookup');
  }

  const encoded = encodeURIComponent(userIdOrEmail);
  const target = `${resolveAuthBaseUrl(baseUrl)}/api/v1/auth/hierarchy/${encoded}`;
  const res = await fetch(target, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(3000),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch scoped hierarchy for "${userIdOrEmail}" (HTTP ${res.status})`);
  }

  return (await res.json()) as ScopedHierarchyResponse;
}

/**
 * Fetch targeted management chain and reports for the currently authenticated user from incoming Request.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export async function getMyHierarchy(
  req: Request,
  baseUrl?: string
): Promise<ScopedHierarchyResponse> {
  const target = `${resolveAuthBaseUrl(baseUrl)}/api/v1/auth/hierarchy/me`;
  const cookie = req.headers.get('cookie') || '';
  const auth = req.headers.get('authorization') || '';

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (cookie) headers['cookie'] = cookie;
  if (auth) headers['authorization'] = auth;

  const res = await fetch(target, {
    headers,
    signal: AbortSignal.timeout(3000),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch caller hierarchy (HTTP ${res.status})`);
  }

  return (await res.json()) as ScopedHierarchyResponse;
}

/**
 * Deterministic approval verification helper:
 * Returns true if candidateManagerId exists anywhere in the employee's upward management chain.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export async function isManagerOf(
  candidateManagerId: string,
  employeeId: string,
  baseUrl?: string
): Promise<boolean> {
  try {
    const hierarchy = await getScopedHierarchy(employeeId, baseUrl);
    return hierarchy.managementChain.some((m) => m.id === candidateManagerId);
  } catch {
    return false;
  }
}

/**
 * Fetch organization security audit logs from Auth service
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export async function fetchAuditLogs(options: {
  limit?: number;
  baseUrl?: string;
  headers?: Record<string, string>;
} = {}): Promise<any[]> {
  const base = resolveAuthBaseUrl(options.baseUrl);
  const limit = options.limit || 50;
  const target = `${base}/api/v1/auth/audit?limit=${limit}`;
  const res = await fetch(target, {
    headers: { Accept: 'application/json', ...(options.headers || {}) },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch audit logs (HTTP ${res.status})`);
  }
  const json = (await res.json()) as any;
  return json.data || [];
}

/**
 * Fetch active sessions for the authenticated user
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export async function fetchUserSessions(options: {
  baseUrl?: string;
  headers?: Record<string, string>;
} = {}): Promise<any[]> {
  const base = resolveAuthBaseUrl(options.baseUrl);
  const target = `${base}/api/v1/auth/sessions/me`;
  const res = await fetch(target, {
    headers: { Accept: 'application/json', ...(options.headers || {}) },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return [];
  const json = (await res.json()) as any;
  return json.sessions || json.data || [];
}
