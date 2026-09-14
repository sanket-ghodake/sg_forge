/**
 * @forge/portal - Application Access Requests & Audit History Modal (2026 LTS)
 * Executive administrative console for reviewing request streams, approval status,
 * business justifications, and decision trails across Forge applications.
 *
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */

import { astryxIcons } from '@forge/ui';

/**
 * renderAppRequestHistoryModal
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function renderAppRequestHistoryModal(): string {
  return `
    <div class="astryx-modal-backdrop" id="modal-app-request-history" role="dialog" aria-modal="true" aria-hidden="true">
      <div class="astryx-modal app-history-dialog-card" style="max-width: 820px; width: 94vw; max-height: 90vh; display: flex; flex-direction: column;">
        
        <!-- Header -->
        <div class="astryx-modal-header" style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--forge-border); display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <div id="app-history-modal-icon" class="app-card-icon-box" style="width: 42px; height: 42px; font-size: 1.15rem; flex-shrink: 0;">
              ${astryxIcons.history || astryxIcons.clock || ''}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <h3 id="app-history-modal-title" style="margin: 0; font-size: 1.15rem; font-weight: 600; color: var(--forge-text-main);">
                  Access Requests & Audit History
                </h3>
                <span id="app-history-modal-app-badge" class="astryx-badge" style="font-family: var(--forge-font-mono, monospace); font-size: 0.72rem; background: var(--forge-primary-bg); color: var(--forge-primary); border: 1px solid var(--forge-border);">
                  All Applications
                </span>
                <span id="app-history-pending-badge" class="astryx-badge badge-warning" style="font-size: 0.72rem; display: none;">
                  0 Pending
                </span>
              </div>
              <p id="app-history-modal-subtitle" style="margin: 0.2rem 0 0 0; font-size: 0.8rem; color: var(--forge-text-muted);">
                View application enrollment logs, audit justification statements, and resolve pending approvals.
              </p>
            </div>
          </div>
          <button type="button" class="astryx-modal-close" data-close-modal="modal-app-request-history" id="close-app-history-btn" aria-label="Close History Modal">
            ${astryxIcons.x || '✕'}
          </button>
        </div>

        <!-- Controls & Filters Bar -->
        <div class="app-history-controls-bar" style="padding: 0.85rem 1.5rem; border-bottom: 1px solid var(--forge-border); background: var(--forge-bg-card); display: flex; flex-direction: column; gap: 0.75rem;">
          
          <!-- Upper Row: App Scope & Search Bar -->
          <div style="display: grid; grid-template-columns: 220px 1fr auto; gap: 0.75rem; align-items: center;">
            <!-- Application Switcher Dropdown -->
            <div style="position: relative;">
              <select id="app-history-app-select" class="astryx-select" style="width: 100%; font-size: 0.82rem; height: 36px; padding: 0 2rem 0 0.75rem;">
                <option value="all">All Applications</option>
              </select>
            </div>

            <!-- Search Filter -->
            <div style="position: relative;">
              <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--forge-text-muted); pointer-events: none; display: flex;">
                ${astryxIcons.search || ''}
              </span>
              <input type="text" id="app-history-search-input" class="form-input" placeholder="Search applicant, email, or justification notes..." style="width: 100%; box-sizing: border-box; padding-left: 2.2rem; font-size: 0.82rem; height: 36px;" />
            </div>

            <!-- Refresh Button -->
            <button type="button" id="app-history-refresh-btn" class="astryx-btn btn-secondary btn-sm" data-astryx-tooltip="Refresh Request Log" style="height: 36px; padding: 0 0.85rem;">
              ${astryxIcons.refresh || ''} Refresh
            </button>
          </div>

          <!-- Lower Row: Status Filter Tabs -->
          <div class="app-history-filter-tabs" style="display: flex; align-items: center; gap: 0.4rem; overflow-x: auto;">
            <button type="button" class="history-tab-btn active" data-history-filter="ALL">
              <span>All History</span>
              <span id="tab-count-all" class="astryx-badge" style="font-size: 0.68rem; padding: 0.1rem 0.4rem; background: var(--forge-border); color: var(--forge-text-main);">0</span>
            </button>
            <button type="button" class="history-tab-btn" data-history-filter="PENDING">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--forge-warning); margin-right: 4px;"></span>
              <span>Pending Review</span>
              <span id="tab-count-pending" class="astryx-badge badge-warning" style="font-size: 0.68rem; padding: 0.1rem 0.4rem;">0</span>
            </button>
            <button type="button" class="history-tab-btn" data-history-filter="APPROVED">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--forge-success); margin-right: 4px;"></span>
              <span>Approved</span>
              <span id="tab-count-approved" class="astryx-badge badge-online" style="font-size: 0.68rem; padding: 0.1rem 0.4rem;">0</span>
            </button>
            <button type="button" class="history-tab-btn" data-history-filter="REJECTED">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--forge-error); margin-right: 4px;"></span>
              <span>Declined</span>
              <span id="tab-count-rejected" class="astryx-badge badge-danger" style="font-size: 0.68rem; padding: 0.1rem 0.4rem;">0</span>
            </button>
          </div>
        </div>

        <!-- Scrollable Body: Request Cards Stream -->
        <div class="astryx-modal-body" style="padding: 1.25rem 1.5rem; overflow-y: auto; flex: 1; min-height: 320px;">
          <div id="app-history-stream" style="display: flex; flex-direction: column; gap: 1rem;">
            <!-- Rendered dynamically by client script -->
            <div style="text-align: center; padding: 3rem 1rem; color: var(--forge-text-muted);">
              <div style="display: inline-flex; padding: 1rem; border-radius: 50%; background: var(--forge-bg-card); margin-bottom: 0.75rem; border: 1px solid var(--forge-border);">
                ${astryxIcons.refresh || ''}
              </div>
              <p style="margin: 0; font-size: 0.88rem;">Loading application access requests...</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="astryx-modal-footer" style="padding: 0.85rem 1.5rem; border-top: 1px solid var(--forge-border); background: var(--forge-bg-card); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.74rem; color: var(--forge-text-subtle);">
            <span style="color: var(--forge-primary); display: inline-flex;">${astryxIcons.shield || ''}</span>
            <span>Zero-Trust Access Invariant: All decisions are recorded to the immutable audit log with administrator attribution.</span>
          </div>
          <button type="button" class="astryx-btn btn-ghost" data-close-modal="modal-app-request-history">Close</button>
        </div>

      </div>
    </div>

    <!-- Scoped Custom Styles for History Modal -->
    <style>
      .app-history-dialog-card {
        box-shadow: 0 28px 70px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.08);
      }
      [data-theme="light"] .app-history-dialog-card {
        box-shadow: 0 24px 50px -10px rgba(0, 0, 0, 0.18), 0 0 0 1px var(--forge-border);
      }
      .history-tab-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.4rem 0.85rem;
        border-radius: var(--forge-radius-sm, 6px);
        background: transparent;
        border: 1px solid transparent;
        font-size: 0.78rem;
        font-weight: 500;
        color: var(--forge-text-muted);
        cursor: pointer;
        transition: all 0.15s ease;
        white-space: nowrap;
      }
      .history-tab-btn:hover {
        color: var(--forge-text-main);
        background: var(--forge-bg-root);
      }
      .history-tab-btn.active {
        color: var(--forge-primary);
        background: var(--forge-primary-bg);
        border-color: rgba(99, 102, 241, 0.3);
        font-weight: 600;
      }
      .history-request-card {
        background: var(--forge-bg-surface);
        border: 1px solid var(--forge-border);
        border-radius: var(--forge-radius-sm, 8px);
        padding: 1.15rem;
        transition: border-color 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease;
        position: relative;
      }
      .history-request-card:hover {
        border-color: var(--forge-border-medium, rgba(255, 255, 255, 0.15));
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }
      [data-theme="light"] .history-request-card:hover {
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
      }
      .history-request-card.status-pending-card {
        border-left: 3px solid var(--forge-warning);
      }
      .history-request-card.status-approved-card {
        border-left: 3px solid var(--forge-success);
      }
      .history-request-card.status-rejected-card {
        border-left: 3px solid var(--forge-error);
      }
      .history-notes-box {
        background: var(--forge-bg-root);
        border: 1px solid var(--forge-border);
        border-radius: var(--forge-radius-sm, 6px);
        padding: 0.75rem 1rem;
        margin: 0.75rem 0;
        font-size: 0.81rem;
        line-height: 1.5;
        color: var(--forge-text-main);
        word-break: break-word;
        font-family: inherit;
        border-left: 3px solid var(--forge-primary);
      }
      [data-theme="light"] .history-notes-box {
        background: var(--forge-bg-surface);
        border-color: var(--forge-border);
        border-left-color: var(--forge-primary);
      }
      .history-user-avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--forge-primary-bg), var(--forge-bg-surface));
        border: 1px solid var(--forge-border);
        color: var(--forge-primary);
        font-weight: 700;
        font-size: 0.78rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .history-actions-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      @media (max-width: 640px) {
        .app-history-controls-bar > div:first-child {
          grid-template-columns: 1fr !important;
        }
        .history-card-header-row {
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 0.6rem !important;
        }
      }
    </style>
  `;
}
