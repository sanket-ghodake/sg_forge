/**
 * @forge/dev-hub - Live Cluster Health & Latency Mesh Section
 * Astryx Design Standards & Operational Performance Benchmarks (2026 LTS Baseline)
 * @requirements [HLR-HUB-601] [LLR-SUB-005]
 */

import { astryxIcons } from '@forge/ui';

export function renderHealthMeshSection(): string {
  return `
    <section id="section-health" class="hub-section">
      <div class="astryx-card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span style="color: var(--forge-primary); display: flex;">${astryxIcons.activity}</span>
              <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--forge-text-main); margin: 0;">
                Live Cluster Health & Dual-Probe Latency Mesh
              </h2>
            </div>
            <span style="font-size: 0.85rem; color: var(--forge-text-muted);">
              Operational heartbeat monitoring and real-time round-trip latency (RTT) diagnostics across all platform containers.
            </span>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button id="ping-all-btn" class="astryx-btn btn-primary" onclick="pingAllServices()">
              <span>Ping All Services</span>
              <span style="margin-left: 0.35rem;">${astryxIcons.zap}</span>
            </button>
          </div>
        </div>

        <!-- Latency Diagnostics Table -->
        <div class="tokens-table-wrap">
          <table class="astryx-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Probe Endpoint</th>
                <th>Target Port</th>
                <th>Liveness Status</th>
                <th>Round-Trip Time (RTT)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="health-mesh-tbody">
              <tr data-service="landing" data-endpoint="/health" data-health="/health">
                <td><strong>Platform Landing Hub</strong></td>
                <td><code>/health</code></td>
                <td><code>:3000</code></td>
                <td class="service-status-cell"><span class="status-pill status-ready">IDLE</span></td>
                <td class="service-latency-cell latency-cell">-- ms</td>
                <td><button class="copy-btn" onclick="pingSingleService('landing', '/health')">Ping</button></td>
              </tr>
              <tr data-service="portal" data-endpoint="/portal/health" data-health="/portal/health">
                <td><strong>Workspace Portal</strong></td>
                <td><code>/portal/health</code></td>
                <td><code>:3001</code></td>
                <td class="service-status-cell"><span class="status-pill status-ready">IDLE</span></td>
                <td class="service-latency-cell latency-cell">-- ms</td>
                <td><button class="copy-btn" onclick="pingSingleService('portal', '/portal/health')">Ping</button></td>
              </tr>
              <tr data-service="dev-dashboard" data-endpoint="/devcenter/health" data-health="/devcenter/health">
                <td><strong>Dev Dashboard & DB Studio</strong></td>
                <td><code>/devcenter/health</code></td>
                <td><code>:3002</code></td>
                <td class="service-status-cell"><span class="status-pill status-ready">IDLE</span></td>
                <td class="service-latency-cell latency-cell">-- ms</td>
                <td><button class="copy-btn" onclick="pingSingleService('dev-dashboard', '/devcenter/health')">Ping</button></td>
              </tr>
              <tr data-service="dev-hub" data-endpoint="/health" data-health="/health">
                <td><strong>Developer Gateway Hub</strong></td>
                <td><code>/health</code></td>
                <td><code>:3003</code></td>
                <td class="service-status-cell"><span class="status-pill status-ready">IDLE</span></td>
                <td class="service-latency-cell latency-cell">-- ms</td>
                <td><button class="copy-btn" onclick="pingSingleService('dev-hub', '/health')">Ping</button></td>
              </tr>
              <tr data-service="auth" data-endpoint="/auth/health" data-health="/auth/health">
                <td><strong>Auth & Directory Gateway</strong></td>
                <td><code>/auth/health</code></td>
                <td><code>:3004</code></td>
                <td class="service-status-cell"><span class="status-pill status-ready">IDLE</span></td>
                <td class="service-latency-cell latency-cell">-- ms</td>
                <td><button class="copy-btn" onclick="pingSingleService('auth', '/auth/health')">Ping</button></td>
              </tr>
              <tr data-service="billing" data-endpoint="/apps/billing/health" data-health="/apps/billing/health">
                <td><strong>Billing Micro-App</strong></td>
                <td><code>/apps/billing/health</code></td>
                <td><code>:8088</code></td>
                <td class="service-status-cell"><span class="status-pill status-ready">IDLE</span></td>
                <td class="service-latency-cell latency-cell">-- ms</td>
                <td><button class="copy-btn" onclick="pingSingleService('billing', '/apps/billing/health')">Ping</button></td>
              </tr>
              <tr data-service="telemetry" data-endpoint="/apps/telemetry/health" data-health="/apps/telemetry/health">
                <td><strong>Telemetry Micro-App</strong></td>
                <td><code>/apps/telemetry/health</code></td>
                <td><code>:8089</code></td>
                <td class="service-status-cell"><span class="status-pill status-ready">IDLE</span></td>
                <td class="service-latency-cell latency-cell">-- ms</td>
                <td><button class="copy-btn" onclick="pingSingleService('telemetry', '/apps/telemetry/health')">Ping</button></td>
              </tr>
              <tr data-service="expenses" data-endpoint="/apps/expenses/health" data-health="/apps/expenses/health">
                <td><strong>Expenses Micro-App</strong></td>
                <td><code>/apps/expenses/health</code></td>
                <td><code>:8085</code></td>
                <td class="service-status-cell"><span class="status-pill status-ready">IDLE</span></td>
                <td class="service-latency-cell latency-cell">-- ms</td>
                <td><button class="copy-btn" onclick="pingSingleService('expenses', '/apps/expenses/health')">Ping</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}
