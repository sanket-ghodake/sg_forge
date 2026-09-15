/**
 * @forge/portal - Viewport-Safe Modals & Action Drawers (2026 LTS)
 * Invite Member modal, Role Editor, Request Tool Access, and App Quick-Details Modal.
 */

import { astryxIcons } from '@forge/ui';
import { loadBrandConfig } from '@forge/sdk';
import { renderAppGovernanceModal } from './ui-admin-apps-governance-modal';
import { renderAppRequestHistoryModal } from './ui-admin-apps-history-modal';

/**
 * renderPortalModals
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function renderPortalModals(): string {
  return `
    <!-- Invite Colleague Modal -->
    <div class="astryx-modal-backdrop" id="modal-invite-member" role="dialog" aria-modal="true" aria-hidden="true">
      <div class="astryx-modal">
        <div class="astryx-modal-header">
          <h3>Invite New Team Member</h3>
          <button class="astryx-modal-close" data-close-modal="modal-invite-member" aria-label="Close modal">
            ${astryxIcons.x || '&times;'}
          </button>
        </div>
        <div class="astryx-modal-body">
          <div class="form-field">
            <label style="font-size: 0.78rem; font-weight: 600; color: var(--forge-text-muted); margin-bottom: 0.35rem; display: block;">Work Email Address</label>
            <input type="email" class="form-input" id="invite-email" placeholder="colleague@${loadBrandConfig().domain || 'forge.internal'}" style="width: 100%; box-sizing: border-box;" />
          </div>
          <div class="form-field" style="margin-top: 1rem;">
            <label style="font-size: 0.78rem; font-weight: 600; color: var(--forge-text-muted); margin-bottom: 0.35rem; display: block;">Full Display Name</label>
            <input type="text" class="form-input" id="invite-name" placeholder="e.g. Jane Doe" style="width: 100%; box-sizing: border-box;" />
          </div>
          <div class="form-field" style="margin-top: 1rem;">
            <label style="font-size: 0.78rem; font-weight: 600; color: var(--forge-text-muted); margin-bottom: 0.35rem; display: block;">Job Title / Role</label>
            <input type="text" class="form-input" id="invite-title" placeholder="e.g. Senior Backend Engineer" style="width: 100%; box-sizing: border-box;" />
          </div>
          <div class="form-field" style="margin-top: 1rem;">
            <label style="font-size: 0.78rem; font-weight: 600; color: var(--forge-text-muted); margin-bottom: 0.35rem; display: block;">Organizational Division</label>
            <select class="astryx-select" id="invite-division" style="width: 100%; box-sizing: border-box;">
              <option value="Engineering">Engineering & Platform</option>
              <option value="Product">Product & Design</option>
              <option value="Finance">Finance & Operations</option>
              <option value="HR">People & HR Ops</option>
            </select>
          </div>
          <div class="form-field" style="margin-top: 1rem;">
            <label style="font-size: 0.78rem; font-weight: 600; color: var(--forge-text-muted); margin-bottom: 0.35rem; display: block;">Reporting Line Manager</label>
            <select class="astryx-select" id="invite-manager" style="width: 100%; box-sizing: border-box;">
              <option value="">-- No Direct Manager (Top-level) --</option>
            </select>
          </div>
          <div class="form-field" style="margin-top: 1rem;">
            <label style="font-size: 0.78rem; font-weight: 600; color: var(--forge-text-muted); margin-bottom: 0.35rem; display: block;">Initial IAM Role</label>
            <select class="astryx-select" id="invite-role" style="width: 100%; box-sizing: border-box;">
              <option value="roles/employee">Standard Employee (Self-Service)</option>
              <option value="roles/manager">Department Lead / Manager</option>
              <option value="roles/admin">Organization Admin</option>
            </select>
          </div>
        </div>
        <div class="astryx-modal-footer">
          <button class="astryx-btn btn-ghost" data-close-modal="modal-invite-member">Cancel</button>
          <button class="astryx-btn btn-primary" id="confirm-invite-btn">Send Invitation</button>
        </div>
      </div>
    </div>

    <!-- Batch Import CSV Modal -->
    <div class="astryx-modal-backdrop" id="modal-batch-import" role="dialog" aria-modal="true" aria-hidden="true">
      <div class="astryx-modal" style="max-width: 580px;">
        <div class="astryx-modal-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div class="app-card-icon-box" style="width: 28px; height: 28px;">${astryxIcons.upload || ''}</div>
            <h3 style="margin: 0;">Batch CSV Member Ingestion</h3>
          </div>
          <button class="astryx-modal-close" data-close-modal="modal-batch-import" aria-label="Close modal">${astryxIcons.x || '&times;'}</button>
        </div>
        <div class="astryx-modal-body">
          <p style="font-size: 0.84rem; color: var(--forge-text-muted); margin-top: 0;">
            Upload a standard CSV roster from your HRIS (BambooHR, Workday, Google Workspace).
          </p>
          <div style="padding: 0.75rem; background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); font-size: 0.75rem; margin-bottom: 1rem; color: var(--forge-text-subtle);">
            <strong>Expected Headers:</strong> <code>display_name, email, job_title, department, manager_email, role</code>
          </div>
          <div class="form-field">
            <label style="font-size: 0.78rem; font-weight: 600; color: var(--forge-text-muted); margin-bottom: 0.35rem; display: block;">Select CSV File or Paste Raw Text</label>
            <input type="file" id="batch-csv-file-input" accept=".csv,text/csv" style="display: block; margin-bottom: 0.75rem; font-size: 0.8rem;" />
            <textarea class="form-input" id="batch-csv-textarea" rows="5" placeholder="display_name,email,job_title,department,manager_email,role&#10;Alice Smith,alice@forge.internal,Staff Engineer,Engineering,,roles/manager" style="width: 100%; font-family: var(--forge-font-mono, monospace); font-size: 0.76rem; box-sizing: border-box;"></textarea>
          </div>
          <div id="batch-import-status-box" style="display: none; margin-top: 1rem; padding: 0.75rem; border-radius: var(--forge-radius-sm); font-size: 0.78rem;"></div>
        </div>
        <div class="astryx-modal-footer">
          <button class="astryx-btn btn-ghost" data-close-modal="modal-batch-import">Cancel</button>
          <button class="astryx-btn btn-outline" id="batch-dry-run-btn">Dry Run Validate</button>
          <button class="astryx-btn btn-primary" id="confirm-batch-import-btn">Import Roster</button>
        </div>
      </div>
    </div>

    <!-- Request Tool Access Modal -->
    <div class="astryx-modal-backdrop" id="modal-request-access" role="dialog" aria-modal="true" aria-hidden="true">
      <div class="astryx-modal">
        <div class="astryx-modal-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div class="app-card-icon-box" style="width: 28px; height: 28px;">
              ${astryxIcons.shield || ''}
            </div>
            <h3 style="margin: 0;">Request Application Access</h3>
          </div>
          <button class="astryx-modal-close" data-close-modal="modal-request-access" aria-label="Close modal">
            ${astryxIcons.x || '&times;'}
          </button>
        </div>
        <div class="astryx-modal-body">
          <div class="req-access-target-badge">
            <div class="req-access-target-icon">
              ${astryxIcons.shield || ''}
            </div>
            <div class="req-access-target-meta">
              <span class="req-access-target-label">Application</span>
              <span id="req-access-app-name" class="req-access-target-name">Enterprise App</span>
            </div>
            <span class="req-access-tag">Managed Access</span>
          </div>

          <div class="form-field" style="margin-bottom: 1.15rem;">
            <label for="req-access-justification-type" style="font-size: 0.78rem; font-weight: 600; color: var(--forge-text-main); margin-bottom: 0.35rem; display: flex; align-items: center; justify-content: space-between;">
              <span>Justification Reason <span style="color: var(--forge-primary);">*</span></span>
              <span style="font-size: 0.7rem; color: var(--forge-text-subtle); font-weight: 400;">Required for review</span>
            </label>
            <select class="astryx-select" id="req-access-justification-type" style="width: 100%; box-sizing: border-box;">
              <option value="Daily Core Job Responsibility">Daily Core Job Responsibility</option>
              <option value="Cross-Functional Project Support">Cross-Functional Project Support</option>
              <option value="Manager Approved Workflow">Manager Approved Workflow</option>
              <option value="Role Transition & Onboarding">Role Transition & Onboarding</option>
              <option value="Security & Compliance Audit">Security & Compliance Audit</option>
            </select>
          </div>

          <div class="form-field">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
              <label for="req-access-reason" style="font-size: 0.78rem; font-weight: 600; color: var(--forge-text-main); display: flex; align-items: center; gap: 0.45rem;">
                <span>Additional Notes / Project Details</span>
                <span class="astryx-badge badge-pill" style="font-size: 0.65rem; padding: 0.05rem 0.4rem; border-radius: 4px;">Optional</span>
              </label>
              <span id="req-access-char-count" class="char-count-indicator">0 / 300</span>
            </div>

            <!-- Quick Preset Reason Chips -->
            <div class="quick-chips-row">
              <span class="quick-chip-label">Quick insert:</span>
              <button type="button" class="quick-chip-btn" data-reason="Sprint deliverable requirement">Sprint deliverable</button>
              <button type="button" class="quick-chip-btn" data-reason="Incident triage & root-cause debugging">Incident triage</button>
              <button type="button" class="quick-chip-btn" data-reason="Cross-functional project collaboration">Cross-team work</button>
              <button type="button" class="quick-chip-btn" data-reason="Manager pre-approved access grant">Pre-approved</button>
            </div>

            <!-- Enhanced Premium Textarea Box -->
            <div class="astryx-textarea-wrap">
              <textarea class="astryx-textarea form-input" id="req-access-reason" rows="3" maxlength="300" placeholder="Briefly describe what you'll be using this application for, project scope, or ticket reference..."></textarea>
              <div class="textarea-bottom-bar">
                <span class="textarea-hint-text">
                  <span style="color: var(--forge-primary); display: flex;">${astryxIcons.shield || ''}</span>
                  <span>Audit-logged & routed to manager</span>
                </span>
                <span style="font-size: 0.68rem; color: var(--forge-text-subtle);">Max 300 chars</span>
              </div>
            </div>
          </div>

          <div class="req-access-routing-banner">
            <span class="routing-icon-box">${astryxIcons.zap || ''}</span>
            <span><strong>Automated Routing:</strong> Your request will be routed to your reporting manager and IT compliance for review.</span>
          </div>
        </div>
        <div class="astryx-modal-footer">
          <button type="button" class="astryx-btn btn-ghost" data-close-modal="modal-request-access">Cancel</button>
          <button type="button" class="astryx-btn btn-primary" id="submit-access-req-btn">Submit Request</button>
        </div>
      </div>
    </div>

    <!-- App Quick Details Modal -->
    <div class="astryx-modal-backdrop" id="modal-app-details" role="dialog" aria-modal="true" aria-hidden="true">
      <div class="astryx-modal" style="max-width: 520px;">
        <div class="astryx-modal-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div class="app-card-icon-box" style="width: 28px; height: 28px;">
              ${astryxIcons.apps || ''}
            </div>
            <h3 id="app-details-title" style="margin: 0;">Application Details</h3>
          </div>
          <button class="astryx-modal-close" data-close-modal="modal-app-details" aria-label="Close modal">
            ${astryxIcons.x || '&times;'}
          </button>
        </div>
        <div class="astryx-modal-body">
          <div style="margin-bottom: 0.85rem;">
            <span id="app-details-dept" class="app-card-cat" style="font-size: 0.75rem; font-weight: 600; color: var(--forge-primary); background: var(--forge-bg-card); padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--forge-border);"></span>
          </div>
          <p id="app-details-desc" style="font-size: 0.86rem; color: var(--forge-text-main); line-height: 1.5; margin-bottom: 1.25rem;"></p>
          
          <div style="border-top: 1px solid var(--forge-border); padding-top: 1rem; margin-bottom: 1rem;">
            <span style="font-size: 0.74rem; font-weight: 600; color: var(--forge-text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.5rem;">Tags & Capabilities</span>
            <div id="app-details-tags" style="display: flex; flex-wrap: wrap; gap: 0.4rem;"></div>
          </div>

          <!-- App Administrators & Approvers Section -->
          <div style="border-top: 1px solid var(--forge-border); padding-top: 1rem; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem;">
              <span style="font-size: 0.74rem; font-weight: 600; color: var(--forge-text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.35rem;">
                ${astryxIcons.users || ''}
                <span>App Administrators & Designated Approvers</span>
              </span>
              <span id="app-details-approval-type" class="astryx-badge badge-pill" style="font-size: 0.66rem;"></span>
            </div>
            <div id="app-details-admins-list" style="display: flex; flex-direction: column; gap: 0.5rem;"></div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0.75rem 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="status-indicator status-online"></span>
              <span style="font-size: 0.78rem; color: var(--forge-text-muted);">Forge Zero-Trust SSO Active</span>
            </div>
            <span style="font-size: 0.74rem; color: var(--forge-text-subtle);">SOC2 Certified</span>
          </div>
        </div>
        <div class="astryx-modal-footer">
          <button class="astryx-btn btn-ghost" data-close-modal="modal-app-details">Close</button>
          <a id="app-details-action-btn" href="#" class="astryx-btn btn-primary" target="_blank" rel="noopener noreferrer">Open Application</a>
        </div>
      </div>
    </div>

    <!-- Access Request Details Modal -->
    <div class="astryx-modal-backdrop" id="modal-request-details" role="dialog" aria-modal="true" aria-hidden="true">
      <div class="astryx-modal" style="max-width: 540px;">
        <div class="astryx-modal-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div class="app-card-icon-box" style="width: 28px; height: 28px;">
              ${astryxIcons.shield || ''}
            </div>
            <h3 style="margin: 0;">Access Request Details</h3>
          </div>
          <button class="astryx-modal-close" data-close-modal="modal-request-details" aria-label="Close modal">
            ${astryxIcons.x || '&times;'}
          </button>
        </div>
        <div class="astryx-modal-body">
          <div class="req-access-target-badge">
            <div class="req-access-target-icon">
              ${astryxIcons.apps || ''}
            </div>
            <div class="req-access-target-meta">
              <span class="req-access-target-label">Target Application</span>
              <span id="req-detail-app-name" class="req-access-target-name">Application</span>
            </div>
            <span id="req-detail-status-badge" class="astryx-badge badge-warning">Pending Review</span>
          </div>

          <!-- Who Will Approve It Card -->
          <div style="background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 0.85rem 1rem; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="font-size: 0.74rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--forge-text-main); display: flex; align-items: center; gap: 0.4rem;">
                <span style="color: var(--forge-primary); display: flex;">${astryxIcons.users || ''}</span>
                <span>Who Will Approve This Request?</span>
              </span>
              <span class="astryx-badge badge-pill" style="font-size: 0.65rem;">Approval Authority</span>
            </div>
            <p style="font-size: 0.78rem; color: var(--forge-text-muted); margin: 0 0 0.65rem; line-height: 1.45;">
              This request is routed to the <strong><span id="req-detail-approver-dept">Department Lead</span></strong> and authorized Workspace Administrators:
            </p>
            <div id="req-detail-approvers-list" style="display: flex; flex-direction: column; gap: 0.45rem;"></div>
          </div>

          <!-- Submission Metadata -->
          <div style="display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.8rem; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; padding-bottom: 0.5rem; border-bottom: 1px solid var(--forge-border);">
              <span style="color: var(--forge-text-muted);">Justification Category</span>
              <strong id="req-detail-reason-type" style="color: var(--forge-text-main);">Daily Core Responsibility</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding-bottom: 0.5rem; border-bottom: 1px solid var(--forge-border);">
              <span style="color: var(--forge-text-muted);">Submitted By</span>
              <span id="req-detail-user" style="color: var(--forge-text-main); font-family: var(--forge-font-mono, monospace); font-size: 0.75rem;">user@forge.internal</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-bottom: 0.5rem; border-bottom: 1px solid var(--forge-border);">
              <span style="color: var(--forge-text-muted);">Submission Date</span>
              <span id="req-detail-date" style="color: var(--forge-text-subtle);">Today</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
              <span style="color: var(--forge-text-muted);">Additional Notes / Project Details:</span>
              <div id="req-detail-notes-box" style="padding: 0.65rem 0.85rem; background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); font-size: 0.78rem; color: var(--forge-text-main); line-height: 1.45;">
                No additional notes provided.
              </div>
            </div>
          </div>

          <div style="padding: 0.65rem 0.85rem; background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); font-size: 0.72rem; color: var(--forge-text-subtle); display: flex; align-items: center; gap: 0.45rem;">
            <span style="color: var(--forge-primary); display: flex;">${astryxIcons.shield || ''}</span>
            <span>Anti-Self-Approval Policy Active: Administrators cannot self-approve their own requests.</span>
          </div>
        </div>
        <div class="astryx-modal-footer">
          <button type="button" class="astryx-btn btn-ghost" data-close-modal="modal-request-details">Close</button>
          <button type="button" class="astryx-btn btn-outline" id="req-detail-cancel-action" style="color: var(--forge-error); border-color: var(--forge-border); display: none;">Cancel Request</button>
        </div>
      </div>
    </div>

    <!-- Application Governance & Administration Modal (Super Admin / Admin) -->
    ${renderAppGovernanceModal()}

    <!-- Application Access Requests & Audit History Modal (Admin Console) -->
    ${renderAppRequestHistoryModal()}
  `;
}
