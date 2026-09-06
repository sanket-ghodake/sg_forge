/**
 * @forge/dev-hub - Dynamic Route Matrix & Registry Explorer Section
 * Astryx Design Standards (2026 LTS Baseline)
 */

import { loadBrandConfig } from '@forge/sdk';

/**
 * renderRegistryMatrixSection
 * @requirements [HLR-HUB-601] [LLR-SUB-005]
 */
export function renderRegistryMatrixSection(): string {
  const brand = loadBrandConfig();
  return `
    <section id="section-routes" class="hub-section">
      <div class="astryx-card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--forge-text-main); margin: 0 0 0.25rem 0;">
              🔀 Dynamic Ingress Route Matrix & Service Registry
            </h2>
            <span style="font-size: 0.85rem; color: var(--forge-text-muted);">
              Declarative routes parsed from <code>.env</code> and mapped to upstream reverse proxy handlers.
            </span>
          </div>
          <span class="astryx-badge badge-pill">Dynamic Ingress Spec</span>
        </div>

        <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 1.25rem;">
          The Edge Gateway inspects incoming request URLs and applies role restriction gates before proxying traffic upstream:
        </p>

        <div class="tokens-table-wrap">
          <table class="astryx-table">
            <thead>
              <tr>
                <th>App Identifier</th>
                <th>Display Name</th>
                <th>Ingress Path</th>
                <th>Required Role Gate</th>
                <th>Upstream Host & Port</th>
                <th>Ingress Type</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>landing</code></td>
                <td>${brand.name} Landing Hub</td>
                <td><code>/</code></td>
                <td><span class="astryx-badge badge-pill">Public / All</span></td>
                <td><code>landing:3000</code></td>
                <td>Core Platform</td>
              </tr>
              <tr>
                <td><code>portal</code></td>
                <td>Workspace Portal</td>
                <td><code>/portal</code></td>
                <td><span class="astryx-badge badge-pill">roles/employee</span></td>
                <td><code>portal:3001</code></td>
                <td>Core SPA</td>
              </tr>
              <tr>
                <td><code>dev-dashboard</code></td>
                <td>Dev Dashboard & DB Studio</td>
                <td><code>/devcenter</code></td>
                <td><span class="astryx-badge badge-pill">roles/admin</span></td>
                <td><code>dev-dashboard:3002</code></td>
                <td>Diagnostics</td>
              </tr>
              <tr>
                <td><code>dev-hub</code></td>
                <td>Developer Gateway Hub</td>
                <td><code>/gateway</code></td>
                <td><span class="astryx-badge badge-pill">Public / Developer</span></td>
                <td><code>dev-hub:3003</code></td>
                <td>Control Plane</td>
              </tr>
              <tr>
                <td><code>auth</code></td>
                <td>Auth & Directory Gateway</td>
                <td><code>/auth</code></td>
                <td><span class="astryx-badge badge-pill">Public + Scoped</span></td>
                <td><code>auth:3004</code></td>
                <td>SSO & IAM</td>
              </tr>
              <tr>
                <td><code>billing</code></td>
                <td>Billing & Subscriptions</td>
                <td><code>/apps/billing</code></td>
                <td><span class="astryx-badge badge-pill">roles/employee</span></td>
                <td><code>billing:8088</code></td>
                <td>Forge Micro-App</td>
              </tr>
              <tr>
                <td><code>telemetry</code></td>
                <td>Real-time Metrics Hub</td>
                <td><code>/apps/telemetry</code></td>
                <td><span class="astryx-badge badge-pill">roles/employee</span></td>
                <td><code>telemetry:8089</code></td>
                <td>Forge Micro-App</td>
              </tr>
              <tr>
                <td><code>expenses</code></td>
                <td>Corporate Expenses Tracker</td>
                <td><code>/apps/expenses</code></td>
                <td><span class="astryx-badge badge-pill">roles/employee</span></td>
                <td><code>expenses:8085</code></td>
                <td>Python FastAPI App</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}
