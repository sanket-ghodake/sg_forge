/**
 * @forge/portal - Profile & Account Security View Renderer (2026 LTS)
 * Personal profile details, active IAM roles & scopes, active sessions, and personal API tokens.
 */

import { astryxIcons } from '@forge/ui';
import type { HeaderUserContext } from './layout-header';

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseUserAgentMeta(ua?: string): string {
  if (!ua) return 'Modern Web Browser · Active Now';
  let os = 'Linux / Unix';
  if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux x86_64';

  let browser = 'Chrome';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';

  return `${os} · ${browser} · Active Now`;
}

/**
 * renderProfileView
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function renderProfileView(user: HeaderUserContext): string {
  const initial = (user.displayName || 'U').charAt(0).toUpperCase();
  const safeName = escapeHtml(user.displayName);
  const safeEmail = escapeHtml(user.email);

  return `
    <div id="view-profile" class="portal-page-view">
      <!-- Header -->
      <div class="portal-view-header">
        <div>
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div class="portal-view-badge">
              <span class="badge-dot"></span>
              <span>Account Center</span>
            </div>
            <span class="portal-view-audience" style="font-size: 0.74rem; color: var(--forge-text-subtle);">Audience: <strong style="color: var(--forge-text-muted); font-weight: 500;">Individual User</strong></span>
          </div>
          <h1 class="portal-view-title">My Profile & Account</h1>
          <p class="portal-view-desc">
            Manage your personal identity, review granted IAM permissions, inspect active sessions, and generate API tokens.
          </p>
        </div>
      </div>

      <div class="profile-grid-layout">
        <!-- Left Column: Identity & Details -->
        <div class="profile-main-col">
          <div class="astryx-card profile-card">
            <div class="profile-hero-section">
              <div class="profile-hero-avatar">${initial}</div>
              <div class="profile-hero-info">
                <h2 class="profile-hero-name">${safeName}</h2>
                <div class="profile-hero-email">${safeEmail}</div>
                <div class="profile-hero-badge">
                  <span class="status-indicator status-online"></span>
                  <span>${user.isAdmin ? 'Super Admin / Workspace Admin' : 'Full-Time Member'}</span>
                </div>
              </div>
            </div>

            <div class="profile-form-grid">
              <div class="form-field">
                <label>Display Name</label>
                <input type="text" class="astryx-input" id="profile-display-name" value="${safeName}" />
              </div>
              <div class="form-field">
                <label>Work Email</label>
                <input type="email" class="astryx-input" value="${safeEmail}" disabled />
              </div>
              <div class="form-field">
                <label>Timezone</label>
                <select class="astryx-select" id="profile-timezone">
                  <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST - UTC-8:00)</option>
                  <option value="America/New_York">America/New_York (EST - UTC-5:00)</option>
                  <option value="Europe/London">Europe/London (GMT - UTC+0:00)</option>
                  <option value="Europe/Berlin">Europe/Berlin (CET - UTC+1:00)</option>
                </select>
              </div>
              <div class="form-field">
                <label>Working Hours</label>
                <input type="text" class="astryx-input" id="profile-hours" value="09:00 - 18:00 (Mon - Fri)" />
              </div>
            </div>

            <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end;">
              <button class="astryx-btn btn-primary" id="save-profile-btn">
                ${astryxIcons.check || '✓'} Save Changes
              </button>
            </div>
          </div>

          <!-- Active Sessions Card -->
          <div class="astryx-card" style="margin-top: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <div>
                <h3 style="margin: 0; font-size: 1rem; color: var(--forge-text-main);">Active Login Sessions</h3>
                <p style="margin: 0.2rem 0 0; font-size: 0.8rem; color: var(--forge-text-muted);">
                  Zero-Trust ASVS 5.0 sessions authenticated with your cryptographic keys.
                </p>
              </div>
              <button class="astryx-btn btn-sm btn-outline" id="revoke-all-sessions-btn">
                Revoke Other Sessions
              </button>
            </div>

            <div class="sessions-list" id="active-sessions-list">
              <div class="session-item current-session">
                <div class="session-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                </div>
                <div class="session-info">
                  <div class="session-device">Current Browser Session <span class="astryx-badge badge-online">This Device</span></div>
                  <div class="session-meta" id="current-session-meta">${parseUserAgentMeta(user.userAgent)}</div>
                </div>
                <div class="session-status">Active</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Granted IAM Roles & Scopes -->
        <div class="profile-side-col">
          <div class="astryx-card">
            <h3 style="margin: 0 0 0.5rem; font-size: 0.95rem; color: var(--forge-text-main);">Granted IAM Roles</h3>
            <p style="margin: 0 0 1rem; font-size: 0.78rem; color: var(--forge-text-muted);">
              Security scopes assigned by workspace administrators.
            </p>

            <div class="iam-roles-list">
              ${user.roles.map(r => `
                <div class="iam-role-pill">
                  <span class="role-icon">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--forge-primary)" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  </span>
                  <span class="role-name">${escapeHtml(r)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Personal Access Tokens (PAT) -->
          <div class="astryx-card" style="margin-top: 1.5rem;">
            <h3 style="margin: 0 0 0.5rem; font-size: 0.95rem; color: var(--forge-text-main);">Developer API Tokens</h3>
            <p style="margin: 0 0 1rem; font-size: 0.78rem; color: var(--forge-text-muted);">
              Scoped tokens for CLI authentication and automated scripts.
            </p>
            <button class="astryx-btn btn-sm btn-outline" style="width: 100%;" id="generate-pat-btn">
              ${astryxIcons.key || '🔑'} Generate New Token
            </button>
            <div id="profile-tokens-list" style="margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}
