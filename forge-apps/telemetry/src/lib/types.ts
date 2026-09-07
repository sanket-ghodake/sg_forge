/**
 * SG Forge Micro-App Submodule - Standalone Type Definitions (2026 LTS)
 * 100% Isolated: Zero imports from central platform monorepo.
  * @requirements [HLR-TEL-801] [LLR-SUB-004]
 */

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  principalType?: string;
  department?: string;
  orgId?: string;
}

/**
 * AuthGuardOptions
 * @requirements [HLR-TEL-801] [LLR-SUB-004]
 */
export interface AuthGuardOptions {
  appName?: string;
  appId?: string;
  requiredRoles?: string[];
  publicPaths?: string[];
  redirectTo?: string;
}

/**
 * AuthGuardResult
 * @requirements [HLR-TEL-801] [LLR-SUB-004]
 */
export interface AuthGuardResult {
  authenticated: boolean;
  user?: AuthUser;
  response?: Response;
}

/**
 * ScopedHierarchyResponse
 * @requirements [HLR-TEL-801] [LLR-SUB-004]
 */
export interface ScopedHierarchyResponse {
  employee?: {
    id: string;
    displayName: string;
    email: string;
    departmentName: string;
  };
  managementChain?: Array<{
    id: string;
    displayName: string;
    email: string;
    roleTitle: string;
  }>;
}

/**
 * ProblemDetails
 * @requirements [HLR-TEL-801] [LLR-SUB-004]
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  traceId: string;
  timestamp: string;
}
