/**
 * @forge/portal - Canvas Auxiliary Views Script (2026 LTS)
 * Renders Mode 2 (Divisions & Operational Fleets) and Mode 3 (Executive Leadership Hierarchy).
  * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */

export function getCanvasViewsScript(): string {
  return `
    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // ── Render Mode 2: Divisions Fleet Cards ──
    function renderDivisionsFleet() {
      const grid = document.getElementById('divisions-fleet-grid');
      if (!grid || !activeOrgTree) return;

      const divs = activeOrgTree.divisions || [];
      if (!divs.length) {
        grid.innerHTML = '<div style="color:var(--forge-text-muted); padding:2rem;">No divisions data available.</div>';
        return;
      }

      grid.innerHTML = divs.map(function(d) {
        const members = allRenderedNodes.filter(function(item) { return item.division === d.name; });
        const lead = members.find(function(item) { return item.level <= 2; }) || members[0];
        const onlineCount = members.filter(function(item) { return item.status === 'ONLINE'; }).length;

        const leadInit = escapeHtml(lead ? lead.name.split(' ').map(function(w) { return w[0]; }).join('').slice(0, 2).toUpperCase() : '--');
        const memberAvatars = members.slice(0, 5).map(function(m) {
          const init = escapeHtml(m.name.split(' ').map(function(w) { return w[0]; }).join('').slice(0, 2).toUpperCase());
          const safeMName = escapeHtml(m.name);
          const safeMTitle = escapeHtml(m.title);
          return '<span class="stacked-avatar" data-astryx-tooltip="' + safeMName + ' (' + safeMTitle + ')">' + init + '</span>';
        }).join('');

        const safeDName = escapeHtml(d.name);
        const safeLeadTitle = escapeHtml(lead ? lead.title : 'Operational Division');
        const safeLeadName = escapeHtml(lead ? lead.name : '');

        return '<div class="division-fleet-card">' +
          '<div class="div-card-top">' +
            '<div>' +
              '<h3 class="div-card-title">' + safeDName + '</h3>' +
              '<div class="div-card-subtitle">' + safeLeadTitle + '</div>' +
            '</div>' +
            '<span class="astryx-badge badge-running">' + d.headCount + ' Members</span>' +
          '</div>' +
          '<div class="div-card-body">' +
            (lead ? '<div class="div-lead-row">' +
              '<div class="node-avatar-sm">' + leadInit + '</div>' +
              '<div style="min-width:0; flex:1;">' +
                '<div style="font-size:0.8rem; font-weight:600; color:var(--forge-text-main);">' + safeLeadName + '</div>' +
                '<div style="font-size:0.7rem; color:var(--forge-text-muted);">Division Lead</div>' +
              '</div>' +
            '</div>' : '') +
            '<div class="div-stats-row">' +
              '<span>Live Presence:</span>' +
              '<strong style="color:var(--forge-success);">' + onlineCount + '/' + d.headCount + ' Active</strong>' +
            '</div>' +
            '<div class="div-members-preview">' +
              '<div class="stacked-avatars-row">' + memberAvatars + '</div>' +
              (members.length > 5 ? '<span style="font-size:0.72rem; color:var(--forge-text-subtle);">+' + (members.length - 5) + ' more</span>' : '') +
            '</div>' +
          '</div>' +
          '<div class="div-card-footer">' +
            '<button class="astryx-btn btn-sm btn-outline" style="width:100%;" data-focus-div="' + safeDName + '">View Division in Canvas</button>' +
          '</div>' +
        '</div>';
      }).join('');

      grid.querySelectorAll('[data-focus-div]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          const divName = btn.getAttribute('data-focus-div');
          focusDivisionInCanvas(divName);
        });
      });
    }

    function focusDivisionInCanvas(divName) {
      const canvasTab = document.querySelector('.canvas-tab-pill[data-mode="canvas"]');
      if (canvasTab) canvasTab.click();
      const pill = document.querySelector('.filter-pill[data-div="' + divName + '"]');
      if (pill) pill.click();
    }

    // ── Render Mode 3: Leadership Pipeline ──
    function renderLeadershipPipeline() {
      const flow = document.getElementById('leadership-pipeline-flow');
      if (!flow || !allRenderedNodes.length) return;

      const tiers = [
        { level: 1, name: 'Tier 1: Executive Council', roleLabel: 'CEO & Co-Founders' },
        { level: 2, name: 'Tier 2: Division Heads', roleLabel: 'Vice Presidents & Global Directors' },
        { level: 3, name: 'Tier 3: Team Leads', roleLabel: 'Engineering & Operational Leads' },
        { level: 4, name: 'Tier 4: Senior Pods', roleLabel: 'Senior Specialists & Staff' },
      ];

      flow.innerHTML = tiers.map(function(tier) {
        const members = allRenderedNodes.filter(function(item) { return item.level === tier.level; });
        if (!members.length) return '';

        const memberCards = members.map(function(m) {
          const init = escapeHtml(m.name.split(' ').map(function(w) { return w[0]; }).join('').slice(0, 2).toUpperCase());
          const safeId = escapeHtml(m.id);
          const safeName = escapeHtml(m.name);
          const safeTitle = escapeHtml(m.title);
          const safeDiv = escapeHtml(m.division);
          return '<div class="leadership-node-item" data-inspect-id="' + safeId + '">' +
            '<div class="node-avatar-sm">' + init + '</div>' +
            '<div style="min-width:0; flex:1;">' +
              '<div style="font-size:0.8rem; font-weight:600; color:var(--forge-text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + safeName + '</div>' +
              '<div style="font-size:0.7rem; color:var(--forge-text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + safeTitle + '</div>' +
            '</div>' +
            '<span class="astryx-micro-pill">' + safeDiv + '</span>' +
          '</div>';
        }).join('');

        return '<div class="leadership-tier-block">' +
          '<div class="tier-block-header">' +
            '<span class="tier-title">' + tier.name + '</span>' +
            '<span class="tier-badge">' + members.length + ' Leaders</span>' +
          '</div>' +
          '<div class="tier-grid">' + memberCards + '</div>' +
        '</div>';
      }).join('');

      flow.querySelectorAll('[data-inspect-id]').forEach(function(el) {
        el.addEventListener('click', function() {
          const id = el.getAttribute('data-inspect-id');
          if (typeof inspectById === 'function') inspectById(id);
        });
      });
    }
  `;
}
