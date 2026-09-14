/**
 * @forge/dev-dashboard - Organization Setup Modal Dialogs Renderer (2026 LTS)
 * Modular Astryx modal dialogs for Departments, Hierarchy Tiers, and EID Configuration.
 * Universal Zero-Emoji Standard & 100% Vector SVGs.
 * @requirements [HLR-UI-401] [LLR-UI-001] [LLR-AUTH-009]
 */

import { astryxIcons } from '@forge/ui';

/**
 * getOrgSetupModalsHtml
 * @requirements [HLR-UI-401] [LLR-UI-001] [LLR-AUTH-009]
 */
export function getOrgSetupModalsHtml(): string {
  return `
  <!-- Add / Edit Department Unit Modal -->
  <div class="astryx-modal-backdrop" id="modal-org-department" onclick="if(event.target===this)closeDepartmentModal()">
    <div class="astryx-modal" style="max-width: 540px; width: 94vw;">
      <div class="astryx-modal-header">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.building}</span>
          <h3 id="modal-dept-title" style="margin: 0; font-size: 1.05rem; font-weight: 600;">Add Department / Unit</h3>
        </div>
        <button class="astryx-modal-close" onclick="closeDepartmentModal()">&times;</button>
      </div>
      <form class="astryx-modal-body" onsubmit="saveDepartmentForm(event)" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem;">
        <input type="hidden" id="dept-form-id" value="">
        <div>
          <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Department / Unit Name *</label>
          <input type="text" class="form-input" id="dept-form-name" required placeholder="e.g. Core Platform Infrastructure" style="width: 100%;">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Department Code</label>
            <input type="text" class="form-input" id="dept-form-code" placeholder="e.g. ENG-INFRA" style="width: 100%; text-transform: uppercase;">
          </div>
          <div>
            <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Hierarchy Level *</label>
            <select class="form-input" id="dept-form-type" required style="width: 100%;"></select>
          </div>
        </div>

        <div>
          <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Parent Department / Unit</label>
          <select class="form-input" id="dept-form-parent" style="width: 100%;">
            <option value="">(None / Top Level Division)</option>
          </select>
          <span style="font-size: 0.72rem; color: var(--forge-text-muted); margin-top: 0.25rem; display: block;">Nested units inherit parent hierarchy paths automatically.</span>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; border-top: 1px solid var(--forge-border); padding-top: 0.85rem;">
          <button type="button" class="astryx-btn btn-outline" onclick="closeDepartmentModal()">Cancel</button>
          <button type="submit" class="astryx-btn btn-primary" id="dept-form-submit-btn">${astryxIcons.check} Save Department</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Add / Edit Hierarchy Level Type Modal -->
  <div class="astryx-modal-backdrop" id="modal-org-level" onclick="if(event.target===this)closeLevelModal()">
    <div class="astryx-modal" style="max-width: 480px; width: 94vw;">
      <div class="astryx-modal-header">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.layers}</span>
          <h3 id="modal-level-title" style="margin: 0; font-size: 1.05rem; font-weight: 600;">Add Hierarchy Level Tier</h3>
        </div>
        <button class="astryx-modal-close" onclick="closeLevelModal()">&times;</button>
      </div>
      <form class="astryx-modal-body" onsubmit="saveLevelForm(event)" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem;">
        <input type="hidden" id="level-form-id" value="">
        <div>
          <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Level Tier Name *</label>
          <input type="text" class="form-input" id="level-form-name" required placeholder="e.g. Division, Department, Squad" style="width: 100%;">
        </div>

        <div>
          <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Level Order Rank *</label>
          <input type="number" class="form-input" id="level-form-order" required min="1" max="20" placeholder="1 = Topmost tier (e.g. Division)" style="width: 100%;">
          <span style="font-size: 0.72rem; color: var(--forge-text-muted); margin-top: 0.25rem; display: block;">Lower numerical rank denotes higher structural authority.</span>
        </div>

        <div>
          <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Description</label>
          <input type="text" class="form-input" id="level-form-desc" placeholder="e.g. High-level operating business unit" style="width: 100%;">
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; border-top: 1px solid var(--forge-border); padding-top: 0.85rem;">
          <button type="button" class="astryx-btn btn-outline" onclick="closeLevelModal()">Cancel</button>
          <button type="submit" class="astryx-btn btn-primary">${astryxIcons.check} Save Level</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Organization Profile & EID Settings Modal -->
  <div class="astryx-modal-backdrop" id="modal-org-settings" onclick="if(event.target===this)closeOrgSettingsModal()">
    <div class="astryx-modal" style="max-width: 580px; width: 94vw;">
      <div class="astryx-modal-header">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.settings}</span>
          <h3 style="margin: 0; font-size: 1.05rem; font-weight: 600;">Organization Foundation & EID Rules</h3>
        </div>
        <button class="astryx-modal-close" onclick="closeOrgSettingsModal()">&times;</button>
      </div>

      <div class="emp-drawer-tabs" style="padding: 0 1.25rem;">
        <button class="emp-tab-btn active" id="btn-tab-org-identity" onclick="switchOrgSettingsTab('identity')">Identity & Branding</button>
        <button class="emp-tab-btn" id="btn-tab-org-eid" onclick="switchOrgSettingsTab('eid')">EID Format & Generator</button>
      </div>

      <div class="astryx-modal-body" style="padding: 1.25rem;">
        <!-- Tab 1: Organization Identity -->
        <form id="form-org-identity" onsubmit="saveOrgProfileForm(event)" style="display: flex; flex-direction: column; gap: 0.85rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div>
              <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Legal Organization Name *</label>
              <input type="text" class="form-input" id="org-settings-name" required placeholder="e.g. Acme Global Inc" style="width: 100%;">
            </div>
            <div>
              <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Primary Corporate Domain *</label>
              <input type="text" class="form-input" id="org-settings-domain" required placeholder="e.g. acme.internal" style="width: 100%;">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div>
              <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Brand Display Name</label>
              <input type="text" class="form-input" id="org-settings-brand" placeholder="e.g. Acme" style="width: 100%;">
            </div>
            <div>
              <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Brand Tagline</label>
              <input type="text" class="form-input" id="org-settings-tagline" placeholder="e.g. Next-Gen Engineering" style="width: 100%;">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div>
              <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Default Timezone</label>
              <select class="form-input" id="org-settings-timezone" style="width: 100%;">
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              </select>
            </div>
            <div>
              <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Corporate Contact Email</label>
              <input type="email" class="form-input" id="org-settings-email" placeholder="admin@acme.internal" style="width: 100%;">
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; border-top: 1px solid var(--forge-border); padding-top: 0.85rem;">
            <button type="button" class="astryx-btn btn-outline" onclick="closeOrgSettingsModal()">Cancel</button>
            <button type="submit" class="astryx-btn btn-primary">${astryxIcons.check} Save Organization Profile</button>
          </div>
        </form>

        <!-- Tab 2: EID Format Generator -->
        <form id="form-org-eid" onsubmit="saveEidConfigForm(event)" style="display: none; flex-direction: column; gap: 0.85rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.65rem;">
            <div>
              <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">EID Prefix *</label>
              <input type="text" class="form-input" id="eid-settings-prefix" required placeholder="e.g. EMP, SG, ACME" oninput="updateEidPreview()" style="width: 100%; text-transform: uppercase;">
            </div>
            <div>
              <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Digit Padding *</label>
              <select class="form-input" id="eid-settings-padding" onchange="updateEidPreview()" style="width: 100%;">
                <option value="3">3 Digits (001)</option>
                <option value="4" selected>4 Digits (0001)</option>
                <option value="5">5 Digits (00001)</option>
                <option value="6">6 Digits (000001)</option>
              </select>
            </div>
            <div>
              <label style="font-size: 0.78rem; font-weight: 600; display: block; margin-bottom: 0.25rem;">Counter Starting Seed</label>
              <input type="number" class="form-input" id="eid-settings-counter" min="0" placeholder="0" oninput="updateEidPreview()" style="width: 100%;">
            </div>
          </div>

          <!-- Live Dynamic Preview Box -->
          <div style="background: var(--forge-bg-card); border: 1px solid var(--forge-border); border-radius: var(--forge-radius-sm); padding: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <span style="font-size: 0.75rem; color: var(--forge-text-muted); display: block; margin-bottom: 0.2rem;">Live EID Sample Preview:</span>
              <span id="eid-preview-badge" class="astryx-badge" style="font-size: 0.92rem; font-family: monospace; font-weight: 700; color: var(--forge-primary); border-color: var(--forge-primary);">EMP-0001</span>
            </div>
            <span style="font-size: 0.72rem; color: var(--forge-text-muted); max-width: 240px; text-align: right;">
              Automatically assigned when adding new members via directory or batch import.
            </span>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; border-top: 1px solid var(--forge-border); padding-top: 0.85rem;">
            <button type="button" class="astryx-btn btn-outline" onclick="closeOrgSettingsModal()">Cancel</button>
            <button type="submit" class="astryx-btn btn-primary">${astryxIcons.check} Save EID Format</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  `;
}
