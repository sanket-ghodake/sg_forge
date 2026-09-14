/**
 * @forge/portal - Application Active Entitled Users Controller (2026 LTS)
 * Client-side script for inspecting active entitled users and revoking access.
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */

export function getAppUsersGovernanceScript(): string {
  return `
    // ── Entitled Users with Access Roster Engine ──
    var cachedAppUsers = [];

    async function loadAppActiveUsers(appId) {
      var tbody = document.getElementById('gov-app-users-tbody');
      if (!tbody || !appId) return;
      try {
        var res = await fetch(getApiPrefix() + '/api/v1/portal/apps/' + encodeURIComponent(appId) + '/users');
        if (res.ok) {
          var json = await res.json();
          cachedAppUsers = json.data || [];
          renderAppUsersTable(cachedAppUsers);
        }
      } catch(e) {}
    }

    function renderAppUsersTable(users) {
      var tbody = document.getElementById('gov-app-users-tbody');
      if (!tbody) return;
      if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:1.25rem; color:var(--forge-text-muted);">No active entitled users found for this application.</td></tr>';
        return;
      }
      tbody.innerHTML = users.map(function(u) {
        var initial = escapeHtml((u.userName || 'U').slice(0, 2).toUpperCase());
        var grantedDate = u.grantedAt ? new Date(u.grantedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Active';
        return '<tr>' +
          '<td style="padding:0.45rem 0.75rem;"><div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:24px;height:24px;border-radius:50%;background:var(--forge-primary);color:var(--forge-primary-btn-text);display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:600;">' + initial + '</div><div><strong style="color:var(--forge-text-main);">' + escapeHtml(u.userName) + '</strong><div style="font-size:0.7rem;color:var(--forge-text-muted);">' + escapeHtml(u.userEmail) + '</div></div></div></td>' +
          '<td style="padding:0.45rem 0.75rem;color:var(--forge-text-muted);">' + escapeHtml(u.department || 'Enterprise') + '</td>' +
          '<td style="padding:0.45rem 0.75rem;color:var(--forge-text-muted);">' + escapeHtml(grantedDate) + '</td>' +
          '<td style="padding:0.45rem 0.75rem;color:var(--forge-text-muted);">' + escapeHtml(u.grantedBy || 'Policy') + '</td>' +
          '<td style="padding:0.45rem 0.75rem;text-align:right;"><button type="button" class="astryx-btn btn-sm btn-ghost btn-revoke-app-user" data-user-id="' + escapeHtml(u.userId) + '" data-user-name="' + escapeHtml(u.userName) + '" style="color:var(--forge-error);font-size:0.72rem;">Revoke Access</button></td>' +
        '</tr>';
      }).join('');
    }

    var usersFilterInput = document.getElementById('gov-users-search-input');
    if (usersFilterInput) {
      usersFilterInput.addEventListener('input', function() {
        var q = (usersFilterInput.value || '').trim().toLowerCase();
        var matched = cachedAppUsers.filter(function(u) {
          return (u.userName || '').toLowerCase().includes(q) || (u.userEmail || '').toLowerCase().includes(q);
        });
        renderAppUsersTable(matched);
      });
    }

    document.addEventListener('click', async function(e) {
      var btn = e.target.closest('.btn-revoke-app-user');
      if (!btn || !currentAppId) return;
      var uId = btn.getAttribute('data-user-id');
      var uName = btn.getAttribute('data-user-name') || 'this user';
      try {
        var res = await fetch(getApiPrefix() + '/api/v1/portal/apps/' + encodeURIComponent(currentAppId) + '/users/' + encodeURIComponent(uId) + '/revoke', { method: 'POST' });
        var json = await res.json();
        if (res.ok && json.ok) {
          if (window.astryxToast) window.astryxToast('Access revoked for ' + uName, 'info');
          loadAppActiveUsers(currentAppId);
          if (window.openAppGovernanceModal) window.openAppGovernanceModal(currentAppId);
        } else {
          if (window.astryxToast) window.astryxToast(json.error || 'Failed to revoke access', 'error');
        }
      } catch(err) {
        if (window.astryxToast) window.astryxToast('Network error during access revocation', 'error');
      }
    });
  `;
}
