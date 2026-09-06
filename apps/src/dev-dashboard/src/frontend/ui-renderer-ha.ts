/**
 * @forge/dev-dashboard - 24/7 High-Availability & Persistence Reliability Suite HTML Renderer (2026 LTS)
 * Visual Astryx 6-Stage Reliability Console with rich telemetry badges and inline stage guides.
 */

import { astryxIcons } from '@forge/ui';
import { loadBrandConfig } from '@forge/sdk';

/**
 * renderHighAvailabilitySuite
 * @requirements [HLR-UI-401] [LLR-UI-001]
 */
export function renderHighAvailabilitySuite(): string {
  return `
    <!-- 24/7 High-Availability & Persistence Reliability Console -->
    <div class="ha-console-wrapper">
      
      <!-- Console Header Banner -->
      <div class="ha-console-header">
        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <div class="ha-console-icon-wrap">
            <span style="display: flex; align-items: center; color: var(--forge-primary);">${astryxIcons.shield}</span>
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap;">
              <h3 style="font-size: 1.05rem; font-weight: 700; margin: 0; color: var(--forge-text-main);">
                24/7 High-Availability & Zero-Downtime Resilience Suite
              </h3>
              <span class="ha-pill-hero">● 6-STAGE RELIABILITY MATRIX</span>
            </div>
            <p style="color: var(--forge-text-muted); font-size: 0.78rem; margin: 0.15rem 0 0 0;">
              Production container auto-restart, auto-healing watchdogs, dedicated storage persistence, and host boot lifecycle.
            </p>
          </div>
        </div>
        <div style="display: flex; gap: 0.45rem; align-items: center; flex-wrap: wrap;">
          <span class="astryx-micro-pill" style="color: var(--forge-primary);" id="ha-os-pill">Detecting Environment...</span>
          <button class="astryx-btn btn-primary" style="padding: 0.28rem 0.65rem; font-size: 0.74rem;" onclick="open247GuideModal()">
            📖 Full OS Setup Guide
          </button>
        </div>
      </div>

      <!-- 6-Stage Resilience Grid -->
      <div class="ha-stages-grid">

        <!-- Stage 1: Container Orchestration & Auto-Restart -->
        <div class="ha-stage-card ha-stage-card-repo" id="ha-card-stage-1">
          <div class="ha-card-top">
            <div class="ha-stage-tag-group">
              <span class="ha-stage-num">STAGE 1</span>
              <span class="ha-badge-repo" data-tooltip-title="📦 REPO ENFORCED" data-astryx-tooltip="Invariant is 100% configured & enforced in repository code and docker-compose.yml. Zero manual host setup needed.">REPO ENFORCED</span>
            </div>
            <span class="ha-status-badge ha-badge-success" id="ha-status-stage-1" data-tooltip-title="🟢 ACTIVE: AUTO-RESTART" data-astryx-tooltip="All 8 microservices and Caddy enforce restart: unless-stopped. Docker auto-revives containers on crash or daemon restart.">
              <span class="ha-status-glow"></span> ACTIVE
            </span>
          </div>
          <div class="ha-card-body">
            <h4 class="ha-card-heading">Container Auto-Restart Policy</h4>
            <div class="ha-telemetry-chips">
              <span class="ha-chip" data-tooltip-title="Microservice Coverage" data-astryx-tooltip="All 8 platform services and reverse proxy gateway are covered.">📦 8/8 Services Covered</span>
              <span class="ha-chip" data-tooltip-title="Restart Policy" data-astryx-tooltip="restart: unless-stopped active on all containers.">🔄 Policy: unless-stopped</span>
            </div>
          </div>
          <div class="ha-card-footer">
            <button class="ha-guide-toggle-btn" onclick="toggleHaGuide('stage-1')">
              <span>Quick Verify & Config</span> <span class="ha-toggle-arrow" id="arrow-stage-1">▾</span>
            </button>
          </div>
          <div class="ha-inline-guide" id="guide-stage-1" style="display: none;">
            <div class="ha-guide-inner">
              <div class="ha-guide-subhead">Verification Command:</div>
              <div class="guide-code-box">
                <code>docker compose -f docker/prod/docker-compose.yml ps</code>
                <button class="guide-copy-btn" onclick="copyGuideCode(this, 'docker compose -f docker/prod/docker-compose.yml ps')">Copy</button>
              </div>
              <div class="ha-guide-note">Configured in: <code>docker/prod/docker-compose.yml</code> (lines 43, 73, 101...).</div>
            </div>
          </div>
        </div>

        <!-- Stage 2: Health Probes & Autoheal Watchdog -->
        <div class="ha-stage-card ha-stage-card-repo" id="ha-card-stage-2">
          <div class="ha-card-top">
            <div class="ha-stage-tag-group">
              <span class="ha-stage-num">STAGE 2</span>
              <span class="ha-badge-repo" data-tooltip-title="📦 REPO ENFORCED" data-astryx-tooltip="Invariant is 100% configured & enforced in repository code and docker-compose.yml. Zero manual host setup needed.">REPO ENFORCED</span>
            </div>
            <span class="ha-status-badge ha-badge-success" id="ha-status-stage-2" data-tooltip-title="🟢 ACTIVE: DUAL HEALTH PROBES" data-astryx-tooltip="autoheal sidecar continuously monitors Docker sockets. Probes test HTTP endpoints every 10s and reboot frozen processes.">
              <span class="ha-status-glow"></span> ACTIVE
            </span>
          </div>
          <div class="ha-card-body">
            <h4 class="ha-card-heading">Dual Health Probes & Auto-Healer</h4>
            <div class="ha-telemetry-chips">
              <span class="ha-chip" data-tooltip-title="Probe Interval" data-astryx-tooltip="HTTP health spider checks endpoints every 10 seconds.">🩺 10s Health Interval</span>
              <span class="ha-chip" data-tooltip-title="Watchdog Sidecar" data-astryx-tooltip="willfarrell/autoheal container watchdog active on socket /var/run/docker.sock.">⚡ Autoheal Sidecar Active</span>
            </div>
          </div>
          <div class="ha-card-footer">
            <button class="ha-guide-toggle-btn" onclick="toggleHaGuide('stage-2')">
              <span>Quick Verify & Config</span> <span class="ha-toggle-arrow" id="arrow-stage-2">▾</span>
            </button>
          </div>
          <div class="ha-inline-guide" id="guide-stage-2" style="display: none;">
            <div class="ha-guide-inner">
              <div class="ha-guide-subhead">Simulate Crash & Test Recovery:</div>
              <div class="guide-code-box">
                <code>docker kill ag-landing-prod && sleep 5 && docker ps</code>
                <button class="guide-copy-btn" onclick="copyGuideCode(this, 'docker kill ag-landing-prod && sleep 5 && docker ps')">Copy</button>
              </div>
              <div class="ha-guide-note">Watchdog image: <code>willfarrell/autoheal</code> with socket binding <code>/var/run/docker.sock</code>.</div>
            </div>
          </div>
        </div>

        <!-- Stage 3: Zero-Data-Loss Database Persistence -->
        <div class="ha-stage-card ha-stage-card-repo" id="ha-card-stage-3">
          <div class="ha-card-top">
            <div class="ha-stage-tag-group">
              <span class="ha-stage-num">STAGE 3</span>
              <span class="ha-badge-repo" data-tooltip-title="📦 REPO ENFORCED" data-astryx-tooltip="Invariant is 100% configured & enforced in repository code and docker-compose.yml. Zero manual host setup needed.">REPO ENFORCED</span>
            </div>
            <span class="ha-status-badge ha-badge-success" id="ha-status-stage-3" data-tooltip-title="🟢 LOCKED: DATA PERSISTENCE" data-astryx-tooltip="Isolated Turso / SQLite databases are pinned to named Docker volumes (ag_prod_db_*) in WAL mode. Data is never lost on rebuilds.">
              <span class="ha-status-glow"></span> LOCKED
            </span>
          </div>
          <div class="ha-card-body">
            <h4 class="ha-card-heading">Data Volume & DB Persistence</h4>
            <div class="ha-telemetry-chips">
              <span class="ha-chip" id="ha-chip-storage-free" data-tooltip-title="Volume Storage" data-astryx-tooltip="Named Docker volumes ag_prod_db_* mounted with WAL journaling.">💾 Dedicated Storage Active</span>
              <span class="ha-chip" data-tooltip-title="WAL Checkpointing" data-astryx-tooltip="SQLite Write-Ahead Logging active with auto-vacuum protection.">🛡️ WAL Checkpointed</span>
            </div>
          </div>
          <div class="ha-card-footer">
            <button class="ha-guide-toggle-btn" onclick="toggleHaGuide('stage-3')">
              <span>Quick Verify & Config</span> <span class="ha-toggle-arrow" id="arrow-stage-3">▾</span>
            </button>
          </div>
          <div class="ha-inline-guide" id="guide-stage-3" style="display: none;">
            <div class="ha-guide-inner">
              <div class="ha-guide-subhead">Inspect Named Volumes:</div>
              <div class="guide-code-box">
                <code>docker volume ls --filter name=ag_prod_db</code>
                <button class="guide-copy-btn" onclick="copyGuideCode(this, 'docker volume ls --filter name=ag_prod_db')">Copy</button>
              </div>
              <div class="ha-guide-note">⚠️ <strong>Rule:</strong> Never use <code>docker compose down -v</code> in production as <code>-v</code> destroys volumes.</div>
            </div>
          </div>
        </div>

        <!-- Stage 4: Caddy Gateway & SSL Auto-Renewal -->
        <div class="ha-stage-card ha-stage-card-repo" id="ha-card-stage-4">
          <div class="ha-card-top">
            <div class="ha-stage-tag-group">
              <span class="ha-stage-num">STAGE 4</span>
              <span class="ha-badge-repo" data-tooltip-title="📦 REPO ENFORCED" data-astryx-tooltip="Invariant is 100% configured & enforced in repository code and docker-compose.yml. Zero manual host setup needed.">REPO ENFORCED</span>
            </div>
            <span class="ha-status-badge ha-badge-success" id="ha-status-stage-4" data-tooltip-title="🟢 READY: GATEWAY & SSL" data-astryx-tooltip="Caddy reverse proxy on Ports 80 & 443 handles automated TLS certificate generation, HTTP-to-HTTPS redirects, and upstream load-balancing.">
              <span class="ha-status-glow"></span> READY
            </span>
          </div>
          <div class="ha-card-body">
            <h4 class="ha-card-heading">Gateway Routing & Auto-SSL</h4>
            <div class="ha-telemetry-chips">
              <span class="ha-chip" data-tooltip-title="Ingress Ports" data-astryx-tooltip="Caddy listening on standard HTTP (80) and HTTPS (443) ports.">🌐 Ports: 80 / 443</span>
              <span class="ha-chip" data-tooltip-title="SSL Auto-Renewal" data-astryx-tooltip="Let's Encrypt / ZeroSSL TLS certificates automated and cached in persistent volume.">🔒 Auto-TLS Cached</span>
            </div>
          </div>
          <div class="ha-card-footer">
            <button class="ha-guide-toggle-btn" onclick="toggleHaGuide('stage-4')">
              <span>Quick Verify & Config</span> <span class="ha-toggle-arrow" id="arrow-stage-4">▾</span>
            </button>
          </div>
          <div class="ha-inline-guide" id="guide-stage-4" style="display: none;">
            <div class="ha-guide-inner">
              <div class="ha-guide-subhead">Test Gateway Health Probe:</div>
              <div class="guide-code-box">
                <code>curl -I http://localhost:80/</code>
                <button class="guide-copy-btn" onclick="copyGuideCode(this, 'curl -I http://localhost:80/')">Copy</button>
              </div>
              <div class="ha-guide-note">Configured in: <code>proxy/Caddyfile</code> and <code>scripts/generate-proxy.ts</code>.</div>
            </div>
          </div>
        </div>

        <!-- Stage 5: Host Daemon Boot Autostart & Live-Restore -->
        <div class="ha-stage-card ha-stage-card-host" id="ha-card-stage-5">
          <div class="ha-card-top">
            <div class="ha-stage-tag-group">
              <span class="ha-stage-num">STAGE 5</span>
              <span class="ha-badge-host" data-tooltip-title="⚡ HOST ACTION" data-astryx-tooltip="Requires one-time host operating system configuration (e.g. systemd autostart or service installer).">HOST ACTION</span>
            </div>
            <span class="ha-status-badge ha-badge-warning" id="ha-status-stage-5" data-tooltip-title="🟡 HOST SETUP: BOOT AUTOSTART" data-astryx-tooltip="Enables Docker daemon at OS boot and installs ${loadBrandConfig().name} service unit so the platform auto-boots after machine restarts.">
              <span class="ha-status-glow"></span> HOST SETUP
            </span>
          </div>
          <div class="ha-card-body">
            <h4 class="ha-card-heading">Host Daemon Boot Autostart</h4>
            <div class="ha-telemetry-chips">
              <span class="ha-chip" data-tooltip-title="Systemd Unit" data-astryx-tooltip="Template available in scripts/systemd/sg-forge.service for 1-click install.">🚀 Systemd Unit Available</span>
              <span class="ha-chip" data-tooltip-title="Live-Restore Mode" data-astryx-tooltip="Allows containers to remain running during Docker daemon upgrades.">⚡ Live-Restore Mode</span>
            </div>
          </div>
          <div class="ha-card-footer">
            <button class="ha-guide-toggle-btn" onclick="toggleHaGuide('stage-5')">
              <span>Quick Verify & Config</span> <span class="ha-toggle-arrow" id="arrow-stage-5">▾</span>
            </button>
          </div>
          <div class="ha-inline-guide" id="guide-stage-5" style="display: none;">
            <div class="ha-guide-inner">
              <div class="ha-guide-subhead">1-Click Linux Systemd Installation:</div>
              <div class="guide-code-box">
                <code>sudo bash scripts/systemd/install-service.sh</code>
                <button class="guide-copy-btn" onclick="copyGuideCode(this, 'sudo bash scripts/systemd/install-service.sh')">Copy</button>
              </div>
              <div class="ha-guide-note">For WSL2 / macOS / Windows native, click "Full OS Setup Guide" above.</div>
            </div>
          </div>
        </div>

        <!-- Stage 6: Host Machine Sleep & Standby Guard -->
        <div class="ha-stage-card ha-stage-card-host" id="ha-card-stage-6">
          <div class="ha-card-top">
            <div class="ha-stage-tag-group">
              <span class="ha-stage-num">STAGE 6</span>
              <span class="ha-badge-host" data-tooltip-title="⚡ HOST ACTION" data-astryx-tooltip="Requires one-time host operating system configuration (e.g. disabling sleep mode in power settings).">HOST ACTION</span>
            </div>
            <span class="ha-status-badge ha-badge-warning" id="ha-status-stage-6" data-tooltip-title="🟡 POWER GUARD: STANDBY PREVENTION" data-astryx-tooltip="Prevents the host computer from entering low-power sleep, standby, or hibernation while serving requests 24/7.">
              <span class="ha-status-glow"></span> POWER GUARD
            </span>
          </div>
          <div class="ha-card-body">
            <h4 class="ha-card-heading">OS Sleep & Standby Guard</h4>
            <div class="ha-telemetry-chips">
              <span class="ha-chip" data-tooltip-title="Power Plan" data-astryx-tooltip="Set host power scheme to High Performance / Always On.">🔋 Power Plan: Always On</span>
              <span class="ha-chip" data-tooltip-title="Standby State" data-astryx-tooltip="System standby and sleep targets masked or disabled.">💤 Standby: Disabled</span>
            </div>
          </div>
          <div class="ha-card-footer">
            <button class="ha-guide-toggle-btn" onclick="toggleHaGuide('stage-6')">
              <span>Quick Verify & Config</span> <span class="ha-toggle-arrow" id="arrow-stage-6">▾</span>
            </button>
          </div>
          <div class="ha-inline-guide" id="guide-stage-6" style="display: none;">
            <div class="ha-guide-inner">
              <div class="ha-guide-subhead">Linux Sleep Masking Command:</div>
              <div class="guide-code-box">
                <code>sudo systemctl mask sleep.target suspend.target hibernate.target</code>
                <button class="guide-copy-btn" onclick="copyGuideCode(this, 'sudo systemctl mask sleep.target suspend.target hibernate.target')">Copy</button>
              </div>
              <div class="ha-guide-note">On macOS/Windows: Disable Sleep in System Energy / Power Settings.</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
}
