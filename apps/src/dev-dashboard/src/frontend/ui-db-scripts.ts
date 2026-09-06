/**
 * @forge/dev-dashboard - Database Studio Client Scripts (2026 LTS)
 * Modular client-side scripts for Database Studio: Schema Explorer, Table Data Grid,
 * Resizable Columns, Dynamic Per-DB Quick Queries, ER Diagram, and SQL Sandbox.
  * @requirements [HLR-SDK-302] [LLR-DB-001]
 */

export function getDbDashboardScripts(): string {
  return `
    let currentSelectedDb = 'platform_core.db';
    let currentSelectedTable = 'apps_registry';
    let currentTablePage = 1;
    let currentTableLimit = 25;
    let currentTableSearch = '';
    let currentDbSubTab = 'rows';
    let currentLoadedTables = [];

    function toggleDbStudioFullscreen() {
      const pane = document.getElementById('tab-database');
      const btn = document.getElementById('btn-db-fullscreen');
      if (!pane) return;
      const isFull = pane.classList.toggle('db-studio-fullscreen');
      if (btn) btn.textContent = isFull ? '🗗 Exit Fullscreen' : '🗖 Fullscreen';
      if (window.astryxToast) window.astryxToast(isFull ? 'Entered Fullscreen Database Studio' : 'Restored Normal View', 'info');
    }

    function filterTableList(q) {
      const items = document.querySelectorAll('#db-tables-view .db-table-item');
      items.forEach(el => {
        el.style.display = !q || el.textContent.toLowerCase().includes(q.toLowerCase()) ? 'flex' : 'none';
      });
    }

    function renderQuickQueries(dbName, tables) {
      const c = document.getElementById('db-quick-queries-container');
      if (!c) return;
      let queries = [];
      if (dbName === 'billing.db') {
        queries = [
          { label: '👥 customers', sql: 'SELECT * FROM customers LIMIT 25;' },
          { label: '🧾 paid invoices', sql: "SELECT * FROM invoices WHERE status='paid' LIMIT 25;" },
          { label: '💳 subscriptions', sql: "SELECT * FROM subscriptions WHERE status='active';" },
          { label: '💰 revenue by customer', sql: 'SELECT customer_id, count(*) as count, sum(amount_cents)/100.0 as total_usd FROM invoices GROUP BY customer_id;' }
        ];
      } else if (dbName === 'expenses.db') {
        queries = [
          { label: '📊 categories', sql: 'SELECT * FROM categories LIMIT 25;' },
          { label: '🧾 approved claims', sql: "SELECT * FROM expense_claims WHERE status='approved' LIMIT 25;" },
          { label: '📎 receipts', sql: 'SELECT * FROM receipts ORDER BY id DESC LIMIT 25;' },
          { label: '📈 budget by dept', sql: 'SELECT department, count(*) as items, sum(budget_limit_usd) as total_budget FROM categories GROUP BY department;' }
        ];
      } else if (dbName === 'auth.db') {
        queries = [
          { label: '👤 users', sql: 'SELECT id, email, role, status FROM users LIMIT 25;' },
          { label: '🔑 sessions', sql: 'SELECT * FROM sessions LIMIT 25;' },
          { label: '📜 audit events', sql: 'SELECT * FROM audit_events ORDER BY id DESC LIMIT 25;' }
        ];
      } else if (dbName === 'telemetry.db') {
        queries = [
          { label: '📡 service metrics', sql: 'SELECT * FROM service_metrics ORDER BY timestamp DESC LIMIT 25;' },
          { label: '🚨 system alerts', sql: 'SELECT * FROM system_alerts LIMIT 25;' },
          { label: '⚡ latency by service', sql: 'SELECT service, round(avg(latency_ms),2) as avg_latency_ms FROM service_metrics GROUP BY service;' }
        ];
      } else if (dbName === 'dev_hub.db') {
        queries = [
          { label: '📚 api specs', sql: 'SELECT * FROM api_specs LIMIT 25;' },
          { label: '🔗 webhooks', sql: 'SELECT * FROM webhooks WHERE enabled=1;' }
        ];
      } else {
        queries = [
          { label: '🚀 apps registry', sql: 'SELECT * FROM apps_registry ORDER BY port ASC;' },
          { label: '📈 traffic events', sql: 'SELECT * FROM traffic_events ORDER BY timestamp DESC LIMIT 25;' },
          { label: '⚙️ audit logs', sql: 'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 25;' }
        ];
      }
      tables.forEach(t => {
        if (!queries.some(q => q.sql.includes('FROM ' + t))) {
          queries.push({ label: '📄 ' + t, sql: 'SELECT * FROM ' + t + ' LIMIT 25;' });
        }
      });
      queries.push({ label: '🔍 sqlite_master', sql: "SELECT name, type FROM sqlite_master WHERE type='table';" });
      c.innerHTML = queries.map(q =>
        '<button class="db-query-chip" onclick="insertSqlSnippet(\\'' + q.sql.replace(/'/g, "\\\\'") + '\\')">' + q.label + '</button>'
      ).join('');
    }

    function initColumnResize(tableEl) {
      if (!tableEl) return;
      const cols = tableEl.querySelectorAll('th.col-resizable-th');
      cols.forEach(th => {
        const resizer = th.querySelector('.col-resizer');
        if (!resizer) return;
        let startX, startW;
        resizer.addEventListener('mousedown', (e) => {
          e.preventDefault();
          startX = e.pageX;
          startW = th.offsetWidth;
          resizer.classList.add('resizing');
          const onMouseMove = (moveEv) => {
            const newW = Math.max(60, startW + (moveEv.pageX - startX));
            th.style.width = newW + 'px';
            th.style.minWidth = newW + 'px';
          };
          const onMouseUp = () => {
            resizer.classList.remove('resizing');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          };
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        });
      });
    }

    function copyCellValue(text) {
      if (text === null || text === undefined || text === '') return;
      navigator.clipboard.writeText(String(text));
      if (window.astryxToast) window.astryxToast('📋 Copied: ' + String(text).slice(0, 32), 'info');
    }

    function clearSqlQuery() {
      const el = document.getElementById('sql-query-input');
      if (el) { el.value = ''; el.focus(); }
    }

    async function loadDatabases() {
      try {
        const res = await fetch(apiBase + '/api/db/list').then(r => r.json());
        const s1 = document.getElementById('db-select');
        if (!s1) return;
        let opts = '';
        if (res.databases && res.databases.length) {
          opts += '<optgroup label="Local Microservice DBs">';
          opts += res.databases.map(d => '<option value="' + d.name + '">🗄️ ' + d.name + ' (' + Math.round(d.sizeBytes/1024) + ' KB)</option>').join('');
          opts += '</optgroup>';
        }
        if (res.remoteDatabases && res.remoteDatabases.length) {
          opts += '<optgroup label="Remote Microservice DBs">';
          opts += res.remoteDatabases.map(d => '<option value="' + d.name + '">🌐 ' + d.displayName + '</option>').join('');
          opts += '</optgroup>';
        }
        s1.innerHTML = opts || '<option value="platform_core.db">platform_core.db</option>';

        let targetDb = currentSelectedDb;
        if (window._initialSelectedDb) {
          const match = (res.databases || []).find(d => d.name === window._initialSelectedDb || d.name.includes(window._initialSelectedDb))
            || (res.remoteDatabases || []).find(d => d.name === window._initialSelectedDb || d.displayName?.includes(window._initialSelectedDb));
          if (match) targetDb = match.name;
        } else if (res.databases?.[0] && !res.databases.some(d => d.name === targetDb)) {
          targetDb = res.databases[0].name;
        }

        s1.value = targetDb;
        inspectDatabase(targetDb);
      } catch (err) { console.error('Databases load failed', err); }
    }

    function switchDbSubTab(tab) {
      currentDbSubTab = tab;
      ['rows', 'graph', 'sql', 'ddl'].forEach(t => {
        const btn = document.getElementById('btn-subtab-' + t);
        const pane = document.getElementById('db-subpane-' + t);
        if (btn) btn.classList.toggle('active', t === tab);
        if (pane) pane.style.display = t === tab ? 'block' : 'none';
      });
      if (tab === 'ddl') viewTableDdl(currentSelectedDb, currentSelectedTable);
      if (tab === 'graph') loadDbSchemaGraph(currentSelectedDb);
    }

    async function inspectDatabase(dbName) {
      currentSelectedDb = dbName;
      loadDbTelemetry(dbName);
      try {
        const res = await fetch(apiBase + '/api/db/query', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dbName, sql: "SELECT name, type FROM sqlite_master WHERE type='table' ORDER BY name ASC;" })
        }).then(r => r.json());
        const c = document.getElementById('db-tables-view');
        const badge = document.getElementById('db-tables-count-badge');
        if (!c) return;
        if (res.rows && res.rows.length) {
          currentLoadedTables = res.rows.map(r => r.name);
          if (badge) badge.textContent = res.rows.length + ' tables';
          const targetTable = (window._initialSelectedTable && res.rows.some(r => r.name === window._initialSelectedTable))
            ? window._initialSelectedTable
            : res.rows[0].name;
          window._initialSelectedTable = null;

          c.innerHTML = res.rows.map(r =>
            '<div class="db-table-item ' + (r.name === targetTable ? 'active' : '') + '" onclick="selectTable(\\'' + dbName + '\\', \\'' + r.name + '\\')">' +
              '<span>📄 <strong>' + r.name + '</strong></span>' +
              '<span style="font-size:0.7rem; color:var(--forge-text-muted);">' + r.type + '</span>' +
            '</div>'
          ).join('');
          renderQuickQueries(dbName, currentLoadedTables);
          selectTable(dbName, targetTable);
        } else {
          currentLoadedTables = [];
          if (badge) badge.textContent = '0 tables';
          c.innerHTML = '<p style="color:var(--forge-text-muted); font-size:0.8rem; padding:0.5rem;">No tables found in ' + dbName + '</p>';
          renderQuickQueries(dbName, []);
        }
        if (currentDbSubTab === 'graph') loadDbSchemaGraph(dbName);
      } catch (err) { console.error('Inspect DB failed', err); }
    }

    async function loadDbTelemetry(dbName) {
      try {
        const res = await fetch(apiBase + '/api/db/stats?db=' + dbName).then(r => r.json());
        if (res.status === 'ok' && !res.error) {
          const dbSizeEl = document.getElementById('telemetry-db-size');
          const walSizeEl = document.getElementById('telemetry-wal-size');
          const tblCountEl = document.getElementById('telemetry-tables-count');
          const recCountEl = document.getElementById('telemetry-total-records');
          const cacheEl = document.getElementById('telemetry-page-cache');
          if (dbSizeEl) dbSizeEl.textContent = (res.fileSizeBytes / 1024).toFixed(1) + ' KB';
          if (walSizeEl) walSizeEl.textContent = (res.walSizeBytes / 1024).toFixed(1) + ' KB';
          if (tblCountEl) tblCountEl.textContent = res.tableCount + ' (' + res.indexCount + ' idx)';
          if (recCountEl) recCountEl.textContent = res.totalRecordsEstimated.toLocaleString();
          if (cacheEl) cacheEl.textContent = (res.journalMode || 'WAL').toUpperCase() + ' (' + res.integrityStatus + ')';
        }
      } catch (err) { console.error('Telemetry fetch failed', err); }
    }

    async function loadDbSchemaGraph(dbName) {
      const view = document.getElementById('db-er-diagram-view');
      if (!view) return;
      view.innerHTML = '<div style="color:var(--forge-text-muted); padding:0.5rem;">Analyzing schema relationships & foreign keys...</div>';
      try {
        const res = await fetch(apiBase + '/api/db/graph?db=' + dbName).then(r => r.json());
        if (!res.nodes || !res.nodes.length) {
          view.innerHTML = '<p style="color:var(--forge-text-muted); padding:0.5rem;">Zero tables found in ' + dbName + '.</p>';
          return;
        }
        let html = '<div class="db-er-grid">';
        html += res.nodes.map(n => {
          const colList = n.columns.map(c =>
            '<div class="db-er-col">' +
              '<span>' + (c.pk ? '<span class="db-er-pk">🔑</span> ' : '') + '<strong>' + c.name + '</strong></span>' +
              '<span style="color:var(--forge-text-muted); font-size:0.7rem;">' + c.type + (c.notnull ? '*' : '') + '</span>' +
            '</div>'
          ).join('');

          const outgoingEdges = (res.edges || []).filter(e => e.fromTable === n.name);
          const edgeBadges = outgoingEdges.map(e =>
            '<div class="db-er-edge-badge">' +
              '<span>&rarr; ' + e.fromColumn + ' &rArr; <strong class="db-er-fk">' + e.toTable + '.' + e.toColumn + '</strong></span>' +
            '</div>'
          ).join('');

          return '<div class="db-er-card">' +
            '<div class="db-er-header">' +
              '<span>📁 ' + n.name + '</span>' +
              '<span class="astryx-badge" style="font-size:0.68rem;">' + n.rowCount + ' rows</span>' +
            '</div>' +
            '<div class="db-er-cols">' + colList + (edgeBadges ? '<div style="margin-top:0.3rem; border-top:1px dashed var(--forge-border); padding-top:0.25rem;">' + edgeBadges + '</div>' : '') + '</div>' +
          '</div>';
        }).join('');
        html += '</div>';
        view.innerHTML = html;
      } catch (err) {
        view.innerHTML = '<div style="color:var(--forge-accent); padding:0.5rem;">Failed to render schema graph.</div>';
      }
    }

    function onDbTableSearch(query) {
      currentTableSearch = query;
      browseTableRows(currentSelectedDb, currentSelectedTable, 1);
    }

    function changeTableLimit(limit) {
      currentTableLimit = Number(limit) || 25;
      browseTableRows(currentSelectedDb, currentSelectedTable, 1);
    }

    function selectTable(dbName, tableName) {
      currentSelectedDb = document.getElementById('db-select')?.value || currentSelectedDb;
      currentSelectedTable = tableName;
      document.querySelectorAll('.db-table-item').forEach(el => {
        el.classList.toggle('active', el.textContent.includes(tableName));
      });
      browseTableRows(currentSelectedDb, tableName, 1);
      if (currentDbSubTab === 'ddl') viewTableDdl(currentSelectedDb, tableName);
    }

    async function browseTableRows(dbName, tableName, page = 1) {
      currentSelectedDb = dbName;
      currentSelectedTable = tableName;
      currentTablePage = page;
      const title = document.getElementById('db-table-data-title');
      const view = document.getElementById('db-table-data-view');
      const pager = document.getElementById('db-pagination-bar');
      if (title) title.textContent = 'Table: ' + tableName + ' (' + dbName + ')';
      if (view) view.innerHTML = '<div style="color:var(--forge-text-muted); padding:0.5rem;">Loading records...</div>';

      try {
        let url = apiBase + '/api/db/rows?db=' + encodeURIComponent(dbName) + '&table=' + encodeURIComponent(tableName) + '&page=' + page + '&limit=' + currentTableLimit;
        if (currentTableSearch && currentTableSearch.trim()) {
          url += '&search=' + encodeURIComponent(currentTableSearch.trim());
        }
        const res = await fetch(url).then(r => r.json());
        if (res.rows && res.rows.length) {
          const startIdx = (page - 1) * currentTableLimit;
          const ths = '<th style="width:36px; text-align:center;">#</th>' + res.columns.map(c => '<th class="col-resizable-th"><span>' + c + '</span><span class="col-resizer"></span></th>').join('');
          const trs = res.rows.map((r, rIdx) => {
            const cells = res.columns.map(c => {
              const val = r[c];
              if (val === null || val === undefined) return '<td><span class="cell-null">null</span></td>';
              return '<td class="cell-copyable" onclick="copyCellValue(\\'' + String(val).replace(/'/g, "\\\\'") + '\\')" title="Click to copy">' + String(val) + '</td>';
            }).join('');
            return '<tr><td class="cell-row-num">' + (startIdx + rIdx + 1) + '</td>' + cells + '</tr>';
          }).join('');

          view.innerHTML = '<table class="data-table" id="db-active-data-table"><thead><tr>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table>';
          initColumnResize(document.getElementById('db-active-data-table'));

          const totalPages = Math.ceil((res.totalCount || 1) / res.limit);
          pager.innerHTML = '<span style="font-size:0.75rem; color:var(--forge-text-muted);">Page ' + page + ' of ' + totalPages + ' (' + res.totalCount + ' matching rows)</span>' +
            '<div style="display:flex; gap:0.3rem;">' +
            (page > 1 ? '<button class="astryx-btn btn-outline" style="padding:0.2rem 0.5rem; font-size:0.72rem;" onclick="browseTableRows(\\'' + dbName + '\\',\\'' + tableName + '\\',' + (page - 1) + ')">&larr; Prev</button>' : '') +
            (page < totalPages ? '<button class="astryx-btn btn-outline" style="padding:0.2rem 0.5rem; font-size:0.72rem;" onclick="browseTableRows(\\'' + dbName + '\\',\\'' + tableName + '\\',' + (page + 1) + ')">Next &rarr;</button>' : '') +
            '</div>';
        } else {
          view.innerHTML = '<p style="color:var(--forge-text-muted); padding:0.5rem;">' + (currentTableSearch ? 'No rows matching search query "' + currentTableSearch + '" in ' : 'Zero rows in table ') + tableName + '.</p>';
          if (pager) pager.innerHTML = '';
        }
      } catch (err) {
        if (view) view.innerHTML = '<div style="color:var(--forge-accent); padding:0.5rem;">Failed to browse table rows.</div>';
      }
    }

    async function viewTableDdl(dbName, tableName) {
      const title = document.getElementById('db-ddl-title');
      const view = document.getElementById('db-ddl-view');
      if (title) title.textContent = '📜 Schema DDL: ' + tableName + ' (' + dbName + ')';
      if (view) view.textContent = 'Loading schema definition...';
      try {
        const res = await fetch(apiBase + '/api/db/schema?db=' + dbName + '&table=' + tableName).then(r => r.json());
        let text = res.ddl || '';
        if (res.indexes && res.indexes.length) text += '\\n\\n-- Indexes\\n' + res.indexes.join(';\\n') + ';';
        if (view) view.textContent = text;
      } catch (err) {
        if (view) view.textContent = 'Failed to load DDL schema.';
      }
    }

    async function checkDatabaseIntegrity() {
      const dbName = document.getElementById('db-select').value;
      const res = await fetch(apiBase + '/api/db/integrity', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dbName })
      }).then(r => r.json());
      if (window.astryxToast) {
        window.astryxToast(res.success ? 'Database integrity verified (0 errors).' : 'Integrity check result: ' + JSON.stringify(res), res.success ? 'success' : 'warning');
      }
    }

    async function optimizeCurrentDb() {
      const dbName = document.getElementById('db-select').value;
      const res = await fetch(apiBase + '/api/db/optimize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dbName })
      }).then(r => r.json());
      if (window.astryxToast) {
        window.astryxToast(res.message, res.success ? 'success' : 'info');
      }
    }

    async function backupCurrentDb() {
      const dbName = document.getElementById('db-select').value;
      const res = await fetch(apiBase + '/api/db/backup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dbName })
      }).then(r => r.json());
      if (window.astryxToast) {
        window.astryxToast(res.message, res.success ? 'success' : 'info');
      }
    }

    function exportCurrentTableCsv() {
      window.open(apiBase + '/api/export/csv?type=table&db=' + currentSelectedDb + '&table=' + currentSelectedTable, '_blank');
    }
    function exportTrafficCsv() { window.open(apiBase + '/api/export/csv?type=traffic', '_blank'); }
    function exportAuditCsv() { window.open(apiBase + '/api/export/csv?type=audit', '_blank'); }

    function insertSqlSnippet(snippet) {
      const el = document.getElementById('sql-query-input');
      if (el) {
        el.value = snippet;
        switchDbSubTab('sql');
        el.focus();
      }
    }

    function exportSqlResultCsv() {
      const db = document.getElementById('db-select').value;
      window.open(apiBase + '/api/export/csv?type=table&db=' + db + '&table=' + currentSelectedTable, '_blank');
    }
  `;
}
