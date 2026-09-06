/**
 * @forge/portal - Viewport-Safe Modals & Action Drawers (2026 LTS)
 * Invite Member modal, Role Editor, Request Tool Access, and App Quick-Details Modal.
 */

import { astryxIcons } from '@forge/ui';
import { loadBrandConfig } from '@forge/sdk';

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
            &times;
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
            <label style="font-size: 0.78rem; font-weight: 600; color: var(--forge-text-muted); margin-bottom: 0.35rem; display: block;">Organizational Division</label>
            <select class="astryx-select" id="invite-division" style="width: 100%; box-sizing: border-box;">
              <option value="Engineering">Engineering & Platform</option>
              <option value="Product">Product & Design</option>
              <option value="Finance">Finance & Operations</option>
              <option value="HR">People & HR Ops</option>
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
            &times;
          </button>
        </div>
        <div class="astryx-modal-body">
          <p style="font-size: 0.84rem; color: var(--forge-text-muted); margin-top: 0;">
            You are requesting access to <strong id="req-access-app-name" style="color: var(--forge-text-main);">Enterprise App</strong>.
          </p>
          <div class="form-field">
            <label style="font-size: 0.78rem; font-weight: 600; color: var(--forge-text-muted); margin-bottom: 0.35rem; display: block;">Justification Reason</label>
            <select class="astryx-select" id="req-access-justification-type" style="width: 100%; box-sizing: border-box;">
              <option value="Daily Core Job Responsibility">Daily Core Job Responsibility</option>
              <option value="Cross-Functional Project Support">Cross-Functional Project Support</option>
              <option value="Manager Approved Workflow">Manager Approved Workflow</option>
              <option value="Role Transition & Onboarding">Role Transition & Onboarding</option>
            </select>
          </div>
          <div class="form-field" style="margin-top: 1rem;">
            <label style="font-size: 0.78rem; font-weight: 600; color: var(--forge-text-muted); margin-bottom: 0.35rem; display: block;">Additional Notes / Project Details (Optional)</label>
            <textarea class="form-input" id="req-access-reason" rows="3" placeholder="Briefly describe what you'll be using this application for..." style="width: 100%; height: auto; box-sizing: border-box;"></textarea>
          </div>
          <div style="margin-top: 1rem; padding: 0.75rem; background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); font-size: 0.74rem; color: var(--forge-text-subtle); display: flex; align-items: center; gap: 0.5rem;">
            <span style="color: var(--forge-primary); display: flex;">${astryxIcons.zap || ''}</span>
            <span>Your request will be routed to your reporting manager and IT compliance for review.</span>
          </div>
        </div>
        <div class="astryx-modal-footer">
          <button class="astryx-btn btn-ghost" data-close-modal="modal-request-access">Cancel</button>
          <button class="astryx-btn btn-primary" id="submit-access-req-btn">Submit Request</button>
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
            &times;
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
          <a id="app-details-action-btn" href="#" class="astryx-btn btn-primary" target="_self">Open Application</a>
        </div>
      </div>
    </div>
  `;
}
