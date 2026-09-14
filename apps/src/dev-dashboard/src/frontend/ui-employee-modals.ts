/**
 * @forge/dev-dashboard - Employee Flyout Modal Dialog Renderer (2026 LTS)
 * Modular Astryx modal dialog with live preview identity banner and real-time directory bindings.
 * @requirements [HLR-UI-401] [LLR-UI-001] [LLR-AUTH-008] [LLR-AUTH-009]
 */

import { astryxIcons } from '@forge/ui';

/**
 * getEmployeeFlyoutModalHtml
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function getEmployeeFlyoutModalHtml(): string {
  return `
  <!-- Employee Management / Edit Flyout Modal (Astryx Glassmorphic) -->
  <div class="astryx-modal-backdrop" id="modal-employee-flyout" style="display: none;" onclick="if(event.target===this)closeEmployeeModal()">
    <div class="astryx-modal" style="max-width: 620px; width: 94vw;">
      <div class="astryx-modal-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.users}</span>
          <h3 id="modal-employee-title" style="margin: 0; font-size: 1.05rem; font-weight: 600;">Add New Employee Profile</h3>
        </div>
        <button class="astryx-modal-close" onclick="closeEmployeeModal()">&times;</button>
      </div>

      <!-- Live Member Identity Preview Banner -->
      <div class="emp-identity-preview-card" style="margin: 0.85rem 1.25rem 0 1.25rem; padding: 0.85rem 1rem; background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); display: flex; align-items: center; gap: 0.85rem;">
        <div id="emp-live-avatar" class="emp-avatar" style="width: 44px; height: 44px; font-size: 1.05rem; font-weight: 700; background: linear-gradient(135deg, var(--forge-primary), var(--forge-success)); color: var(--forge-bg-root); box-shadow: 0 4px 12px var(--forge-primary-bg); flex-shrink: 0;">
          ?
        </div>
        <div style="min-width: 0; flex: 1;">
          <div id="emp-live-name" style="font-weight: 700; font-size: 0.96rem; color: var(--forge-text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            New Member Profile
          </div>
          <div id="emp-live-details" style="font-size: 0.74rem; color: var(--forge-text-muted); margin-top: 0.15rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            Job Title &bull; email@domain.internal
          </div>
        </div>
      </div>

      <form class="astryx-modal-body" onsubmit="saveEmployeeForm(event)" style="display: flex; flex-direction: column; gap: 0.85rem; padding: 1rem 1.25rem 1.25rem 1.25rem;">
        <input type="hidden" id="emp-form-id">

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Full Name *</label>
            <input type="text" class="form-input" id="emp-form-name" required placeholder="e.g. Elena Rostova" oninput="updateEmployeeLivePreview()" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Work Email *</label>
            <input type="email" class="form-input" id="emp-form-email" required placeholder="elena.r@domain.internal" oninput="updateEmployeeLivePreview()" style="width: 100%;">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Job Title</label>
            <input type="text" class="form-input" id="emp-form-title" placeholder="e.g. Senior Platform Architect" oninput="updateEmployeeLivePreview()" style="width: 100%;">
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
              <label style="font-size: 0.78rem; font-weight: 600; margin: 0;">Employee ID (EID)</label>
              <button type="button" class="astryx-btn btn-outline" style="font-size: 0.68rem; padding: 0.12rem 0.45rem; height: auto; gap: 0.25rem;" onclick="autoGenerateEmployeeId()" title="Auto-assign next sequential EID from database">
                ${astryxIcons.zap} Auto-Assign
              </button>
            </div>
            <input type="text" class="form-input" id="emp-form-code" placeholder="e.g. EMP-0001" style="width: 100%; font-family: monospace;">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.3rem;">Department / Unit</label>
            <div style="display: flex; gap: 0.45rem; align-items: center;">
              <select class="form-input" id="emp-form-dept" style="flex: 1; min-width: 0; width: 100%;"></select>
              <button type="button" class="astryx-btn btn-outline" style="font-size: 0.74rem; font-weight: 600; padding: 0.38rem 0.65rem; height: 34px; gap: 0.3rem; white-space: nowrap; flex-shrink: 0; color: var(--forge-primary); border-color: var(--forge-border-medium);" onclick="openAddDepartmentFromMemberModal()" title="Add new department node to organizational tree">
                ${astryxIcons.plus} Add Dept
              </button>
            </div>
          </div>
          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.3rem;">Reporting Line Manager</label>
            <select class="form-input" id="emp-form-manager" style="width: 100%;"></select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Primary IAM Role</label>
            <select class="form-input" id="emp-form-role" onchange="updateEmployeeLivePreview()" style="width: 100%;">
              <option value="roles/employee">Employee Standard</option>
              <option value="roles/super_admin">Super Administrator</option>
              <option value="roles/security.admin">Security & Cloud Admin</option>
              <option value="roles/hr.admin">HR & People Administrator</option>
              <option value="roles/it.admin">IT & Systems Administrator</option>
              <option value="roles/billing.admin">Billing Administrator</option>
              <option value="roles/dev.operator">Platform Developer</option>
            </select>
          </div>
          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Account Status</label>
            <select class="form-input" id="emp-form-status" onchange="updateEmployeeLivePreview()" style="width: 100%;">
              <option value="ACTIVE">Active (Ready)</option>
              <option value="INVITED">Invited (Must Set Password)</option>
              <option value="SUSPENDED">Suspended (Access Blocked)</option>
            </select>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.65rem; padding-top: 0.85rem; border-top: 1px solid var(--forge-border);">
          <button type="button" class="astryx-btn btn-outline" onclick="closeEmployeeModal()">Cancel</button>
          <button type="submit" class="astryx-btn btn-primary" id="btn-save-employee">
            ${astryxIcons.check} Save Member Profile
          </button>
        </div>
      </form>
    </div>
  </div>
  `;
}
