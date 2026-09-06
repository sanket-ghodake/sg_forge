/**
 * @forge/portal - Admin Workspace Settings & Security View (2026 LTS)
 * Workspace branding, Google/SAML SSO configuration, and Turso DB health cards.
 */

import { astryxIcons } from '@forge/ui';
import { loadBrandConfig } from '@forge/sdk';

/**
 * renderAdminSettingsView
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function renderAdminSettingsView(): string {
  const brand = loadBrandConfig();

  return `
    <div id="view-admin-settings" class="portal-page-view">
      <!-- Header -->
      <div class="portal-view-header">
        <div>
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div class="portal-view-badge" style="background: rgba(var(--forge-primary-rgb, 99, 102, 241), 0.15); color: var(--forge-primary);">
              <span class="badge-dot" style="background: var(--forge-primary);"></span>
              <span>Admin Console</span>
            </div>
            <span class="portal-view-audience" style="font-size: 0.74rem; color: var(--forge-text-subtle);">Audience: <strong style="color: var(--forge-text-muted); font-weight: 500;">Super Admins & Workspace Owners</strong></span>
          </div>
          <h1 class="portal-view-title">Company Settings & Security</h1>
          <p class="portal-view-desc">
            Global organization identity, Single Sign-On (SSO) credentials, and Turso libSQL isolated database monitor.
          </p>
        </div>
      </div>

      <div class="profile-grid-layout">
        <!-- Main Settings Column -->
        <div class="profile-main-col">
          <!-- Brand Identity Card -->
          <div class="astryx-card">
            <h3 style="margin: 0 0 0.5rem; font-size: 1rem; color: var(--forge-text-main);">Organization Identity</h3>
            <p style="margin: 0 0 1.25rem; font-size: 0.8rem; color: var(--forge-text-muted);">
              Configure company name, public branding, and domain settings.
            </p>

            <div class="profile-form-grid">
              <div class="form-field">
                <label>Company Legal Name</label>
                <input type="text" class="astryx-input" id="settings-brand-name" value="${brand.name}" />
              </div>
              <div class="form-field">
                <label>Brand Tagline</label>
                <input type="text" class="astryx-input" id="settings-brand-tagline" value="${brand.tagline || 'Enterprise Monorepo Platform'}" />
              </div>
              <div class="form-field">
                <label>Custom Workspace Domain</label>
                <input type="text" class="astryx-input" value="${process.env.PUBLIC_DOMAIN || 'app.' + (brand.domain || 'forge.internal')}" disabled />
              </div>
              <div class="form-field">
                <label>Support Contact Email</label>
                <input type="email" class="astryx-input" value="${brand.supportEmail || process.env.SUPPORT_EMAIL || 'support@' + (brand.domain || 'forge.internal')}" />
              </div>
            </div>

            <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end;">
              <button class="astryx-btn btn-primary" id="save-brand-btn">
                ${astryxIcons.check || '✓'} Update Branding
              </button>
            </div>
          </div>

          <!-- Single Sign-On (SSO) Card -->
          <div class="astryx-card" style="margin-top: 1.5rem;">
            <h3 style="margin: 0 0 0.5rem; font-size: 1rem; color: var(--forge-text-main);">Enterprise Single Sign-On (SSO)</h3>
            <p style="margin: 0 0 1.25rem; font-size: 0.8rem; color: var(--forge-text-muted);">
              Manage OAuth 2.0 and SAML providers for zero-trust login.
            </p>

            <div class="sso-providers-list">
              <div class="sso-provider-item">
                <div class="sso-provider-info">
                  <div class="sso-provider-title">Enterprise OIDC / OpenID Connect</div>
                  <div class="sso-provider-desc">Enables @${brand.domain || 'forge.internal'} email login with OAuth 2.0 OpenID Connect</div>
                </div>
                <div class="astryx-badge badge-online">Connected</div>
              </div>

              <div class="sso-provider-item" style="margin-top: 0.75rem;">
                <div class="sso-provider-info">
                  <div class="sso-provider-title">Enterprise SAML 2.0 Identity Provider</div>
                  <div class="sso-provider-desc">Enterprise directory integration for automated SCIM provisioning</div>
                </div>
                <button class="astryx-btn btn-sm btn-outline">Configure</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Column: Database & Service Health -->
        <div class="profile-side-col">
          <div class="astryx-card">
            <h3 style="margin: 0 0 0.5rem; font-size: 0.95rem; color: var(--forge-text-main);">Turso libSQL Database</h3>
            <p style="margin: 0 0 1rem; font-size: 0.78rem; color: var(--forge-text-muted);">
              Dedicated SQLite/libSQL isolated database per app.
            </p>

            <div class="db-status-box">
              <div class="db-status-row">
                <span>Database Engine</span>
                <strong>libSQL (Portable)</strong>
              </div>
              <div class="db-status-row">
                <span>Central Schema</span>
                <strong>v2026.09 (Polymorphic)</strong>
              </div>
              <div class="db-status-row">
                <span>Encryption State</span>
                <span class="astryx-badge badge-online">AES-256 GCM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
