/**
 * @forge-apps/code - Dedicated Turso Database Schema & Access Models (2026 LTS)
 * Enterprise Multi-Tenant Data Isolation Standard
  * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */

export interface ProjectRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  fs_path: string;
  default_branch: string;
  is_active: number;
  created_by: string;
  created_at: number;
  updated_at: number;
}

/**
 * ProjectMemberRecord
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export interface ProjectMemberRecord {
  id: string;
  project_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  role: 'PROJECT_ADMIN' | 'DEVELOPER';
  created_at: number;
  updated_at: number;
}

/**
 * ActiveSessionRecord
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export interface ActiveSessionRecord {
  project_id: string;
  session_id: string;
  active_user_id: string;
  active_user_email: string;
  active_user_name: string;
  status: 'ACTIVE' | 'PENDING_TAKEOVER';
  connected_at: number;
  last_heartbeat: number;
  takeover_requester_id: string | null;
  takeover_requester_email: string | null;
  takeover_requester_name: string | null;
  takeover_expires_at: number | null;
}
