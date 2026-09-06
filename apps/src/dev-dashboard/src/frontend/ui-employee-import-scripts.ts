/**
 * @forge/dev-dashboard - Employee Bulk Import Client Wizard (2026 LTS)
 * Client-side CSV / JSON parser, drag-and-drop handler, and validation coordinator.
  * @requirements [HLR-UI-401] [LLR-UI-001]
 */

export function getEmployeeImportScripts(): string {
  return `
    let parsedImportRecords = [];

    function openImportWizard() {
      parsedImportRecords = [];
      document.getElementById('import-step-1').style.display = 'block';
      document.getElementById('import-step-2').style.display = 'none';
      document.getElementById('import-step-3').style.display = 'none';
      document.getElementById('import-file-input').value = '';
      const modal = document.getElementById('modal-import-wizard');
      if (modal) {
        modal.classList.add('open');
        modal.style.display = 'flex';
      }
    }

    function closeImportWizard() {
      const modal = document.getElementById('modal-import-wizard');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
    }

    function handleImportFileSelect(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      processImportFile(file);
    }

    function handleFileDrop(e) {
      e.preventDefault();
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (!file) return;
      processImportFile(file);
    }

    function parseCsvText(text) {
      const lines = text.split(/\\r?\\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) return [];

      const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
      const records = [];

      for (let i = 1; i < lines.length; i++) {
        const values = [];
        let cur = '';
        let inQuotes = false;
        for (let c of lines[i]) {
          if (c === '"' || c === "'") { inQuotes = !inQuotes; }
          else if (c === ',' && !inQuotes) { values.push(cur.trim()); cur = ''; }
          else { cur += c; }
        }
        values.push(cur.trim());

        const obj = {};
        headers.forEach((h, idx) => {
          let v = values[idx] || '';
          v = v.replace(/^["']|["']$/g, '').trim();
          obj[h] = v;
        });
        records.push(obj);
      }
      return records;
    }

    function processImportFile(file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        try {
          const content = evt.target.result;
          if (file.name.endsWith('.json')) {
            parsedImportRecords = JSON.parse(content);
          } else {
            parsedImportRecords = parseCsvText(content);
          }

          if (!Array.isArray(parsedImportRecords) || parsedImportRecords.length === 0) {
            throw new Error('No valid records parsed from file.');
          }

          showImportStep2();
        } catch (err) {
          if (typeof showAstryxToast === 'function') {
            showAstryxToast('error', 'Failed to parse file: ' + err.message);
          }
        }
      };
      reader.readAsText(file);
    }

    function showImportStep2() {
      document.getElementById('import-step-1').style.display = 'none';
      document.getElementById('import-step-2').style.display = 'block';
      document.getElementById('import-step-3').style.display = 'none';

      document.getElementById('import-record-count-badge').textContent = \`\${parsedImportRecords.length} records parsed\`;

      const tbody = document.getElementById('import-preview-tbody');
      if (tbody) {
        const previewRows = parsedImportRecords.slice(0, 5);
        tbody.innerHTML = previewRows.map((r, i) => \`
          <tr>
            <td>\${i + 1}</td>
            <td><strong>\${r.display_name || r.name || ''}</strong></td>
            <td><code>\${r.email || ''}</code></td>
            <td>\${r.job_title || r.title || ''}</td>
            <td>\${r.department || r.dept || ''}</td>
            <td>\${r.manager_email || r.manager || ''}</td>
            <td><span class="astryx-badge">\${r.role || 'roles/employee'}</span></td>
          </tr>\`).join('');
      }
    }

    async function executeImportValidation(isDryRun) {
      const autoCreate = document.getElementById('import-opt-autodept').checked;
      const dupAction = document.getElementById('import-opt-duplicate').value;

      try {
        const res = await fetch(\`\${apiBase}/api/employees/import\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            records: parsedImportRecords,
            options: {
              autoCreateDepartments: autoCreate,
              duplicateAction: dupAction,
              dryRun: isDryRun,
            },
          }),
        });
        const json = await res.json();
        if (json.status !== 'ok') throw new Error(json.error || 'Import operation failed');

        const summary = json.summary;

        if (isDryRun) {
          document.getElementById('import-step-2').style.display = 'none';
          document.getElementById('import-step-3').style.display = 'block';

          document.getElementById('dryrun-valid-count').textContent = summary.valid;
          document.getElementById('dryrun-invalid-count').textContent = summary.invalid;
          document.getElementById('dryrun-dept-count').textContent = (summary.createdDepartments || []).length;

          const errBox = document.getElementById('dryrun-errors-box');
          if (summary.errors && summary.errors.length > 0) {
            errBox.style.display = 'block';
            errBox.innerHTML = summary.errors.map(e => \`<div>• Row \${e.row}: \${e.error}</div>\`).join('');
          } else {
            errBox.style.display = 'none';
          }
        } else {
          showAstryxToast('success', \`Successfully imported \${summary.valid} employees into organization!\`);
          closeImportWizard();
          if (typeof switchEmployeeSubTab === 'function') switchEmployeeSubTab('table');
          loadEmployees();
        }
      } catch (err) {
        showAstryxToast('error', err.message);
      }
    }

    function exportEmployees(format, statusOverride) {
      const params = new URLSearchParams();
      params.set('format', format || 'csv');
      if (currentEmployeeFilter.search) params.set('search', currentEmployeeFilter.search);
      if (currentEmployeeFilter.departmentId) params.set('departmentId', currentEmployeeFilter.departmentId);
      const st = statusOverride !== undefined && statusOverride !== null ? statusOverride : currentEmployeeFilter.status;
      if (st) params.set('status', st);

      const downloadUrl = \`\${apiBase}/api/employees/export?\${params.toString()}\`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', \`employees_export_\${Date.now()}.\${format === 'json' ? 'json' : 'csv'}\`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showAstryxToast('success', 'Exporting organization data (' + (format || 'csv').toUpperCase() + ')...');
    }
  `;
}
