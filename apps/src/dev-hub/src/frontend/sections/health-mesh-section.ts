/**
 * @forge/dev-hub - Live Cluster Health & Latency Mesh Section
 * Astryx Design Standards (2026 LTS Baseline)
  * @requirements [HLR-HUB-601] [LLR-SUB-005]
 */

export function renderHealthMeshSection(): string {
  return `
    <section id="section-health" class="hub-section">
      <div class="astryx-card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--forge-text-main); margin: 0 0 0.25rem 0;">
              🟢 Live Cluster Health & Dual-Probe Latency Mesh
            </h2>
            <span style="font-size: 0.85rem; color: var(--forge-text-muted);">
              Real-time multi-service heartbeat polling with microsecond latency benchmarks.
            </span>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button id="ping-all-btn" class="astryx-btn btn-primary" onclick="pingAllServices()">
              <span>⚡ Ping All Services</span>
            </button>
          </div>
        </div>

        <div class="tokens-table-wrap">
          <table class="astryx-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Ingress Route</th>
                <th>Port / Upstream</th>
                <th>Probe Status</th>
                <th>Latency (RTT)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="health-mesh-tbody">
              <tr data-service="landing" data-endpoint="/health">
                <td><strong>Platform Landing Hub</strong></td>
                <td><code>/</code></td>
                <td><code>:3000</code></td>
                <td><span class="status-pill status-ready">IDLE</span></td>
                <td class="latency-cell">-- ms</td>
                <td><button class="copy-btn" onclick="pingSingleService('landing', '/health')">Ping</button></td>
              </tr>
              <tr data-service="portal" data-endpoint="/portal/health">
                <td><strong>Workspace Portal</strong></td>
                <td><code>/portal</code></td>
                <td><code>:3001</code></td>
                <td><span class="status-pill status-ready">IDLE</span></td>
                <td class="latency-cell">-- ms</td>
                <td><button class="copy-btn" onclick="pingSingleService('portal', '/portal/health')">Ping</button></td>
              </tr>
              <tr data-service="dev-dashboard" data-endpoint="/devcenter/health">
                <td><strong>Dev Dashboard & DB Studio</strong></td>
                <td><code>/devcenter</code></td>
                <td><code>:3002</code></td>
                <td><span class="status-pill status-ready">IDLE</span></td>
                <td class="latency-cell">-- ms</td>
                <td><button class="copy-btn" onclick="pingSingleService('dev-dashboard', '/devcenter/health')">Ping</button></td>
              </tr>
              <tr data-service="dev-hub" data-endpoint="/health">
                <td><strong>Developer Gateway Hub</strong></td>
                <td><code>/gateway</code></td>
                <td><code>:3003</code></td>
                <td><span class="status-pill status-ready">IDLE</span></td>
                <td class="latency-cell">-- ms</td>
                <td><button class="copy-btn" onclick="pingSingleService('dev-hub', '/health')">Ping</button></td>
              </tr>
              <tr data-service="auth" data-endpoint="/auth/health">
                <td><strong>Auth & Directory Gateway</strong></td>
                <td><code>/auth</code></td>
                <td><code>:3004</code></td>
                <td><span class="status-pill status-ready">IDLE</span></td>
                <td class="latency-cell">-- ms</td>
                <td><button class="copy-btn" onclick="pingSingleService('auth', '/auth/health')">Ping</button></td>
              </tr>
              <tr data-service="billing" data-endpoint="/apps/billing/health">
                <td><strong>Billing Micro-App</strong></td>
                <td><code>/apps/billing</code></td>
                <td><code>:8088</code></td>
                <td><span class="status-pill status-ready">IDLE</span></td>
                <td class="latency-cell">-- ms</td>
                <td><button class="copy-btn" onclick="pingSingleService('billing', '/apps/billing/health')">Ping</button></td>
              </tr>
              <tr data-service="telemetry" data-endpoint="/apps/telemetry/health">
                <td><strong>Telemetry Micro-App</strong></td>
                <td><code>/apps/telemetry</code></td>
                <td><code>:8089</code></td>
                <td><span class="status-pill status-ready">IDLE</span></td>
                <td class="latency-cell">-- ms</td>
                <td><button class="copy-btn" onclick="pingSingleService('telemetry', '/apps/telemetry/health')">Ping</button></td>
              </tr>
              <tr data-service="expenses" data-endpoint="/apps/expenses/health">
                <td><strong>Expenses Micro-App</strong></td>
                <td><code>/apps/expenses</code></td>
                <td><code>:8085</code></td>
                <td><span class="status-pill status-ready">IDLE</span></td>
                <td class="latency-cell">-- ms</td>
                <td><button class="copy-btn" onclick="pingSingleService('expenses', '/apps/expenses/health')">Ping</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}
