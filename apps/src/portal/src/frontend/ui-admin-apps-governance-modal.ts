/**
 * @forge/portal - Enterprise Application Governance Modal (2026 LTS)
 * Industry-standard App Administration & Access Policy Management console.
 * Supports Designated Admins Roster, Access Policy, Infrastructure Routing, and Entitlement Metrics.
 *
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */

import { astryxIcons } from '@forge/ui';

/**
 * renderAppGovernanceModal
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function renderAppGovernanceModal(): string {
  return `
    <div class="astryx-modal-backdrop" id="modal-app-governance" role="dialog" aria-modal="true" aria-hidden="true">
      <div class="astryx-modal app-governance-card" style="max-width: 720px; width: 92vw; max-height: 88vh; display: flex; flex-direction: column;">
        <!-- Header -->
        <div class="astryx-modal-header" style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--forge-border); display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <div id="gov-modal-icon" class="app-card-icon-box" style="width: 42px; height: 42px; font-size: 1.15rem; flex-shrink: 0;">
              ${astryxIcons.apps || ''}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <h3 id="gov-modal-title" style="margin: 0; font-size: 1.15rem; font-weight: 600; color: var(--forge-text-main);">
                  Application Governance
                </h3>
                <span id="gov-modal-app-id-badge" class="astryx-badge" style="font-family: var(--forge-font-mono, monospace); font-size: 0.72rem; background: var(--forge-primary-bg); color: var(--forge-primary); border: 1px solid var(--forge-border);">
                  app_id
                </span>
                <span id="gov-role-privilege-badge" class="astryx-badge badge-online" style="font-size: 0.72rem;">
                  Admin Access
                </span>
              </div>
              <p id="gov-modal-subtitle" style="margin: 0.2rem 0 0 0; font-size: 0.8rem; color: var(--forge-text-muted);">
                Configure designated administrators, enrollment policies, and routing.
              </p>
            </div>
          </div>
          <button type="button" class="astryx-modal-close" data-close-modal="modal-app-governance" id="close-app-gov-btn" aria-label="Close Governance Modal">
            ${astryxIcons.x || '✕'}
          </button>
        </div>

        <!-- Navigation Tabs -->
        <div class="app-gov-tabs-bar">
          <button type="button" class="gov-tab-btn active" data-target="gov-tab-admins">
            ${astryxIcons.users || ''}
            <span>Designated Admins</span>
            <span id="gov-admins-count-pill" class="astryx-badge" style="font-size: 0.68rem; padding: 0.1rem 0.4rem; background: var(--forge-primary-bg); color: var(--forge-primary); border: 1px solid var(--forge-border);">0</span>
          </button>
          <button type="button" class="gov-tab-btn" data-target="gov-tab-policy">
            ${astryxIcons.shield || ''}
            <span>Access Policy & SLAs</span>
          </button>
          <button type="button" class="gov-tab-btn" data-target="gov-tab-infra">
            ${astryxIcons.network || ''}
            <span>Ingress & Air-Gap</span>
          </button>
          <button type="button" class="gov-tab-btn" data-target="gov-tab-metrics">
            ${astryxIcons.traffic || ''}
            <span>Entitlements & Metrics</span>
          </button>
        </div>

        <!-- Scrollable Body Content -->
        <div class="astryx-modal-body" style="padding: 1.5rem; overflow-y: auto; flex: 1;">
          
          <!-- TAB 1: Designated Admins & Approvers -->
          <div id="gov-tab-admins" class="gov-tab-panel active">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
              <div>
                <h4 style="margin: 0; font-size: 0.92rem; font-weight: 600; color: var(--forge-text-main);">App Administrators Roster</h4>
                <p style="margin: 0.2rem 0 0 0; font-size: 0.78rem; color: var(--forge-text-muted);">
                  These employees have delegated admin authority to review and approve access requests for this application.
                </p>
              </div>
            </div>

            <!-- Admins List -->
            <div id="app-gov-admins-list" style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
              <div style="text-align: center; padding: 2rem; color: var(--forge-text-muted);">Loading administrators...</div>
            </div>

            <!-- Appoint Administrator Card -->
            <div class="app-gov-section-card">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                <div style="color: var(--forge-primary);">${astryxIcons.plus || '+'}</div>
                <h5 style="margin: 0; font-size: 0.85rem; font-weight: 600; color: var(--forge-text-main);">Appoint New Application Administrator</h5>
              </div>
              <p style="margin: 0 0 0.85rem 0; font-size: 0.76rem; color: var(--forge-text-muted);">
                Search an active employee from the company directory to grant app admin and request approval authority.
              </p>

              <div style="display: grid; grid-template-columns: 1fr 180px auto; gap: 0.75rem; align-items: start;">
                <!-- Employee Search Input -->
                <div style="position: relative;">
                  <input type="text" id="gov-add-member-search" class="form-input" placeholder="Search employee name or email..." autocomplete="off" style="font-size: 0.82rem;" />
                  <input type="hidden" id="gov-selected-user-id" value="" />
                  <input type="hidden" id="gov-selected-user-name" value="" />
                  <input type="hidden" id="gov-selected-user-email" value="" />
                  <input type="hidden" id="gov-selected-user-title" value="" />
                  <input type="hidden" id="gov-selected-user-dept" value="" />
                  <div id="gov-member-search-results" class="gov-autocomplete-dropdown" style="display: none;"></div>
                </div>

                <!-- Admin Role Selector -->
                <div>
                  <select id="gov-add-role-type" class="form-input" style="font-size: 0.82rem;">
                    <option value="PRIMARY_OWNER">Primary App Owner</option>
                    <option value="ADMIN" selected>App Administrator</option>
                    <option value="APPROVER">Request Approver Only</option>
                  </select>
                </div>

                <!-- Assign Button -->
                <button type="button" class="astryx-btn btn-primary" id="btn-assign-gov-admin" style="font-size: 0.82rem; white-space: nowrap;">
                  ${astryxIcons.plus || '+'} Appoint Admin
                </button>
              </div>
            </div>
          </div>

          <!-- TAB 2: Access & Approval Policy -->
          <div id="gov-tab-policy" class="gov-tab-panel" style="display: none;">
            <div style="display: flex; flex-direction: column; gap: 1.25rem;">
              
              <!-- Enrollment Access Mode -->
              <div class="form-group">
                <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--forge-text-main); margin-bottom: 0.4rem;">
                  Access Enrollment Mode
                </label>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 0.75rem;">
                  <label class="gov-radio-card">
                    <input type="radio" name="gov-access-mode" value="REQUEST_REQUIRED" checked />
                    <div>
                      <div style="font-weight: 600; font-size: 0.82rem; color: var(--forge-text-main);">Approval Required</div>
                      <div style="font-size: 0.74rem; color: var(--forge-text-muted);">Users submit request with justification.</div>
                    </div>
                  </label>
                  <label class="gov-radio-card">
                    <input type="radio" name="gov-access-mode" value="OPEN" />
                    <div>
                      <div style="font-weight: 600; font-size: 0.82rem; color: var(--forge-text-main);">Open Enrollment</div>
                      <div style="font-size: 0.74rem; color: var(--forge-text-muted);">All active employees gain direct access.</div>
                    </div>
                  </label>
                  <label class="gov-radio-card">
                    <input type="radio" name="gov-access-mode" value="RESTRICTED" />
                    <div>
                      <div style="font-weight: 600; font-size: 0.82rem; color: var(--forge-text-main);">Strict Role Whitelist</div>
                      <div style="font-size: 0.74rem; color: var(--forge-text-muted);">Restricted to appointed role holders.</div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Department Owner & Required Role -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label for="gov-policy-dept-owner" style="display: block; font-size: 0.8rem; font-weight: 500; color: var(--forge-text-muted); margin-bottom: 0.35rem;">
                    Department Owner
                  </label>
                  <input type="text" id="gov-policy-dept-owner" class="form-input" style="font-size: 0.82rem;" placeholder="e.g. Infrastructure & SRE" />
                </div>
                <div class="form-group">
                  <label for="gov-policy-req-role" style="display: block; font-size: 0.8rem; font-weight: 500; color: var(--forge-text-muted); margin-bottom: 0.35rem;">
                    Required Role / Permission Scope
                  </label>
                  <input type="text" id="gov-policy-req-role" class="form-input" style="font-size: 0.82rem;" placeholder="e.g. roles/employee or roles/admin" />
                </div>
              </div>

              <!-- Approval SLA & Justification Requirements -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label for="gov-policy-sla-hours" style="display: block; font-size: 0.8rem; font-weight: 500; color: var(--forge-text-muted); margin-bottom: 0.35rem;">
                    Approval Turnaround SLA
                  </label>
                  <select id="gov-policy-sla-hours" class="form-input" style="font-size: 0.82rem;">
                    <option value="12">12 Hours (High Priority)</option>
                    <option value="24" selected>24 Hours (Standard)</option>
                    <option value="48">48 Hours (2 Business Days)</option>
                    <option value="72">72 Hours (3 Days)</option>
                    <option value="168">7 Days (Weekly Review)</option>
                  </select>
                </div>
                <div class="form-group" style="display: flex; flex-direction: column; justify-content: flex-end;">
                  <label class="gov-checkbox-container" style="display: flex; align-items: center; gap: 0.6rem; cursor: pointer; padding: 0.55rem 0;">
                    <input type="checkbox" id="gov-policy-require-notes" checked />
                    <span style="font-size: 0.82rem; color: var(--forge-text-main);">Require Business Justification Notes</span>
                  </label>
                </div>
              </div>

              <!-- Invariant Security Badge -->
              <div class="app-admin-policy-notice" style="display: flex; align-items: flex-start; gap: 0.65rem; padding: 0.85rem; border-radius: 6px; background: var(--forge-primary-bg); border: 1px solid var(--forge-border); border-left: 3px solid var(--forge-primary);">
                <div style="color: var(--forge-primary); margin-top: 1px;">${astryxIcons.shield || ''}</div>
                <div style="font-size: 0.77rem; line-height: 1.4; color: var(--forge-text-muted);">
                  <strong style="color: var(--forge-text-main);">Zero-Trust Anti-Self-Approval Active:</strong>
                  App administrators are strictly blocked from approving their own access requests. Peer or super-admin validation is enforced by the portal core.
                </div>
              </div>

              <!-- Save Policy Action -->
              <div style="display: flex; justify-content: flex-end; padding-top: 0.5rem;">
                <button type="button" class="astryx-btn btn-primary" id="btn-save-gov-policy" style="font-size: 0.82rem;">
                  Save Access Policy
                </button>
              </div>
            </div>
          </div>

          <!-- TAB 3: Ingress & Air-Gap Routing (Super Admin Focus) -->
          <div id="gov-tab-infra" class="gov-tab-panel" style="display: none;">
            <div style="display: flex; flex-direction: column; gap: 1.25rem;">
              <div id="gov-infra-superadmin-alert" style="display: flex; align-items: center; gap: 0.65rem; padding: 0.75rem 1rem; border-radius: 6px; background: var(--forge-warning-bg); border: 1px solid var(--forge-border); border-left: 3px solid var(--forge-warning);">
                <div style="color: var(--forge-warning);">${astryxIcons.shield || ''}</div>
                <div style="font-size: 0.78rem; color: var(--forge-text-muted);">
                  <strong style="color: var(--forge-text-main);">Infrastructure Control Gate:</strong>
                  Route paths and internal port mappings are protected settings. Changes take effect on the Caddy / Nginx gateway.
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label for="gov-infra-ingress-path" style="display: block; font-size: 0.8rem; font-weight: 500; color: var(--forge-text-muted); margin-bottom: 0.35rem;">
                    Gateway Ingress Route
                  </label>
                  <input type="text" id="gov-infra-ingress-path" class="form-input" style="font-size: 0.82rem; font-family: var(--forge-font-mono, monospace);" placeholder="/telemetry" />
                </div>
                <div class="form-group">
                  <label for="gov-infra-internal-port" style="display: block; font-size: 0.8rem; font-weight: 500; color: var(--forge-text-muted); margin-bottom: 0.35rem;">
                    Internal Microservice Port
                  </label>
                  <input type="number" id="gov-infra-internal-port" class="form-input" style="font-size: 0.82rem; font-family: var(--forge-font-mono, monospace);" placeholder="3002" />
                </div>
              </div>

              <div class="form-group">
                <label for="gov-infra-app-status" style="display: block; font-size: 0.8rem; font-weight: 500; color: var(--forge-text-muted); margin-bottom: 0.35rem;">
                  Ingress Lifecycle Status
                </label>
                <select id="gov-infra-app-status" class="form-input" style="font-size: 0.82rem;">
                  <option value="ONLINE">ONLINE (Active Ingress & Health Checks)</option>
                  <option value="STANDBY">STANDBY (Registered, Ingress Disabled)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Maintenance Notice to Users)</option>
                </select>
              </div>

              <!-- Air-Gap Network Verification Indicator -->
              <div class="app-gov-section-card" style="padding: 1rem; border-radius: 6px; border-style: solid;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <div style="color: var(--forge-primary);">${astryxIcons.network || ''}</div>
                    <div>
                      <div style="font-size: 0.82rem; font-weight: 600; color: var(--forge-text-main);">Air-Gap Isolation (core-airgap-net)</div>
                      <div style="font-size: 0.74rem; color: var(--forge-text-muted);">Zero external egress, strictly routed via gateway.</div>
                    </div>
                  </div>
                  <span class="astryx-badge badge-online" style="font-size: 0.7rem;">Active Air-Gap</span>
                </div>
              </div>

              <div id="gov-infra-save-container" style="display: flex; justify-content: flex-end;">
                <button type="button" class="astryx-btn btn-primary" id="btn-save-gov-infra" style="font-size: 0.82rem;">
                  Update Infrastructure Routing
                </button>
              </div>
            </div>
          </div>

          <!-- TAB 4: Entitled Users & Metrics -->
          <div id="gov-tab-metrics" class="gov-tab-panel" style="display: none;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.85rem; margin-bottom: 1.25rem;">
              <div class="gov-metric-card">
                <div style="font-size: 0.74rem; color: var(--forge-text-muted); margin-bottom: 0.35rem;">Active Entitled Users</div>
                <div id="gov-metric-users" style="font-size: 1.45rem; font-weight: 700; color: var(--forge-text-main);">0</div>
              </div>
              <div class="gov-metric-card">
                <div style="font-size: 0.74rem; color: var(--forge-text-muted); margin-bottom: 0.35rem;">Pending Access Requests</div>
                <div id="gov-metric-pending" style="font-size: 1.45rem; font-weight: 700; color: var(--forge-primary);">0</div>
              </div>
              <div class="gov-metric-card">
                <div style="font-size: 0.74rem; color: var(--forge-text-muted); margin-bottom: 0.35rem;">Avg SLA Compliance</div>
                <div id="gov-metric-sla" style="font-size: 1.45rem; font-weight: 700; color: var(--forge-success);">100%</div>
              </div>
            </div>

            <!-- Entitled Users Section -->
            <div class="app-gov-section-card" style="margin-bottom: 1.25rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
                <div>
                  <h5 style="margin: 0; font-size: 0.88rem; font-weight: 600; color: var(--forge-text-main);">Active Users with Access</h5>
                  <p style="margin: 0.15rem 0 0 0; font-size: 0.74rem; color: var(--forge-text-muted);">
                    Employees currently entitled to launch this application. Revoke access at any time.
                  </p>
                </div>
                <div class="canvas-search-input-wrap" style="width: 200px;">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" id="gov-users-search-input" placeholder="Filter users..." style="font-size: 0.76rem; height: 28px;" />
                </div>
              </div>

              <div class="table-responsive" style="max-height: 260px; overflow-y: auto;">
                <table class="astryx-table" style="width: 100%; font-size: 0.78rem;">
                  <thead>
                    <tr>
                      <th style="padding: 0.5rem 0.75rem; text-align: left;">User</th>
                      <th style="padding: 0.5rem 0.75rem; text-align: left;">Department</th>
                      <th style="padding: 0.5rem 0.75rem; text-align: left;">Granted Date</th>
                      <th style="padding: 0.5rem 0.75rem; text-align: left;">Approver</th>
                      <th style="padding: 0.5rem 0.75rem; text-align: right;">Action</th>
                    </tr>
                  </thead>
                  <tbody id="gov-app-users-tbody">
                    <tr><td colspan="5" style="text-align: center; padding: 1.5rem; color: var(--forge-text-muted);">Loading active users...</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="app-gov-section-card" style="text-align: center; padding: 1rem;">
              <p style="margin: 0 0 0.65rem 0; font-size: 0.8rem; color: var(--forge-text-muted);">
                Need to process incoming access requests for this application?
              </p>
              <button type="button" class="astryx-btn btn-ghost btn-sm" id="gov-jump-to-requests-btn" style="font-size: 0.8rem;">
                ${astryxIcons.bell || ''} Review Pending Access Requests
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}
