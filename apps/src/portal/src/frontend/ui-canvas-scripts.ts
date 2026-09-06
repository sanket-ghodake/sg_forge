/**
 * @forge/portal - Progressive Multi-View Org Canvas Client Script (2026 LTS)
 * Executive-grade 2D hierarchy canvas, progressive tree expansion (default L2),
 * position-fixed minimap sync & click-to-pan, and employee-focused navigation.
 */

import { getCanvasViewsScript } from './ui-canvas-views';
import { getCanvasInspectorScript } from './ui-canvas-inspector';

/**
 * getCanvasClientScript
 * @requirements [HLR-PORTAL-201] [LLR-UI-001]
 */
export function getCanvasClientScript(): string {
  return `
    (function initCanvasEngine() {
      let currentZoom = 1.0;
      let currentMaxDepth = 2; // Default to Level 2 (Heads) for fast & uncluttered loading
      let activeRootId = null;
      let activeOrgTree = null;
      let allRenderedNodes = [];
      let activeDivisionFilter = 'all';
      let activeMode = 'canvas';

      function escapeHtml(str) {
        return String(str || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      // Pan State
      let isPanning = false;
      let startX = 0, startY = 0;
      let scrollLeft = 0, scrollTop = 0;

      const viewport = document.getElementById('canvas-viewport');
      const surface = document.getElementById('canvas-surface');
      const nodesContainer = document.getElementById('canvas-nodes-container');
      const svgLayer = document.getElementById('canvas-svg-layer');
      const zoomLevelEl = document.getElementById('canvas-zoom-level');
      const searchInput = document.getElementById('canvas-search-input');
      const deptFiltersContainer = document.getElementById('canvas-dept-filters');
      const inspector = document.getElementById('canvas-node-inspector');
      const inspectorCloseBtn = document.getElementById('inspector-close-btn');
      const minimapBox = document.getElementById('canvas-minimap');
      const minimapIndicator = document.getElementById('minimap-indicator');

      // ── View Mode Switching (Canvas / Divisions / Leadership) ──
      document.querySelectorAll('.canvas-tab-pill').forEach(function(pill) {
        pill.addEventListener('click', function() {
          const mode = pill.getAttribute('data-mode');
          if (!mode || mode === activeMode) return;
          activeMode = mode;

          document.querySelectorAll('.canvas-tab-pill').forEach(function(p) { p.classList.remove('active'); });
          pill.classList.add('active');

          document.querySelectorAll('.canvas-mode-container').forEach(function(c) { c.classList.remove('active'); });
          const targetContainer = document.getElementById('canvas-mode-' + mode);
          if (targetContainer) targetContainer.classList.add('active');

          if (mode === 'divisions') renderDivisionsMatrix();
          if (mode === 'leadership') renderLeadershipPipeline();
        });
      });

      // ── Pan & Drag Engine ──
      if (viewport) {
        viewport.addEventListener('mousedown', function(e) {
          if (e.target.closest('.canvas-org-cluster') || e.target.closest('.canvas-inspector-card')) return;
          isPanning = true;
          viewport.classList.add('is-dragging');
          startX = e.pageX - viewport.offsetLeft;
          startY = e.pageY - viewport.offsetTop;
          scrollLeft = viewport.scrollLeft;
          scrollTop = viewport.scrollTop;
        });

        window.addEventListener('mousemove', function(e) {
          if (!isPanning || !viewport) return;
          e.preventDefault();
          const x = e.pageX - viewport.offsetLeft;
          const y = e.pageY - viewport.offsetTop;
          viewport.scrollLeft = scrollLeft - (x - startX);
          viewport.scrollTop = scrollTop - (y - startY);
          updateMinimap();
        });

        window.addEventListener('mouseup', function() {
          if (isPanning && viewport) {
            isPanning = false;
            viewport.classList.remove('is-dragging');
          }
        });

        viewport.addEventListener('scroll', updateMinimap, { passive: true });

        // Wheel Zoom Support
        viewport.addEventListener('wheel', function(e) {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoom(Math.max(0.3, Math.min(2.0, currentZoom + delta)));
          }
        }, { passive: false });
      }

      function setZoom(z) {
        currentZoom = Math.round(z * 100) / 100;
        if (surface) surface.style.transform = 'scale(' + currentZoom + ')';
        if (zoomLevelEl) zoomLevelEl.textContent = Math.round(currentZoom * 100) + '%';
        updateMinimap();
      }

      // Zoom Button Controls
      const zoomInBtn = document.getElementById('canvas-zoom-in');
      const zoomOutBtn = document.getElementById('canvas-zoom-out');
      const resetBtn = document.getElementById('canvas-reset-btn');
      const fitBtn = document.getElementById('canvas-btn-fit');
      const leadBtn = document.getElementById('canvas-btn-lead');
      const findMeBtn = document.getElementById('canvas-find-me-btn');

      if (zoomInBtn) zoomInBtn.addEventListener('click', function() { setZoom(Math.min(2.0, currentZoom + 0.15)); });
      if (zoomOutBtn) zoomOutBtn.addEventListener('click', function() { setZoom(Math.max(0.3, currentZoom - 0.15)); });
      if (resetBtn) {
        resetBtn.addEventListener('click', function() {
          setZoom(1.0);
          activeRootId = null;
          loadCanvasTree(currentMaxDepth, null);
        });
      }

      if (fitBtn) {
        fitBtn.addEventListener('click', function() {
          if (!viewport || !surface) return;
          const vWidth = viewport.clientWidth;
          const sWidth = parseInt(surface.style.width || '1900', 10);
          const ratio = Math.max(0.35, Math.min(1.0, (vWidth - 60) / sWidth));
          setZoom(ratio);
          viewport.scrollLeft = Math.max(0, (sWidth * ratio - vWidth) / 2);
          viewport.scrollTop = 0;
        });
      }

      if (leadBtn) {
        leadBtn.addEventListener('click', function() {
          const rootEl = document.querySelector('.canvas-org-cluster[data-level="1"]');
          if (rootEl) {
            rootEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            rootEl.classList.add('selected-node');
            setTimeout(function() { rootEl.classList.remove('selected-node'); }, 2000);
          }
        });
      }

      if (findMeBtn) {
        findMeBtn.addEventListener('click', async function() {
          const currentUser = window.__PORTAL_USER__ || {};
          const userIdentifier = (currentUser.id || '').toLowerCase();
          const userEmail = (currentUser.email || '').toLowerCase();

          function focusNode(node) {
            const target = document.querySelector('.canvas-org-cluster[data-node-id="' + node.id + '"]');
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
              target.classList.add('selected-node');
              setTimeout(function() { target.classList.remove('selected-node'); }, 3000);
              showNodeInspector(node);
              if (window.astryxToast) {
                window.astryxToast('Focused your profile: ' + node.name + ' (' + node.title + ')', 'info');
              }
              return true;
            }
            return false;
          }

          let myNode = allRenderedNodes.find(function(item) {
            return (item.id && item.id.toLowerCase() === userIdentifier) ||
                   (item.email && item.email.toLowerCase() === userEmail);
          });

          if (myNode && focusNode(myNode)) {
            return;
          }

          // If node not found in current bounded depth, auto-expand to full hierarchy
          if (currentMaxDepth < 10) {
            currentMaxDepth = 10;
            document.querySelectorAll('.canvas-depth-selector .depth-btn').forEach(function(b) {
              b.classList.toggle('active', b.getAttribute('data-depth') === '10');
            });
            await loadCanvasTree(10, activeRootId);
            myNode = allRenderedNodes.find(function(item) {
              return (item.id && item.id.toLowerCase() === userIdentifier) ||
                     (item.email && item.email.toLowerCase() === userEmail);
            });
            if (myNode && focusNode(myNode)) {
              return;
            }
          }

          // Fallback if guest or not in directory: focus root with informative toast
          const fallback = document.querySelector('.canvas-org-cluster');
          if (fallback) {
            fallback.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            fallback.classList.add('selected-node');
            const nId = fallback.getAttribute('data-node-id');
            const node = allRenderedNodes.find(function(item) { return item.id === nId; });
            if (node) showNodeInspector(node);
            if (window.astryxToast) {
              window.astryxToast('Logged in as ' + (currentUser.displayName || currentUser.email || 'Member') + ' (Executive directory overview)', 'info');
            }
          }
        });
      }

      // Depth Buttons (Progressive Tree Scope)
      document.querySelectorAll('.canvas-depth-selector .depth-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          document.querySelectorAll('.canvas-depth-selector .depth-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          currentMaxDepth = parseInt(btn.getAttribute('data-depth') || '2', 10);
          loadCanvasTree(currentMaxDepth, activeRootId);
        });
      });

      // ── Fetch Progressive Hierarchy Data from Real SQLite DB ──
      async function loadCanvasTree(depth, rootId) {
        if (!nodesContainer || !svgLayer) return;

        try {
          const prefix = window.location.pathname.startsWith('/portal') ? '/portal' : '';
          const endpoint = prefix + '/api/v1/portal/canvas/tree?max_depth=' + depth + (rootId ? '&root_id=' + encodeURIComponent(rootId) : '');
          const res = await fetch(endpoint, { headers: { 'Accept': 'application/json' } });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const body = await res.json();
          activeOrgTree = body.data;

          updateHeaderSummary(activeOrgTree);
          renderDynamicFilters(activeOrgTree.divisions || []);
          renderCanvasNodesAndEdges(activeOrgTree.root);
        } catch(e) {
          console.error('Failed to load org tree:', e);
        }
      }

      function updateHeaderSummary(tree) {
        if (!tree) return;
        const total = tree.totalEmployees || 0;
        const divs = tree.divisions || [];
        const totalSumEl = document.getElementById('canvas-total-summary');
        const divSumEl = document.getElementById('canvas-div-summary');

        if (totalSumEl) totalSumEl.textContent = total + ' Team Members';
        if (divSumEl) divSumEl.textContent = divs.length + ' Operational Divisions';
      }

      function renderDynamicFilters(divisions) {
        if (!deptFiltersContainer) return;
        deptFiltersContainer.innerHTML = '<button class="filter-pill active" data-div="all">All Divisions</button>' +
          divisions.map(function(d) {
            const safeDName = escapeHtml(d.name);
            return '<button class="filter-pill" data-div="' + safeDName + '">' + safeDName + ' (' + d.headCount + ')</button>';
          }).join('');

        deptFiltersContainer.querySelectorAll('.filter-pill').forEach(function(pill) {
          pill.addEventListener('click', function() {
            deptFiltersContainer.querySelectorAll('.filter-pill').forEach(function(p) { p.classList.remove('active'); });
            pill.classList.add('active');
            activeDivisionFilter = pill.getAttribute('data-div');
            filterNodesByDivision(activeDivisionFilter);
          });
        });
      }

      function filterNodesByDivision(divName) {
        document.querySelectorAll('.canvas-org-cluster').forEach(function(c) {
          const nodeDiv = c.getAttribute('data-division');
          if (divName === 'all' || nodeDiv === divName) {
            c.style.opacity = '1';
            c.style.filter = 'none';
          } else {
            c.style.opacity = '0.15';
            c.style.filter = 'grayscale(100%)';
          }
        });
      }

      // ── 2D Canvas Layout Algorithm ──
      function renderCanvasNodesAndEdges(rootNode) {
        if (!rootNode) {
          nodesContainer.innerHTML = '<div style="padding: 2rem; color: var(--forge-text-muted);">No organization nodes found.</div>';
          svgLayer.innerHTML = '';
          return;
        }

        allRenderedNodes = [];
        const levels = {};
        const nodePositions = new Map();

        function traverse(node, parentId) {
          if (!levels[node.level]) levels[node.level] = [];
          levels[node.level].push({ node: node, parentId: parentId });
          allRenderedNodes.push(node);
          (node.children || []).forEach(function(c) { traverse(c, node.id); });
        }
        traverse(rootNode, null);

        const cardWidth = 280;
        const cardHeight = 115;
        const levelYSpacing = 180;
        const startY = 40;

        let maxBreadth = 1;
        Object.keys(levels).forEach(function(lvl) {
          if (levels[lvl].length > maxBreadth) maxBreadth = levels[lvl].length;
        });

        const totalWidth = Math.max(1600, maxBreadth * (cardWidth + 48) + 200);
        const totalHeight = Math.max(800, Object.keys(levels).length * levelYSpacing + 260);
        surface.style.width = totalWidth + 'px';
        surface.style.height = totalHeight + 'px';

        Object.keys(levels).forEach(function(lvlStr) {
          const lvl = parseInt(lvlStr, 10);
          const nodesInLevel = levels[lvl];
          const spacing = totalWidth / (nodesInLevel.length + 1);
          const y = startY + (lvl - 1) * levelYSpacing;

          nodesInLevel.forEach(function(item, idx) {
            const x = spacing * (idx + 1) - (cardWidth / 2);
            nodePositions.set(item.node.id, { x: x, y: y, item: item });
          });
        });

        // Dynamic SVG Bezier Connection Curves
        let svgHtml = '';
        nodePositions.forEach(function(pos, nodeId) {
          const parentId = pos.item.parentId;
          if (parentId && nodePositions.has(parentId)) {
            const parentPos = nodePositions.get(parentId);
            const px = parentPos.x + cardWidth / 2;
            const py = parentPos.y + cardHeight;
            const cx = pos.x + cardWidth / 2;
            const cy = pos.y;
            const midY = (py + cy) / 2;

            svgHtml += '<path class="canvas-edge-line" id="edge-' + parentId + '-' + nodeId + '" ' +
              'data-from="' + parentId + '" data-to="' + nodeId + '" ' +
              'd="M ' + px + ' ' + py + ' C ' + px + ' ' + midY + ', ' + cx + ' ' + midY + ', ' + cx + ' ' + cy + '" />';
          }
        });
        svgLayer.innerHTML = svgHtml;

        // Render Astryx Node Cards
        let nodesHtml = '';
        nodePositions.forEach(function(pos, nodeId) {
          const n = pos.item.node;
          const initials = escapeHtml(n.name.split(' ').map(function(w) { return w[0]; }).join('').slice(0, 2).toUpperCase());
          const statusClass = n.status === 'ONLINE' ? 'status-online' : (n.status === 'BUSY' ? 'status-busy' : 'status-away');
          const safeId = escapeHtml(n.id);
          const safeDiv = escapeHtml(n.division);
          const safeName = escapeHtml(n.name);
          const safeTitle = escapeHtml(n.title);
          const safeStatus = escapeHtml(n.status);

          let expandHtml = '';
          if (n.hasMoreChildren || (n.directReportCount > 0 && (!n.children || !n.children.length))) {
            expandHtml = '<button class="node-expand-btn" data-expand-id="' + safeId + '">+ ' + n.directReportCount + ' Reports (Expand Team)</button>';
          }

          nodesHtml += '<div class="canvas-org-cluster" style="left: ' + pos.x + 'px; top: ' + pos.y + 'px;" ' +
            'data-node-id="' + safeId + '" data-division="' + safeDiv + '" data-level="' + n.level + '" data-manager="' + escapeHtml(n.managerId || '') + '">' +
            '<div class="cluster-header">' +
              '<span class="cluster-badge">' + safeDiv + '</span>' +
              '<span class="cluster-count">L' + n.level + (n.directReportCount > 0 ? ' • ' + n.directReportCount + ' reports' : '') + '</span>' +
            '</div>' +
            '<div class="org-node-card ' + (n.level === 1 ? 'node-lead' : '') + '">' +
              '<div class="node-avatar">' + initials + '</div>' +
              '<div class="node-info">' +
                '<div class="node-name">' + safeName + '</div>' +
                '<div class="node-role">' + safeTitle + '</div>' +
              '</div>' +
              '<span class="status-indicator ' + statusClass + '" data-astryx-tooltip="' + safeStatus + '"></span>' +
            '</div>' +
            expandHtml +
          '</div>';
        });
        nodesContainer.innerHTML = nodesHtml;

        attachNodeListeners();
        updateMinimap();
      }

      function attachNodeListeners() {
        document.querySelectorAll('.canvas-org-cluster').forEach(function(card) {
          card.addEventListener('click', function(e) {
            if (e.target.closest('.node-expand-btn')) return;
            const nId = card.getAttribute('data-node-id');
            const targetNode = allRenderedNodes.find(function(item) { return item.id === nId; });
            if (targetNode) {
              showNodeInspector(targetNode);
              highlightPathToRoot(targetNode.id);
            }
          });

          card.addEventListener('mouseenter', function() {
            const nId = card.getAttribute('data-node-id');
            highlightPathToRoot(nId);
          });

          card.addEventListener('mouseleave', function() {
            const selected = document.querySelector('.canvas-org-cluster.selected-node');
            if (selected) {
              highlightPathToRoot(selected.getAttribute('data-node-id'));
            } else {
              clearPathHighlights();
            }
          });
        });

        // Subtree Progressive Expansion
        document.querySelectorAll('.node-expand-btn').forEach(function(btn) {
          btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const expandId = btn.getAttribute('data-expand-id');
            activeRootId = expandId;
            loadCanvasTree(currentMaxDepth + 2, expandId);
          });
        });
      }

      // ── Position-Fixed Minimap Synchronization & Click-to-Pan ──
      function updateMinimap() {
        if (!minimapIndicator || !viewport || !surface) return;
        const vW = viewport.clientWidth, vH = viewport.clientHeight;
        const sW = (parseInt(surface.style.width || '1600', 10)) * currentZoom;
        const sH = (parseInt(surface.style.height || '800', 10)) * currentZoom;

        const wPct = Math.min(100, Math.max(12, (vW / sW) * 100));
        const hPct = Math.min(100, Math.max(15, (vH / sH) * 100));
        const lPct = Math.min(100 - wPct, Math.max(0, (viewport.scrollLeft / sW) * 100));
        const tPct = Math.min(100 - hPct, Math.max(0, (viewport.scrollTop / sH) * 100));

        minimapIndicator.style.width = wPct.toFixed(1) + '%';
        minimapIndicator.style.height = hPct.toFixed(1) + '%';
        minimapIndicator.style.left = lPct.toFixed(1) + '%';
        minimapIndicator.style.top = tPct.toFixed(1) + '%';
      }

      if (minimapBox && viewport && surface) {
        minimapBox.addEventListener('click', function(e) {
          const rect = minimapBox.getBoundingClientRect();
          const clickX = (e.clientX - rect.left) / rect.width;
          const clickY = (e.clientY - rect.top) / rect.height;
          const sW = (parseInt(surface.style.width || '1600', 10)) * currentZoom;
          const sH = (parseInt(surface.style.height || '800', 10)) * currentZoom;

          viewport.scrollLeft = clickX * sW - viewport.clientWidth / 2;
          viewport.scrollTop = clickY * sH - viewport.clientHeight / 2;
          updateMinimap();
        });
      }

      // ── Instant Search ──
      if (searchInput) {
        searchInput.addEventListener('input', function(e) {
          const q = (e.target.value || '').toLowerCase().trim();
          let firstMatch = null;

          document.querySelectorAll('.canvas-org-cluster').forEach(function(card) {
            const text = (card.textContent || '').toLowerCase();
            if (!q || text.includes(q)) {
              card.style.opacity = '1';
              card.style.filter = 'none';
              if (q && !firstMatch) firstMatch = card;
            } else {
              card.style.opacity = '0.15';
              card.style.filter = 'grayscale(100%)';
            }
          });

          if (firstMatch && q.length > 2) {
            firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          }
        });
      }

      ${getCanvasInspectorScript()}
      ${getCanvasViewsScript()}

      // Initial load with focused Depth 2
      loadCanvasTree(currentMaxDepth, null);
    })();
  `;
}
