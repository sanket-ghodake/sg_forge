/**
 * @forge/portal - Admin App Catalog & Permissions View (2026 LTS)
 * Micro-app registry, ingress port management, and department access policy matrix.
 */

import { astryxIcons } from '@forge/ui';
import { getPortalApps } from './ui-apps-data';

/**
 * renderAdminAppsView
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function renderAdminAppsView(): string {
  const visibleApps = getPortalApps(['roles/admin']).allApps;
  return `
    <div id="view-admin-apps" class="portal-page-view">
      <!-- Header -->
      <div class="portal-view-header">
        <div>
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div class="portal-view-badge" style="background: rgba(var(--forge-primary-rgb, 99, 102, 241), 0.15); color: var(--forge-primary);">
              <span class="badge-dot" style="background: var(--forge-primary);"></span>
              <span>Admin Console</span>
            </div>
            <span class="portal-view-audience" style="font-size: 0.74rem; color: var(--forge-text-subtle);">Audience: <strong style="color: var(--forge-text-muted); font-weight: 500;">Admins & IT Leads</strong></span>
          </div>
          <h1 class="portal-view-title">App Store & Permissions</h1>
          <p class="portal-view-desc">
            Register internal Forge micro-apps, manage ingress routes, and configure department access policies.
          </p>
        </div>

        <div class="portal-view-actions">
          <button class="astryx-btn btn-primary" id="open-register-app-btn">
            ${astryxIcons.plus || '+'} Register Micro-App
          </button>
        </div>
      </div>

      <!-- App Store Table -->
      <div class="astryx-table-container">
        <table class="astryx-table" id="admin-apps-table">
          <thead>
            <tr>
              <th>Micro-App</th>
              <th>Ingress Route</th>
              <th>Internal Port</th>
              <th>Access Policy</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${visibleApps.map(app => `
              <tr data-app-id="${app.id}">
                <td>
                  <div class="table-user-cell">
                    <div class="app-card-icon-box" style="width: 32px; height: 32px; font-size: 0.9rem;">${app.iconSvg}</div>
                    <div>
                      <div class="table-user-name">${app.name}</div>
                      <div class="table-user-email">${app.category}</div>
                    </div>
                  </div>
                </td>
                <td><code>${app.ingressPath}</code></td>
                <td><span class="app-port-tag">:${app.port}</span></td>
                <td>
                  <span class="astryx-badge ${app.isRestricted ? 'badge-warning' : 'badge-online'}">
                    ${app.requiredRole ? app.requiredRole : 'All Active Employees'}
                  </span>
                </td>
                <td>
                  <span class="status-indicator status-${app.status === 'ONLINE' ? 'online' : 'away'}"></span>
                  <span style="font-size: 0.8rem; color: var(--forge-text-muted); margin-left: 4px;">${app.status === 'ONLINE' ? 'Active Ingress' : 'Standby'}</span>
                </td>
                <td style="text-align: right;">
                  <button class="astryx-btn btn-sm btn-ghost edit-app-policy-btn" data-id="${app.id}" data-astryx-tooltip="Configure Access Policy">
                    ${astryxIcons.settings || '⚙️'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
