/**
 * @forge-apps/code - Projects Catalog & Access Control UI (2026 LTS)
 * Astryx Design System with Live Single-Seat Status Indicators
 */

import { loadBrandConfig } from '../lib/sdk';
import { getAstryxHeaderHtml, getAstryxStyles, getAstryxToastScript, getAstryxTooltipScript, getHeadStateScript } from '../lib/ui';
import type { AuthUser } from '../lib/types';
import type { ProjectRecord, ActiveSessionRecord } from '../db/schema';

/**
 * renderCatalogHtml
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function renderCatalogHtml(
  user: AuthUser,
  projects: Array<ProjectRecord & { userRole?: string; activeSession?: ActiveSessionRecord | null }>
): string {
  const brand = loadBrandConfig();
  const userName = user.displayName || user.email;
  const isSuperAdmin = user.principalType === 'ADMIN' || user.roles?.includes('roles/super_admin');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand.name} - VS Code Workspaces</title>
  ${getHeadStateScript({ defaultTheme: 'dark' })}
  <style>
    ${getAstryxStyles()}
    .code-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.25rem;
      margin-top: 1.5rem;
    }
    .code-card {
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .code-card:hover {
      border-color: var(--forge-primary);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      border: 1px solid transparent;
    }
    .status-available {
      background: var(--forge-success-bg, rgba(16, 185, 129, 0.15));
      color: var(--forge-success);
      border-color: var(--forge-success);
    }
    .status-locked {
      background: var(--forge-accent-bg, rgba(239, 68, 68, 0.15));
      color: var(--forge-accent);
      border-color: var(--forge-accent);
    }
    .status-pending {
      background: var(--forge-warning-bg, rgba(245, 158, 11, 0.15));
      color: var(--forge-warning);
      border-color: var(--forge-warning);
    }
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      z-index: 9999;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-box {
      background: var(--forge-bg-surface);
      border: 1px solid var(--forge-border);
      border-radius: var(--forge-radius);
      max-width: 540px;
      width: 100%;
      padding: 1.5rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    }
    .astryx-input {
      width: 100%;
      box-sizing: border-box;
      background: var(--forge-bg-root);
      border: 1px solid var(--forge-border);
      color: var(--forge-text-main);
      padding: 0.6rem 0.75rem;
      border-radius: var(--forge-radius);
      font-size: 0.9rem;
      margin-top: 0.35rem;
      margin-bottom: 1rem;
    }
    .astryx-input:focus {
      outline: none;
      border-color: var(--forge-primary);
    }
  </style>
</head>
<body>
  ${getAstryxHeaderHtml('CODE', 'DEVELOPER WORKSPACES')}

  <main class="astryx-container" style="padding-top: 1.5rem; padding-bottom: 3rem;">
    <!-- Top Action Bar -->
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
      <div>
        <h1 style="font-size: 1.6rem; color: var(--forge-text-main); margin: 0 0 0.25rem 0;">
          💻 VS Code Cloud Workspaces
        </h1>
        <p style="color: var(--forge-text-muted); font-size: 0.9rem; margin: 0;">
          Authenticated as <strong>${userName}</strong> &bull;
          <span style="color: var(--forge-primary); font-weight: 600;">${isSuperAdmin ? '🛡️ Super Administrator' : '👨‍💻 Employee Developer'}</span>
        </p>
      </div>
      <div style="display: flex; gap: 0.75rem;">
        ${isSuperAdmin ? `<button class="astryx-btn btn-primary" onclick="openAddRepoModal()">+ Register Cloned Repo</button>` : ''}
        <a href="/portal" class="astryx-btn btn-outline">&larr; Portal</a>
      </div>
    </div>

    <!-- Security & Concurrency Notice -->
    <div style="background: var(--forge-bg-surface); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 0.85rem 1.15rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
      <span style="font-size: 1.25rem;">🔒</span>
      <div style="font-size: 0.85rem; color: var(--forge-text-muted); line-height: 1.4;">
        <strong style="color: var(--forge-text-main);">Single-Seat Remote Desktop Lock & Discard-on-Exit:</strong>
        Each repository allows 1 active session at a time. All file modifications and builds are strictly discarded upon session exit, leaving the server disk completely pristine.
      </div>
    </div>

    <!-- Projects Grid -->
    <div class="code-grid" id="projectGrid">
      ${projects.length === 0 ? `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--forge-text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">No repositories currently available</p>
          <p style="font-size: 0.85rem;">Contact your administrator to grant you access to cloned projects.</p>
        </div>
      ` : projects.map((p) => {
        const session = p.activeSession;
        const isLocked = Boolean(session && session.status === 'ACTIVE');
        const isPending = Boolean(session && session.status === 'PENDING_TAKEOVER');
        const isCurrentUser = Boolean(session && session.active_user_id === user.id);
        const canManage = isSuperAdmin || p.userRole === 'PROJECT_ADMIN';

        let badgeHtml = `<span class="status-badge status-available">● Available</span>`;
        if (isPending) {
          badgeHtml = `<span class="status-badge status-pending">⏳ Takeover Pending</span>`;
        } else if (isLocked) {
          badgeHtml = `<span class="status-badge status-locked">🔒 In Use (${session!.active_user_email})</span>`;
        }

        return `
        <div class="code-card" id="card-${p.id}">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <h3 style="margin: 0; font-size: 1.1rem; color: var(--forge-text-main); font-weight: 600;">
                📦 ${p.name}
              </h3>
              ${badgeHtml}
            </div>
            <p style="font-size: 0.82rem; color: var(--forge-text-muted); margin: 0 0 0.85rem 0; min-height: 2.2rem;">
              ${p.description || 'Cloned repository workspace on server'}
            </p>
            <div style="background: var(--forge-bg-root); border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 0.5rem 0.65rem; font-family: monospace; font-size: 0.75rem; color: var(--forge-text-muted); word-break: break-all; margin-bottom: 1rem;">
              ${p.fs_path}
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; font-size: 0.78rem;">
              <span style="color: var(--forge-text-muted);">Branch: <code style="color: var(--forge-primary);">${p.default_branch}</code></span>
              <span style="color: var(--forge-text-muted); font-weight: 600;">${p.userRole || 'DEVELOPER'}</span>
            </div>

            <div style="display: flex; gap: 0.5rem;">
              ${isLocked && !isCurrentUser ? `
                <button class="astryx-btn btn-primary" style="flex: 1; background: var(--forge-warning); border-color: var(--forge-warning); color: var(--forge-bg-root); font-weight: 600;" onclick="handleTakeover('${p.id}', '${session!.active_user_email}')">
                  ⚡ Takeover (60s)
                </button>
              ` : `
                <a href="/apps/code/ide/${p.id}" class="astryx-btn btn-primary" style="flex: 1; text-align: center; text-decoration: none;">
                  🚀 Open VS Code
                </a>
              `}

              ${canManage ? `
                <button class="astryx-btn btn-outline" style="padding: 0.5rem 0.75rem;" data-astryx-tooltip="Manage Access" onclick="openAccessModal('${p.id}', '${p.name}')">
                  ⚙️
                </button>
              ` : ''}
            </div>
          </div>
        </div>
        `;
      }).join('')}
    </div>
  </main>

  <!-- Add Repo Modal -->
  <div class="modal-overlay" id="addRepoModal">
    <div class="modal-box">
      <h2 style="font-size: 1.25rem; color: var(--forge-text-main); margin: 0 0 1rem 0;">Register Server Cloned Repository</h2>
      <form id="addRepoForm" onsubmit="submitAddRepo(event)">
        <label style="font-size: 0.82rem; color: var(--forge-text-muted);">Repository Name</label>
        <input type="text" class="astryx-input" id="repoName" required placeholder="e.g. Platform Microservices">

        <label style="font-size: 0.82rem; color: var(--forge-text-muted);">Server Local Directory Path</label>
        <input type="text" class="astryx-input" id="repoPath" required placeholder="/path/to/repository/...">

        <label style="font-size: 0.82rem; color: var(--forge-text-muted);">Description (Optional)</label>
        <input type="text" class="astryx-input" id="repoDesc" placeholder="Frontend & Backend service">

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
          <button type="button" class="astryx-btn btn-outline" onclick="closeModal('addRepoModal')">Cancel</button>
          <button type="submit" class="astryx-btn btn-primary">Register Repo</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Manage Access Modal -->
  <div class="modal-overlay" id="accessModal">
    <div class="modal-box">
      <h2 style="font-size: 1.25rem; color: var(--forge-text-main); margin: 0 0 0.5rem 0;" id="accessModalTitle">Manage Repo Access</h2>
      <p style="font-size: 0.82rem; color: var(--forge-text-muted); margin-bottom: 1rem;">Grant developer or project admin permissions to employees.</p>

      <div id="membersList" style="max-height: 200px; overflow-y: auto; margin-bottom: 1rem; border: 1px solid var(--forge-border); border-radius: var(--forge-radius); padding: 0.5rem;">
        <div style="text-align: center; color: var(--forge-text-muted); font-size: 0.8rem; padding: 1rem;">Loading members...</div>
      </div>

      <form id="addMemberForm" onsubmit="submitAddMember(event)" style="border-top: 1px solid var(--forge-border); padding-top: 1rem;">
        <h4 style="font-size: 0.9rem; color: var(--forge-text-main); margin: 0 0 0.5rem 0;">Add Employee Access</h4>
        <input type="email" class="astryx-input" id="memberEmail" required placeholder="employee@forge.internal" style="margin-bottom: 0.5rem;">
        <select class="astryx-input" id="memberRole" style="margin-bottom: 1rem;">
          <option value="DEVELOPER">Developer (Edit & Open)</option>
          <option value="PROJECT_ADMIN">Project Admin (Can Manage Repo)</option>
        </select>
        <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
          <button type="button" class="astryx-btn btn-outline" onclick="closeModal('accessModal')">Close</button>
          <button type="submit" class="astryx-btn btn-primary">Grant Access</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    ${getAstryxToastScript()}
    let activeProjectId = '';

    function openAddRepoModal() {
      document.getElementById('addRepoModal').style.display = 'flex';
    }

    function closeModal(id) {
      document.getElementById(id).style.display = 'none';
    }

    async function submitAddRepo(e) {
      e.preventDefault();
      const name = document.getElementById('repoName').value.trim();
      const path = document.getElementById('repoPath').value.trim();
      const desc = document.getElementById('repoDesc').value.trim();

      const res = await fetch('/apps/code/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, fsPath: path, description: desc })
      });
      const data = await res.json();
      if (res.ok) {
        window.astryxToast.success('Repository registered successfully');
        setTimeout(() => window.location.reload(), 500);
      } else {
        window.astryxToast.error(data.error || data.detail || 'Failed to register repository');
      }
    }

    async function handleTakeover(projectId, activeUserEmail) {
      const res = await fetch('/apps/code/api/session/takeover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });
      const data = await res.json();
      if (res.ok) {
        window.astryxToast.warning(data.message);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        window.astryxToast.error(data.error || data.detail || 'Takeover request failed');
      }
    }

    async function openAccessModal(projectId, projectName) {
      activeProjectId = projectId;
      document.getElementById('accessModalTitle').textContent = 'Access: ' + projectName;
      document.getElementById('accessModal').style.display = 'flex';
      loadMembers(projectId);
    }

    async function loadMembers(projectId) {
      const container = document.getElementById('membersList');
      container.innerHTML = '<div style="text-align: center; padding: 0.5rem; color: var(--forge-text-muted);">Loading...</div>';
      const res = await fetch('/apps/code/api/projects/' + projectId + '/members');
      const data = await res.json();

      if (!res.ok || !data.members || data.members.length === 0) {
        container.innerHTML = '<div style="font-size: 0.8rem; color: var(--forge-text-muted); text-align: center; padding: 0.5rem;">No explicit members assigned (Superadmins hold global access).</div>';
        return;
      }

      container.innerHTML = data.members.map(function(m) {
        return '<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0.2rem; border-bottom: 1px solid var(--forge-border); font-size: 0.8rem;">' +
          '<div><strong>' + m.user_name + '</strong> (' + m.user_email + ')<br><span style="color: var(--forge-primary); font-size: 0.72rem;">' + m.role + '</span></div>' +
          '<button class="astryx-btn btn-outline" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="removeMember(\\'' + projectId + '\\', \\'' + m.user_id + '\\')">Remove</button>' +
          '</div>';
      }).join('');
    }

    async function submitAddMember(e) {
      e.preventDefault();
      const email = document.getElementById('memberEmail').value.trim();
      const role = document.getElementById('memberRole').value;

      const res = await fetch('/apps/code/api/projects/' + activeProjectId + '/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      const data = await res.json();
      if (res.ok) {
        document.getElementById('memberEmail').value = '';
        window.astryxToast.success('Member added');
        loadMembers(activeProjectId);
      } else {
        window.astryxToast.error(data.error || 'Failed to add member');
      }
    }

    async function removeMember(projectId, userId) {
      const res = await fetch('/apps/code/api/projects/' + projectId + '/members/' + userId, {
        method: 'DELETE'
      });
      if (res.ok) {
        window.astryxToast.info('Member access revoked');
        loadMembers(projectId);
      } else {
        window.astryxToast.error('Failed to remove member');
      }
    }
  </script>
  <script>
    ${getAstryxTooltipScript()}
  </script>
</body>
</html>`;
}
