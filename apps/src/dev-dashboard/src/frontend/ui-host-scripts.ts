/**
 * @forge/dev-dashboard - Host Infrastructure & Cloud Diagnostics Client Scripts (2026 LTS)
 * Client logic for updating circular SVG gauges, multi-core CPU matrix, disk stats, and network interfaces.
  * @requirements [HLR-UI-401] [LLR-UI-001]
 */

export function getHostDashboardScripts(): string {
  return `
    async function loadHostVitals() {
      try {
        const res = await fetch(apiBase + '/api/host/vitals').then(r => r.json());
        if (res && res.status === 'ok') {
          updateHostHeaderAndSystem(res.system);
          updateHostGauges(res);
          renderHostCpus(res.cpu);
          renderHostStorage(res.storage, res.memory);
          renderHostNetwork(res.network);
        }
        loadReliabilityDiagnostics();
      } catch (err) {
        console.error('Failed to load host vitals', err);
      }
    }

    function updateHostHeaderAndSystem(sys) {
      if (!sys) return;
      const pill = document.getElementById('host-engine-pill');
      const pidPill = document.getElementById('host-pid-pill');
      const uptimeSub = document.getElementById('host-uptime-sub');

      if (pill) pill.textContent = 'Bun v' + sys.bunVersion + ' (' + sys.platform + ' ' + sys.architecture + ')';
      if (pidPill) pidPill.textContent = 'PID: ' + sys.pid;
      if (uptimeSub) {
        const h = Math.floor(sys.hostUptimeSeconds / 3600);
        const m = Math.floor((sys.hostUptimeSeconds % 3600) / 60);
        uptimeSub.textContent = 'Host Uptime: ' + h + 'h ' + m + 'm';
      }
    }

    function updateHostGauges(data) {
      // 1. CPU Gauge
      const cpuLoad = data.cpu?.loadAvg?.[0] || 0;
      const coreCount = data.cpu?.coreCount || 1;
      const cpuLoadNormalized = Math.min(100, Math.round((cpuLoad / coreCount) * 100));

      const cpuValEl = document.getElementById('host-cpu-load-val');
      const cpuCoresEl = document.getElementById('host-cpu-cores-count');
      const cpuSubEl = document.getElementById('host-cpu-loadavg-sub');
      const cpuRing = document.getElementById('gauge-cpu-ring');

      if (cpuValEl) cpuValEl.textContent = cpuLoadNormalized;
      if (cpuCoresEl) cpuCoresEl.textContent = coreCount + ' Cores';
      if (cpuSubEl) cpuSubEl.textContent = 'Load Avg: ' + (data.cpu?.loadAvg || []).join(', ');
      if (cpuRing) {
        const offset = 100 - cpuLoadNormalized;
        cpuRing.setAttribute('stroke-dashoffset', offset);
        cpuRing.style.stroke = cpuLoadNormalized > 80 ? 'var(--forge-accent)' : 'var(--forge-primary)';
      }

      // 2. Memory Gauge
      const memUsedPct = data.memory?.usedPercent || 0;
      const memValEl = document.getElementById('host-mem-percent-val');
      const memSubEl = document.getElementById('host-mem-breakdown-sub');
      const memRing = document.getElementById('gauge-mem-ring');

      if (memValEl) memValEl.textContent = memUsedPct;
      if (memSubEl && data.memory) {
        const usedGb = (data.memory.usedBytes / (1024 * 1024 * 1024)).toFixed(1);
        const totalGb = (data.memory.totalBytes / (1024 * 1024 * 1024)).toFixed(1);
        const physGb = data.memory.physicalHostTotalBytes ? (data.memory.physicalHostTotalBytes / (1024 * 1024 * 1024)).toFixed(1) : totalGb;
        if (Number(physGb) > Number(totalGb)) {
          memSubEl.textContent = usedGb + ' / ' + totalGb + ' GB (' + physGb + ' GB Host)';
          memSubEl.title = data.memory.virtualizationNote || 'WSL2/Container allocated RAM vs Host Machine RAM';
        } else {
          memSubEl.textContent = usedGb + ' GB / ' + totalGb + ' GB';
        }
      }
      if (memRing) {
        const offset = 100 - memUsedPct;
        memRing.setAttribute('stroke-dashoffset', offset);
        memRing.style.stroke = memUsedPct > 85 ? 'var(--forge-accent)' : 'var(--forge-primary)';
      }

      // 3. Disk Gauge (Root Volume)
      const diskUsedPct = data.storage?.rootVolume?.usedPercent || 0;
      const diskValEl = document.getElementById('host-disk-percent-val');
      const diskSubEl = document.getElementById('host-disk-breakdown-sub');
      const diskRing = document.getElementById('gauge-disk-ring');

      if (diskValEl) diskValEl.textContent = diskUsedPct;
      if (diskSubEl && data.storage?.rootVolume) {
        const freeGb = (data.storage.rootVolume.availableBytes / (1024 * 1024 * 1024)).toFixed(1);
        const totalGb = (data.storage.rootVolume.totalBytes / (1024 * 1024 * 1024)).toFixed(1);
        diskSubEl.textContent = freeGb + ' GB free of ' + totalGb + ' GB';
      }
      if (diskRing) {
        const offset = 100 - diskUsedPct;
        diskRing.setAttribute('stroke-dashoffset', offset);
      }

      // 4. Process RSS
      const rssMb = (data.memory?.processRssBytes / (1024 * 1024)).toFixed(1);
      const rssValEl = document.getElementById('host-process-rss-val');
      if (rssValEl) rssValEl.textContent = rssMb;
    }

    function renderHostCpus(cpu) {
      if (!cpu) return;
      const modelEl = document.getElementById('host-cpu-model-label');
      const grid = document.getElementById('host-cores-grid');

      if (modelEl) modelEl.textContent = cpu.model || 'CPU Cores Matrix';
      if (grid && cpu.cores) {
        grid.innerHTML = cpu.cores.map(c => \`
          <div class="core-item-box">
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.7rem;">
              <span style="font-weight:600; color:var(--forge-text-main);">Core #\${c.coreIndex}</span>
              <span style="color:var(--forge-text-subtle); font-family:monospace;">\${c.speedMhz} MHz</span>
            </div>
            <div class="core-bar-track">
              <div class="core-bar-fill" style="width:\${c.usagePercent}%; background:\${c.usagePercent > 80 ? 'var(--forge-accent)' : 'var(--forge-primary)'};"></div>
            </div>
            <div style="font-size:0.68rem; color:var(--forge-text-muted); text-align:right;">\${c.usagePercent}% load</div>
          </div>
        \`).join('');
      }
    }

    function renderHostStorage(storage, memory) {
      const grid = document.getElementById('host-storage-grid');
      if (!grid || !storage) return;

      const root = storage.rootVolume;
      const dataVol = storage.dataVolume;

      const rootTotalGb = (root.totalBytes / (1024 * 1024 * 1024)).toFixed(1);
      const rootUsedGb = (root.usedBytes / (1024 * 1024 * 1024)).toFixed(1);
      const dataTotalGb = (dataVol.totalBytes / (1024 * 1024 * 1024)).toFixed(1);
      const dataUsedGb = (dataVol.usedBytes / (1024 * 1024 * 1024)).toFixed(1);

      const heapUsedMb = (memory?.processHeapUsedBytes / (1024 * 1024)).toFixed(1);
      const heapTotalMb = (memory?.processHeapTotalBytes / (1024 * 1024)).toFixed(1);
      const totalRamGb = (memory?.totalBytes / (1024 * 1024 * 1024)).toFixed(1);
      const physRamGb = memory?.physicalHostTotalBytes ? (memory.physicalHostTotalBytes / (1024 * 1024 * 1024)).toFixed(1) : totalRamGb;
      const isVirt = Number(physRamGb) > Number(totalRamGb);

      grid.innerHTML = \`
        <div class="storage-volume-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:0.82rem; color:var(--forge-text-main);">Root Filesystem (/)</strong>
            <span class="astryx-micro-pill">\${root.usedPercent}% FULL</span>
          </div>
          <div class="core-bar-track" style="height:6px;">
            <div class="core-bar-fill" style="width:\${root.usedPercent}%;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--forge-text-subtle);">
            <span>Used: \${rootUsedGb} GB</span>
            <span>Total Capacity: \${rootTotalGb} GB</span>
          </div>
        </div>

        <div class="storage-volume-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:0.82rem; color:var(--forge-text-main);">Process Heap & Buffers</strong>
            <span class="astryx-micro-pill" style="color:var(--forge-primary);">ALLOCATED</span>
          </div>
          <div class="core-bar-track" style="height:6px;">
            <div class="core-bar-fill" style="width:\${Math.min(100, Math.round((memory?.processHeapUsedBytes / (memory?.processHeapTotalBytes || 1)) * 100))}%;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--forge-text-subtle);">
            <span>Heap Used: \${heapUsedMb} MB</span>
            <span>Heap Total: \${heapTotalMb} MB</span>
          </div>
        </div>

        <div class="storage-volume-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:0.82rem; color:var(--forge-text-main);">Physical Host Hardware RAM</strong>
            <span class="astryx-micro-pill" style="color:\${isVirt ? 'var(--forge-accent)' : 'var(--forge-success)'};">\${isVirt ? memory.virtualizationType?.toUpperCase() : 'BARE METAL'}</span>
          </div>
          <div class="core-bar-track" style="height:6px;">
            <div class="core-bar-fill" style="width:\${Math.min(100, Math.round((memory?.usedBytes / (memory?.totalBytes || 1)) * 100))}%;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--forge-text-subtle);">
            <span>Active VM RAM: \${totalRamGb} GB</span>
            <span>Host Physical RAM: \${physRamGb} GB</span>
          </div>
        </div>
      \`;
    }

    function renderHostNetwork(network) {
      const container = document.getElementById('host-network-table-container');
      if (!container || !network || !network.interfaces) return;

      container.innerHTML = \`
        <table class="data-table">
          <thead>
            <tr>
              <th>Interface</th>
              <th>Family</th>
              <th>IP Address</th>
              <th>Netmask</th>
              <th>Hardware MAC</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            \${network.interfaces.map(iface => \`
              <tr>
                <td><span class="astryx-micro-pill" style="font-weight:700;">\${iface.name}</span></td>
                <td><code style="font-size:0.72rem;">\${iface.family}</code></td>
                <td><strong style="font-family:monospace; font-size:0.76rem; color:var(--forge-primary);">\${iface.address}</strong></td>
                <td><span style="font-family:monospace; font-size:0.72rem; color:var(--forge-text-muted);">\${iface.netmask}</span></td>
                <td><code style="font-size:0.72rem;">\${iface.mac || '--'}</code></td>
                <td><span class="astryx-badge \${iface.internal ? 'badge-degraded' : 'badge-running'}">\${iface.internal ? 'LOOPBACK' : 'EXTERNAL'}</span></td>
              </tr>
            \`).join('')}
          </tbody>
        </table>
      \`;
    }

    async function loadReliabilityDiagnostics() {
      try {
        const res = await fetch(apiBase + '/api/host/reliability').then(r => r.json());
        if (res && res.status === 'ok') {
          const osPill = document.getElementById('ha-os-pill');
          const settingOsPill = document.getElementById('settings-ha-os-pill');
          if (osPill) osPill.textContent = res.environment?.osName || 'Linux';
          if (settingOsPill) settingOsPill.textContent = res.environment?.osName || 'Linux';

          const chipStorage = document.getElementById('ha-chip-storage-free');
          if (chipStorage && res.repoInvariants?.freeSpaceMb) {
            chipStorage.textContent = '💾 ' + res.repoInvariants.freeSpaceMb + ' MB Free Storage';
          }

          // Set default active tab in guide modal according to detected platform
          if (res.hostRequirements?.platformGuideKey) {
            window._detectedPlatformGuideKey = res.hostRequirements.platformGuideKey;
          }
        }
      } catch (err) {
        console.error('Failed to load reliability diagnostics', err);
      }
    }

    function toggleHaGuide(stageId) {
      const guideEl = document.getElementById('guide-' + stageId);
      const arrowEl = document.getElementById('arrow-' + stageId);
      if (guideEl) {
        const isHidden = guideEl.style.display === 'none' || !guideEl.style.display;
        guideEl.style.display = isHidden ? 'block' : 'none';
        if (arrowEl) arrowEl.textContent = isHidden ? '▴' : '▾';
      }
    }

    function open247GuideModal() {
      const modal = document.getElementById('modal-247-guide');
      if (modal) {
        modal.classList.add('open');
        modal.style.display = 'flex';
        const key = window._detectedPlatformGuideKey || 'ubuntu';
        switch247GuideTab(key);
      }
    }

    function close247GuideModal() {
      const modal = document.getElementById('modal-247-guide');
      if (modal) {
        modal.classList.remove('open');
        modal.style.display = 'none';
      }
    }

    function switch247GuideTab(tabKey) {
      const allTabs = document.querySelectorAll('.guide-tab-btn');
      const allPanes = document.querySelectorAll('.guide-tab-pane');
      allTabs.forEach(t => t.classList.remove('active'));
      allPanes.forEach(p => p.style.display = 'none');

      const activeBtn = document.querySelector('.guide-tab-btn[data-guide-tab="' + tabKey + '"]');
      const activePane = document.getElementById('guide-pane-' + tabKey);
      if (activeBtn) activeBtn.classList.add('active');
      if (activePane) activePane.style.display = 'block';
    }

    function copyGuideCode(btn, codeText) {
      navigator.clipboard.writeText(codeText).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.style.color = 'var(--forge-success)';
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.color = '';
        }, 2000);
      });
    }

    window.open247GuideModal = open247GuideModal;
    window.close247GuideModal = close247GuideModal;
    window.switch247GuideTab = switch247GuideTab;
    window.toggleHaGuide = toggleHaGuide;
    window.copyGuideCode = copyGuideCode;
  `;
}
