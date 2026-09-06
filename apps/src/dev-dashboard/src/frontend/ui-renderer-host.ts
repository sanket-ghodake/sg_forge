/**
 * @forge/dev-dashboard - Host Infrastructure & Cloud Diagnostics HTML Renderer (2026 LTS)
 * Enterprise host telemetry: multi-core CPU, RAM, disk volume, and network interfaces.
 */

import { astryxIcons } from '@forge/ui';
import { renderHighAvailabilitySuite } from './ui-renderer-ha';

/**
 * renderHostTab
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function renderHostTab(): string {
  return `
    <!-- Tab 9: Host System & Cloud Infrastructure Diagnostics -->
    <section id="tab-host" class="tab-pane">
      
      <!-- 1. Header Command Card -->
      <div class="host-header-card">
        <div>
          <h2 style="font-size: 1.15rem; margin-bottom: 0.2rem; display: flex; align-items: center; gap: 0.45rem; font-weight: 700; color: var(--forge-text-main);">
            <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.host}</span>
            Host System & Infrastructure Diagnostics
          </h2>
          <p style="color: var(--forge-text-muted); font-size: 0.8rem; margin: 0;">
            Real-time kernel metrics, multi-core CPU loads, process allocations, disk volume capacity, and network interfaces.
          </p>
        </div>
        <div style="display: flex; gap: 0.45rem; align-items: center; flex-wrap: wrap;">
          <span class="astryx-micro-pill" style="color: var(--forge-success);" id="host-engine-pill">Bun v1.3.14 (Linux)</span>
          <button class="astryx-btn btn-outline" style="padding: 0.28rem 0.65rem; font-size: 0.74rem;" onclick="loadHostVitals(); loadReliabilityDiagnostics();">
            Refresh Vitals ↺
          </button>
        </div>
      </div>

      <!-- 1b. 24/7 High-Availability & Persistence Reliability Suite (6-Stage Matrix) -->
      ${renderHighAvailabilitySuite()}

      <!-- 2. 4 Primary Circular SVG Gauge Vitals -->
      <div class="host-vitals-grid">
        
        <!-- Gauge 1: CPU Pressure -->
        <div class="host-vital-gauge-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.7rem; font-weight: 600; text-transform: uppercase; color: var(--forge-text-muted);">CPU Utilization</span>
            <span class="astryx-micro-pill" id="host-cpu-cores-count">-- Cores</span>
          </div>
          <div class="gauge-circle-container">
            <div>
              <span style="font-size: 1.45rem; font-weight: 700; color: var(--forge-text-main);" id="host-cpu-load-val">0.0</span>
              <span style="font-size: 0.75rem; color: var(--forge-text-muted);">% (1m)</span>
            </div>
            <div class="gauge-svg-wrap">
              <svg class="gauge-svg" width="48" height="48" viewBox="0 0 36 36">
                <path class="gauge-bg-ring" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="gauge-fill-ring" id="gauge-cpu-ring" stroke-dasharray="100, 100" stroke-dashoffset="100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </div>
          <div style="font-size: 0.72rem; color: var(--forge-text-subtle);" id="host-cpu-loadavg-sub">Load Avg: 0.00, 0.00, 0.00</div>
        </div>

        <!-- Gauge 2: Physical RAM Memory -->
        <div class="host-vital-gauge-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.7rem; font-weight: 600; text-transform: uppercase; color: var(--forge-text-muted);">RAM Memory</span>
            <span class="astryx-micro-pill" style="color: var(--forge-primary);">SYSTEM</span>
          </div>
          <div class="gauge-circle-container">
            <div>
              <span style="font-size: 1.45rem; font-weight: 700; color: var(--forge-text-main);" id="host-mem-percent-val">0.0</span>
              <span style="font-size: 0.75rem; color: var(--forge-text-muted);">% Used</span>
            </div>
            <div class="gauge-svg-wrap">
              <svg class="gauge-svg" width="48" height="48" viewBox="0 0 36 36">
                <path class="gauge-bg-ring" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="gauge-fill-ring" id="gauge-mem-ring" stroke-dasharray="100, 100" stroke-dashoffset="100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </div>
          <div style="font-size: 0.72rem; color: var(--forge-text-subtle);" id="host-mem-breakdown-sub">-- GB / -- GB</div>
        </div>

        <!-- Gauge 3: Root Disk Storage Volume -->
        <div class="host-vital-gauge-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.7rem; font-weight: 600; text-transform: uppercase; color: var(--forge-text-muted);">Disk Volume (/)</span>
            <span class="astryx-micro-pill">STORAGE</span>
          </div>
          <div class="gauge-circle-container">
            <div>
              <span style="font-size: 1.45rem; font-weight: 700; color: var(--forge-text-main);" id="host-disk-percent-val">0.0</span>
              <span style="font-size: 0.75rem; color: var(--forge-text-muted);">% Used</span>
            </div>
            <div class="gauge-svg-wrap">
              <svg class="gauge-svg" width="48" height="48" viewBox="0 0 36 36">
                <path class="gauge-bg-ring" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="gauge-fill-ring" id="gauge-disk-ring" stroke-dasharray="100, 100" stroke-dashoffset="100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </div>
          <div style="font-size: 0.72rem; color: var(--forge-text-subtle);" id="host-disk-breakdown-sub">-- GB free of -- GB</div>
        </div>

        <!-- Gauge 4: Process Allocations & Uptime -->
        <div class="host-vital-gauge-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.7rem; font-weight: 600; text-transform: uppercase; color: var(--forge-text-muted);">Process RSS</span>
            <span class="astryx-micro-pill" id="host-pid-pill">PID: --</span>
          </div>
          <div class="gauge-circle-container">
            <div>
              <span style="font-size: 1.45rem; font-weight: 700; color: var(--forge-text-main);" id="host-process-rss-val">0.0</span>
              <span style="font-size: 0.75rem; color: var(--forge-text-muted);">MB</span>
            </div>
            <div class="gauge-svg-wrap">
              <svg class="gauge-svg" width="48" height="48" viewBox="0 0 36 36">
                <path class="gauge-bg-ring" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="gauge-fill-ring" id="gauge-process-ring" stroke-dasharray="100, 100" stroke-dashoffset="85" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </div>
          <div style="font-size: 0.72rem; color: var(--forge-text-subtle);" id="host-uptime-sub">Host Uptime: --</div>
        </div>

      </div>

      <!-- 3. CPU Multi-Core Matrix Section -->
      <div class="host-section-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.45rem;">
          <h3 style="font-size: 0.92rem; font-weight: 650; margin: 0; display: flex; align-items: center; gap: 0.45rem; color: var(--forge-text-main);">
            <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.cpu}</span>
            Multi-Core CPU Processor Telemetry
          </h3>
          <span style="font-size: 0.72rem; color: var(--forge-text-subtle);" id="host-cpu-model-label">Loading CPU model...</span>
        </div>
        <div class="cores-grid" id="host-cores-grid">
          <!-- Dynamically populated core boxes -->
        </div>
      </div>

      <!-- 4. Storage Partitions & Memory Profile Section -->
      <div class="host-section-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.45rem;">
          <h3 style="font-size: 0.92rem; font-weight: 650; margin: 0; display: flex; align-items: center; gap: 0.45rem; color: var(--forge-text-main);">
            <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.database}</span>
            Disk Storage Partitions & Process Heap Profile
          </h3>
          <span style="font-size: 0.72rem; color: var(--forge-text-subtle);">POSIX statfs storage diagnostics</span>
        </div>
        <div class="storage-volumes-grid" id="host-storage-grid">
          <!-- Dynamically populated storage volume cards -->
        </div>
      </div>

      <!-- 5. Network Interfaces & Adapter Topology -->
      <div class="host-section-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem;">
          <h3 style="font-size: 0.92rem; font-weight: 650; margin: 0; display: flex; align-items: center; gap: 0.45rem; color: var(--forge-text-main);">
            <span style="color: var(--forge-primary); display: flex; align-items: center;">${astryxIcons.network}</span>
            Host Network Interfaces & Hardware Adapters
          </h3>
          <span style="font-size: 0.72rem; color: var(--forge-text-subtle);">Real-time socket bindings</span>
        </div>
        <div class="astryx-table-wrap" id="host-network-table-container">
          <div style="padding: 1rem; text-align: center; color: var(--forge-text-muted);">Loading network interfaces...</div>
        </div>
      </div>

    </section>
  `;
}
