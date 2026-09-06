/**
 * @forge/portal - Admin Org Chart Builder View (2026 LTS)
 * Visual hierarchy editor, department creation, reporting line restructuring, and draft versioning.
 */

import { astryxIcons } from '@forge/ui';

/**
 * renderAdminOrgView
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function renderAdminOrgView(): string {
  return `
    <div id="view-admin-org" class="portal-page-view">
      <!-- Header -->
      <div class="portal-view-header">
        <div>
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div class="portal-view-badge" style="background: rgba(var(--forge-primary-rgb, 99, 102, 241), 0.15); color: var(--forge-primary);">
              <span class="badge-dot" style="background: var(--forge-primary);"></span>
              <span>Admin Console</span>
            </div>
            <span class="portal-view-audience" style="font-size: 0.74rem; color: var(--forge-text-subtle);">Audience: <strong style="color: var(--forge-text-muted); font-weight: 500;">Admins & HR Leads</strong></span>
          </div>
          <h1 class="portal-view-title">Organization Chart Builder</h1>
          <p class="portal-view-desc">
            Restructure departments, add project pods, assign department heads, and publish changes to the live company map.
          </p>
        </div>

        <div class="portal-view-actions">
          <button class="astryx-btn btn-outline" id="add-dept-node-btn">
            ${astryxIcons.plus || '+'} Add Department
          </button>
          <button class="astryx-btn btn-primary" id="publish-org-changes-btn">
            ${astryxIcons.check || '✓'} Publish Live
          </button>
        </div>
      </div>

      <!-- Hierarchy Builder Canvas Container -->
      <div class="astryx-card" style="padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.75rem;">
          <div>
            <h3 style="margin: 0; font-size: 1rem; color: var(--forge-text-main);">Organizational Tree Structure</h3>
            <span style="font-size: 0.78rem; color: var(--forge-text-muted);">Current Active Version: v2.4 (Live)</span>
          </div>
          <div class="astryx-badge badge-online">Synced with Turso DB</div>
        </div>

        <div class="org-tree-builder-view" id="admin-org-tree-container">
          <div style="text-align: center; padding: 2.5rem; color: var(--forge-text-muted);">
            <span class="badge-dot" style="background: var(--forge-primary); margin-right: 0.5rem;"></span>
            <span>Loading live organizational hierarchy from SQLite database...</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
