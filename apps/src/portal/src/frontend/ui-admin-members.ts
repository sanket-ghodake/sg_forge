/**
 * @forge/portal - Admin Team & Member Management View (2026 LTS)
 * Organization user roster, invite flows, IAM role assignment, and offboarding controls.
 */

import { astryxIcons } from '@forge/ui';

/**
 * AdminRosterMember
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export interface AdminRosterMember {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  division: string;
  status: 'ONLINE' | 'AWAY' | 'OFFLINE';
  avatarInitial: string;
}

/**
 * ADMIN_ROSTER_MEMBERS
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export const ADMIN_ROSTER_MEMBERS: AdminRosterMember[] = [];

/**
 * renderAdminMembersView
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function renderAdminMembersView(): string {
  return `
    <div id="view-admin-members" class="portal-page-view">
      <!-- Header -->
      <div class="portal-view-header">
        <div>
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div class="portal-view-badge" style="background: rgba(var(--forge-primary-rgb, 99, 102, 241), 0.15); color: var(--forge-primary);">
              <span class="badge-dot" style="background: var(--forge-primary);"></span>
              <span>Admin Console</span>
            </div>
            <span class="portal-view-audience" style="font-size: 0.74rem; color: var(--forge-text-subtle);">Audience: <strong style="color: var(--forge-text-muted); font-weight: 500;">Admins & HR Managers</strong></span>
          </div>
          <h1 class="portal-view-title">Team & Member Management</h1>
          <p class="portal-view-desc">
            Invite new colleagues, assign organizational departments, configure IAM roles, and handle departures.
          </p>
        </div>

        <div class="portal-view-actions">
          <button class="astryx-btn btn-outline" id="batch-import-btn">
            ${astryxIcons.upload || '↑'} Batch CSV
          </button>
          <button class="astryx-btn btn-primary" id="open-invite-modal-btn">
            ${astryxIcons.plus || '+'} Invite Colleague
          </button>
        </div>
      </div>

      <!-- Controls & Search -->
      <div class="admin-table-controls">
        <div class="canvas-search-input-wrap" style="width: 280px;">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="admin-member-search-input" placeholder="Search team members by name or email..." />
        </div>
        <div class="table-stats-pill">
          Total Members: <strong id="admin-total-members">--</strong>
        </div>
      </div>

      <!-- Table -->
      <div class="astryx-table-container">
        <table class="astryx-table" id="admin-members-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Department / Division</th>
              <th>Job Title</th>
              <th>Status</th>
              <th>IAM Role</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="admin-members-tbody">
            <tr>
              <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--forge-text-muted);">
                <div style="display: flex; align-items: center; justify-content: center; gap: 0.6rem;">
                  <span class="badge-dot" style="background: var(--forge-primary);"></span>
                  <span>Loading organization members from central identity...</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}
