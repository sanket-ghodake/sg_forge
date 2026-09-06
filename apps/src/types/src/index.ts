/**
 * @forge/types
 * Core domain types and system models for SG Forge platform.
 * Conforms to SG Forge Living Engineering Standards.
 */

/**
 * User roles for hierarchical Role-Based Access Control (RBAC).
 * @requirements [HLR-AUTH-102] [LLR-AUTH-003]
 */
export type UserRole = 'super_admin' | 'admin' | 'manager' | 'user' | 'read_only_admin';

/**
 * Authenticated user profile context passed to client views and micro-apps.
 * @requirements [HLR-AUTH-101] [LLR-AUTH-003]
 */
export interface UserContext {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  designation?: string;
  avatarUrl?: string;
}

/**
 * Micro-application manifest specification for dynamic portal registration.
 * @requirements [HLR-SDK-301] [LLR-SDK-001]
 */
export interface ForgeAppManifest {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  iconUrl?: string;
  entryUrl: string;
  port: number;
  runtime: 'node' | 'python' | 'go' | 'static';
  requiredRole?: UserRole;
  isIsolated?: boolean;
}

/**
 * Event message envelope for secure cross-frame PostMessage bridge.
 * @requirements [HLR-PORTAL-202] [LLR-SUB-006]
 */
export type PostMessageEvent =
  | { type: 'FORGE_APP_INIT'; payload: { appId: string } }
  | { type: 'FORGE_APP_CONTEXT'; payload: { user: UserContext; token: string; theme: 'light' | 'dark' } }
  | { type: 'FORGE_APP_RESIZE'; payload: { height: number } };

/**
 * Identity principal with verified claims, roles, and tenant org_id.
 * @requirements [HLR-AUTH-101] [LLR-AUTH-003]
 */
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  principalType: 'EMPLOYEE' | 'ADMIN' | 'SERVICE_ACCOUNT';
  orgId: string;
  roles: string[];
  permissions: string[];
  tokenVersion?: number;
}

/**
 * Access policy defining security levels for platform microservices.
 * @requirements [HLR-AUTH-102] [LLR-AUTH-003]
 */
export type AppAccessPolicy = 'PUBLIC' | 'AUTHENTICATED' | 'ROLE_RESTRICTED';

/**
 * Multi-tenant white-label brand configuration.
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export interface BrandConfig {
  name: string;
  short: string;
  tagline: string;
  logoUrl?: string;
  faviconUrl?: string;
}

/**
 * Guard verification result carrying authentication state and optional response.
 * @requirements [HLR-AUTH-102] [LLR-AUTH-003]
 */
export interface AuthGuardResult {
  authenticated: boolean;
  user?: AuthUser;
  response?: Response;
}

/**
 * Configuration options for route authorization middleware.
 * @requirements [HLR-AUTH-102] [LLR-AUTH-003]
 */
export interface AuthGuardOptions {
  requiredRoles?: string[];
  requiredPermissions?: string[];
  publicPaths?: string[];
  appName?: string;
  appId?: string;
}

/**
 * Organizational structure node representation in tree hierarchy.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export interface OrgNodeSummary {
  id: string;
  name: string;
  code?: string | null;
  path: string;
  parentId: string | null;
}

/**
 * Employee profile summary for directory search and management chains.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export interface EmployeeSummary {
  id: string;
  displayName: string;
  email: string;
  jobTitle?: string | null;
  employeeCode?: string | null;
  departmentName?: string | null;
  orgPath?: string | null;
  managerId?: string | null;
  principalType?: 'EMPLOYEE' | 'ADMIN' | 'SERVICE_ACCOUNT';
}

/**
 * Individual management link within an employee hierarchical line.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export interface ManagerChainEntry {
  level: number;
  relationship: 'LINE_MANAGER' | 'PROJECT_LEAD' | 'DOTTED_LINE' | 'MENTOR';
  id: string;
  displayName: string;
  email: string;
  jobTitle?: string | null;
  department?: string | null;
}

/**
 * Scoped corporate hierarchy payload with direct reports and line managers.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export interface ScopedHierarchyResponse {
  status: 'SUCCESS' | 'ERROR';
  employee: EmployeeSummary;
  managementChain: ManagerChainEntry[];
  directReports: EmployeeSummary[];
  summary: {
    totalManagersAbove: number;
    totalDirectReports: number;
    isTopLevel: boolean;
  };
}

/**
 * Full corporate directory payload with tree nodes and employee records.
 * @requirements [HLR-AUTH-102] [LLR-DB-005]
 */
export interface OrgDirectoryResponse {
  organization: {
    id: string;
    name: string;
    domain: string;
  };
  nodes: OrgNodeSummary[];
  users: EmployeeSummary[];
}
