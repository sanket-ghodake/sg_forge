/**
 * @forge/sdk - Enterprise Employee Password Restoration & Forced Reset Client (2026 LTS)
 * Manages administrative password reset execution with temporary credentials.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */

import { resolveAuthBaseUrl } from './directory-client';
import { createInternalServiceToken } from './auth-guard';

/**
 * Result returned from administrative employee password reset.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export interface ResetEmployeePasswordResultDto {
  ok: boolean;
  id: string;
  email: string;
  must_change_password: boolean;
  message: string;
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
      // Ignore if crypto token generation is not available in current environment
    }
  }
  return headers;
}

/**
 * Administratively reset an employee's password via the Auth service.
 * Invalidates all active sessions and sets must_change_password = 1.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export async function resetEmployeePasswordApi(
  employeeId: string,
  temporaryPassword: string,
  options: {
    baseUrl?: string;
    headers?: Record<string, string>;
  } = {}
): Promise<ResetEmployeePasswordResultDto> {
  if (!employeeId) {
    throw new Error('Employee ID is required for password reset');
  }
  if (!temporaryPassword || temporaryPassword.length < 8) {
    throw new Error('Temporary password must be at least 8 characters long');
  }

  const base = resolveAuthBaseUrl(options.baseUrl);
  const target = `${base}/api/v1/auth/org/employees/${encodeURIComponent(employeeId)}/reset-password`;

  const res = await fetch(target, {
    method: 'POST',
    headers: getInternalHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    }),
    body: JSON.stringify({
      id: employeeId,
      temporaryPassword,
    }),
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || err.error || `Failed to reset password (HTTP ${res.status})`);
  }

  return (await res.json()) as ResetEmployeePasswordResultDto;
}
