/**
 * @forge/portal - Colleague Inspector & Path Highlighting Engine (2026 LTS)
 * Upward reporting path breadcrumbs, direct manager jump, and direct reports roster.
  * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */

export function getCanvasInspectorScript(): string {
  return `
    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // ── Upward Reporting Path Highlighting ──
    function highlightPathToRoot(nodeId) {
      clearPathHighlights();
      let currId = nodeId;
      while (currId) {
        const card = document.querySelector('.canvas-org-cluster[data-node-id="' + currId + '"]');
        if (card) card.classList.add('in-focused-path');
        const node = allRenderedNodes.find(function(item) { return item.id === currId; });
        if (node && node.managerId) {
          const edge = document.getElementById('edge-' + node.managerId + '-' + currId);
          if (edge) edge.classList.add('active');
          currId = node.managerId;
        } else {
          currId = null;
        }
      }
    }

    function clearPathHighlights() {
      document.querySelectorAll('.canvas-org-cluster.in-focused-path').forEach(function(c) { c.classList.remove('in-focused-path'); });
      document.querySelectorAll('.canvas-edge-line.active').forEach(function(e) { e.classList.remove('active'); });
    }

    // ── Colleague Inspector Drawer ──
    function showNodeInspector(node) {
      if (!inspector) return;
      document.querySelectorAll('.canvas-org-cluster').forEach(function(c) { c.classList.remove('selected-node'); });
      const selected = document.querySelector('.canvas-org-cluster[data-node-id="' + node.id + '"]');
      if (selected) selected.classList.add('selected-node');

      const initials = escapeHtml(node.name.split(' ').map(function(w) { return w[0]; }).join('').slice(0, 2).toUpperCase());
      document.getElementById('inspector-avatar').textContent = initials;
      document.getElementById('inspector-full-name').textContent = node.name;
      document.getElementById('inspector-role').textContent = node.title;
      document.getElementById('inspector-division').textContent = node.division;
      document.getElementById('inspector-department').textContent = node.department;
      document.getElementById('inspector-email').textContent = node.email;
      document.getElementById('inspector-level').textContent = 'Level ' + node.level + ' (Tier ' + node.level + ')';
      document.getElementById('inspector-reports').textContent = node.directReportCount + ' direct (' + node.totalSubtreeCount + ' total in subtree)';

      const statusPill = document.getElementById('inspector-status-pill');
      if (statusPill) statusPill.textContent = node.status;

      const codePill = document.getElementById('inspector-code-pill');
      if (codePill) codePill.textContent = node.employeeCode || ('EMP-' + node.id.slice(0, 4).toUpperCase());

      // Construct Upward Reporting Line Breadcrumb
      const chainContainer = document.getElementById('inspector-chain');
      if (chainContainer) {
        const chain = [];
        let curr = node;
        while (curr) {
          chain.unshift(curr);
          curr = curr.managerId ? allRenderedNodes.find(function(item) { return item.id === curr.managerId; }) : null;
        }
        chainContainer.innerHTML = chain.map(function(c, i) {
          const isLast = i === chain.length - 1;
          const safeCName = escapeHtml(c.name);
          const safeCId = escapeHtml(c.id);
          return '<span class="breadcrumb-chip ' + (isLast ? 'active' : '') + '" onclick="inspectById(\\'' + safeCId + '\\')">' + safeCName + '</span>' +
            (!isLast ? '<span class="breadcrumb-separator">›</span>' : '');
        }).join('');
      }

      // Direct Manager Card
      const mgrBox = document.getElementById('inspector-manager-box');
      if (mgrBox) {
        if (node.managerId) {
          const mgr = allRenderedNodes.find(function(item) { return item.id === node.managerId; });
          if (mgr) {
            document.getElementById('inspector-mgr-avatar').textContent = mgr.name.split(' ').map(function(w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
            document.getElementById('inspector-mgr-name').textContent = mgr.name;
            document.getElementById('inspector-mgr-role').textContent = mgr.title;
            const jumpBtn = document.getElementById('inspector-jump-mgr-btn');
            if (jumpBtn) jumpBtn.onclick = function() { inspectById(mgr.id); };
            mgrBox.style.display = 'block';
          } else {
            mgrBox.style.display = 'none';
          }
        } else {
          mgrBox.style.display = 'none';
        }
      }

      // Direct Reports Roster
      const reportsBox = document.getElementById('inspector-reports-box');
      const reportsGrid = document.getElementById('inspector-reports-grid');
      if (reportsBox && reportsGrid) {
        const directReports = allRenderedNodes.filter(function(item) { return item.managerId === node.id; });
        if (directReports.length > 0) {
          document.getElementById('inspector-reports-label').textContent = 'Direct Reports (' + directReports.length + '):';
          reportsGrid.innerHTML = directReports.map(function(r) {
            const rInit = escapeHtml(r.name.split(' ').map(function(w) { return w[0]; }).join('').slice(0, 2).toUpperCase());
            const safeRName = escapeHtml(r.name);
            const safeRId = escapeHtml(r.id);
            return '<div class="report-chip" onclick="inspectById(\\'' + safeRId + '\\')">' +
              '<span class="report-chip-avatar">' + rInit + '</span>' +
              '<span>' + safeRName + '</span>' +
            '</div>';
          }).join('');
          reportsBox.style.display = 'block';
        } else {
          reportsBox.style.display = 'none';
        }
      }

      const focusBtn = document.getElementById('inspector-focus-sub-btn');
      if (focusBtn) {
        focusBtn.onclick = function() {
          activeRootId = node.id;
          loadCanvasTree(currentMaxDepth, node.id);
        };
      }

      const copyBtn = document.getElementById('inspector-copy-email-btn');
      if (copyBtn) {
        copyBtn.onclick = function() {
          if (navigator.clipboard) navigator.clipboard.writeText(node.email);
          if (window.astryxToast) window.astryxToast('Copied email: ' + node.email, 'success');
        };
      }

      inspector.style.display = 'block';
    }

    window.inspectById = function(nodeId) {
      const target = allRenderedNodes.find(function(item) { return item.id === nodeId; });
      if (target) {
        showNodeInspector(target);
        highlightPathToRoot(target.id);
        const el = document.querySelector('.canvas-org-cluster[data-node-id="' + target.id + '"]');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    };

    if (inspectorCloseBtn) {
      inspectorCloseBtn.addEventListener('click', function() {
        if (inspector) inspector.style.display = 'none';
        clearPathHighlights();
      });
    }
  `;
}
