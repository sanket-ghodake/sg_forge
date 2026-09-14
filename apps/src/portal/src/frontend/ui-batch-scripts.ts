/**
 * @forge/portal - Batch Import & Manager Sync Client Scripts (2026 LTS)
 * Handles CSV ingestion, dry-run parsing, and direct-manager selector hydration.
 * @requirements [HLR-AUTH-004] [LLR-PORTAL-005] [LLR-UI-001]
 */

export function getBatchImportClientScript(): string {
  return `
    (function initBatchImportEngine() {
      function escapeHtml(str) {
        return String(str || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function getApiPrefix() {
        return window.location.pathname.startsWith('/portal') ? '/portal' : '';
      }

      function openModal(id) {
        var m = document.getElementById(id);
        if (m) {
          m.classList.add('open', 'active');
          m.setAttribute('aria-hidden', 'false');
        }
      }

      function closeModal(id) {
        var m = document.getElementById(id);
        if (m) {
          m.classList.remove('open', 'active');
          m.setAttribute('aria-hidden', 'true');
        }
      }

      // Hydrate Reporting Line Managers Dropdown
      async function loadManagers() {
        var mgrSelect = document.getElementById('invite-manager');
        if (!mgrSelect) return;
        try {
          var res = await fetch(getApiPrefix() + '/api/v1/portal/managers', {
            headers: { 'Accept': 'application/json' }
          });
          if (!res.ok) return;
          var body = await res.json();
          var managers = body.data || [];
          var opts = '<option value="">-- No Direct Manager (Top-level) --</option>';
          managers.forEach(function(m) {
            var label = escapeHtml(m.name) + ' (' + escapeHtml(m.email) + ') - ' + escapeHtml(m.department || 'General');
            opts += '<option value="' + escapeHtml(m.id) + '">' + label + '</option>';
          });
          mgrSelect.innerHTML = opts;
        } catch (err) {
          console.warn('Unable to load managers list:', err);
        }
      }

      // Hook Batch Import Modal Trigger
      var batchImportTrigger = document.getElementById('batch-import-btn');
      if (batchImportTrigger) {
        batchImportTrigger.addEventListener('click', function() {
          var statusBox = document.getElementById('batch-import-status-box');
          if (statusBox) statusBox.style.display = 'none';
          openModal('modal-batch-import');
        });
      }

      // File upload handler
      var fileInput = document.getElementById('batch-csv-file-input');
      var textarea = document.getElementById('batch-csv-textarea');
      if (fileInput && textarea) {
        fileInput.addEventListener('change', function(e) {
          var file = e.target.files && e.target.files[0];
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function(evt) {
            textarea.value = evt.target.result || '';
          };
          reader.readAsText(file);
        });
      }

      // Perform Dry-Run or Real Import
      async function executeImport(isDryRun) {
        var statusBox = document.getElementById('batch-import-status-box');
        var csvData = textarea ? textarea.value.trim() : '';
        if (!csvData) {
          if (window.astryxToast) window.astryxToast('Please paste or select a CSV roster file', 'error');
          return;
        }

        if (statusBox) {
          statusBox.style.display = 'block';
          statusBox.style.background = 'var(--forge-bg-card)';
          statusBox.style.color = 'var(--forge-text-main)';
          statusBox.style.border = '1px solid var(--forge-border)';
          statusBox.textContent = isDryRun ? 'Validating CSV roster against org policies...' : 'Ingesting employee roster...';
        }

        try {
          var endpoint = getApiPrefix() + '/api/v1/portal/members/import';
          var res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ csv_data: csvData, dry_run: isDryRun })
          });
          var data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Batch import failed');
          }

          if (isDryRun) {
            var validCount = data.valid_count || 0;
            var errList = data.errors || [];
            var html = '<div><strong>Dry Run Validation Passed:</strong> ' + validCount + ' record(s) ready.</div>';
            if (errList.length > 0) {
              html += '<div style="color: var(--forge-danger); margin-top: 0.5rem;"><strong>Issues Detected (' + errList.length + '):</strong><ul style="margin: 0.25rem 0 0 1rem; padding: 0;">';
              errList.slice(0, 5).forEach(function(err) {
                html += '<li>Row ' + err.row + ': ' + escapeHtml(err.error) + '</li>';
              });
              if (errList.length > 5) html += '<li>...and ' + (errList.length - 5) + ' more</li>';
              html += '</ul></div>';
            }
            if (statusBox) {
              statusBox.innerHTML = html;
              statusBox.style.borderColor = errList.length > 0 ? 'var(--forge-warning)' : 'var(--forge-accent)';
            }
            if (window.astryxToast) window.astryxToast('Dry run completed: ' + validCount + ' valid, ' + errList.length + ' issues', 'info');
          } else {
            var count = data.imported_count || 0;
            if (window.astryxToast) window.astryxToast('Successfully ingested ' + count + ' team members!', 'success');
            closeModal('modal-batch-import');
            if (textarea) textarea.value = '';
            if (fileInput) fileInput.value = '';
            // Notify members view to refresh
            window.dispatchEvent(new CustomEvent('admin-members-updated'));
            loadManagers();
          }
        } catch (err) {
          if (statusBox) {
            statusBox.style.display = 'block';
            statusBox.style.borderColor = 'var(--forge-danger)';
            statusBox.style.color = 'var(--forge-danger)';
            statusBox.textContent = err.message || 'Operation failed';
          }
          if (window.astryxToast) window.astryxToast(err.message || 'Import error', 'error');
        }
      }

      var dryRunBtn = document.getElementById('batch-dry-run-btn');
      if (dryRunBtn) {
        dryRunBtn.addEventListener('click', function() { executeImport(true); });
      }

      var confirmImportBtn = document.getElementById('confirm-batch-import-btn');
      if (confirmImportBtn) {
        confirmImportBtn.addEventListener('click', function() { executeImport(false); });
      }

      // Initial hydration and event triggers
      loadManagers();
      window.addEventListener('hashchange', function() {
        if (window.location.hash === '#admin-members') loadManagers();
      });
      document.addEventListener('viewchange', function(e) {
        if (e && e.detail === 'admin-members') loadManagers();
      });
    })();
  `;
}
