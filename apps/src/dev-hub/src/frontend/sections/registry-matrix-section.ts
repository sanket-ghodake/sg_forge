/**
 * @forge/dev-hub - Dynamic Route Matrix & Fleet Health Ingress Section
 * Astryx Design Standards & Unified Ingress Gateway Architecture (2026 LTS Baseline)
 */

import { astryxIcons } from '@forge/ui';
import { loadBrandConfig, loadServiceRegistry, type ServiceEntry } from '@forge/sdk';

/**
 * Fallback baseline services to guarantee catalog completeness.
 * @requirements [HLR-HUB-601] [LLR-SUB-005]
 */
const FALLBACK_REGISTRY: ServiceEntry[] = [
  { id: 'landing', name: 'Platform Landing Hub', port: 3000, path: '/', category: 'Core Platform', role: 'Public Ingress', containerName: 'landing', upstreamUrl: 'http://landing:3000', isExternal: false, isPublic: true, healthUrl: '/health' },
  { id: 'portal', name: 'Workspace Portal', port: 3001, path: '/portal', category: 'Core SPA', role: 'roles/employee', containerName: 'portal', upstreamUrl: 'http://portal:3001', isExternal: true, isPublic: false, healthUrl: '/portal/health' },
  { id: 'devcenter', name: 'Dev Dashboard & DB Studio', port: 3002, path: '/devcenter', category: 'Diagnostics', role: 'roles/admin', containerName: 'dev-dashboard', upstreamUrl: 'http://dev-dashboard:3002', isExternal: true, isPublic: false, healthUrl: '/devcenter/health' },
  { id: 'gateway', name: 'Developer Gateway Hub', port: 3003, path: '/gateway', category: 'Control Plane', role: 'Public / Developer', containerName: 'dev-hub', upstreamUrl: 'http://dev-hub:3003', isExternal: true, isPublic: true, healthUrl: '/gateway/health' },
  { id: 'auth', name: 'Auth & Directory Gateway', port: 3004, path: '/auth', category: 'SSO & IAM', role: 'Public + Scoped', containerName: 'auth', upstreamUrl: 'http://auth:3004', isExternal: true, isPublic: true, healthUrl: '/auth/health' },
  { id: 'telemetry', name: 'Real-time Metrics Hub', port: 8087, path: '/apps/telemetry', category: 'Forge Micro-App', role: 'roles/employee', containerName: 'app-telemetry', upstreamUrl: 'http://app-telemetry:8087', isExternal: true, isPublic: false, healthUrl: '/apps/telemetry/health' },
  { id: 'billing', name: 'Billing & Subscriptions', port: 8088, path: '/apps/billing', category: 'Forge Micro-App', role: 'roles/employee', containerName: 'billing', upstreamUrl: 'http://billing:8088', isExternal: true, isPublic: false, healthUrl: '/apps/billing/health' },
];

/**
 * renderRegistryMatrixSection
 * Unified Ingress Route Matrix, Fleet Health Probing, and Gateway Headers.
 * @requirements [HLR-HUB-601] [LLR-SUB-005]
 */
export function renderRegistryMatrixSection(): string {
  const brand = loadBrandConfig();
  let services = loadServiceRegistry();

  if (!services || services.length === 0) {
    services = FALLBACK_REGISTRY;
  } else {
    for (const fb of FALLBACK_REGISTRY) {
      if (!services.some(s => s.path === fb.path || s.id === fb.id)) {
        services.push(fb);
      }
    }
  }

  return `
    <section id="section-routes" class="hub-section">
      <!-- 1. Route Matrix & Live Fleet Health -->
      <div class="astryx-card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span style="color: var(--forge-primary); display: flex;">${astryxIcons.table}</span>
              <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--forge-text-main); margin: 0;">
                Dynamic Ingress Route Matrix & Service Registry
              </h2>
            </div>
            <span style="font-size: 0.85rem; color: var(--forge-text-muted);">
              Declarative routes parsed dynamically from <code>.env</code> via <code>@forge/sdk/registry</code> with live health probing and upstream targets.
            </span>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <button id="ping-all-btn" class="astryx-btn btn-primary" style="font-size: 0.75rem; padding: 0.3rem 0.7rem;" onclick="pingAllServices()">
              <span>Ping All Fleet</span>
              <span style="margin-left: 0.3rem;">${astryxIcons.zap}</span>
            </button>
            <span class="astryx-badge badge-pill">${services.length} Registered Routes</span>
          </div>
        </div>

        <div class="tokens-table-wrap" style="margin-bottom: 1.75rem;">
          <table class="astryx-table">
            <thead>
              <tr>
                <th>App Identifier</th>
                <th>Display Name</th>
                <th>Ingress Path</th>
                <th>Role Gate</th>
                <th>Upstream Target</th>
                <th>Health Probe</th>
                <th>RTT Latency</th>
                <th>Sandbox</th>
              </tr>
            </thead>
            <tbody>
              ${services.map((svc) => `
                <tr data-service="${svc.id}" data-endpoint="${svc.healthUrl || svc.path}" data-health="${svc.healthUrl || '/health'}">
                  <td><code>${svc.id}</code></td>
                  <td>${svc.name.replace(/Platform/g, brand.name)}</td>
                  <td><code>${svc.path}</code></td>
                  <td>
                    <span class="astryx-badge ${svc.isPublic ? 'badge-online' : 'badge-pill'}" style="font-size: 0.72rem;">
                      ${svc.role || (svc.isPublic ? 'Public' : 'Protected')}
                    </span>
                  </td>
                  <td><code>${svc.containerName}:${svc.port}</code></td>
                  <td class="service-status-cell"><span class="status-pill status-ready">IDLE</span></td>
                  <td class="service-latency-cell latency-cell">-- ms</td>
                  <td>
                    <div style="display: flex; gap: 0.35rem;">
                      <button class="copy-btn" onclick="pingSingleService('${svc.id}', '${svc.healthUrl || '/health'}')">Ping</button>
                      <button class="astryx-btn btn-outline" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;" onclick="sendToSandbox('GET', '${svc.healthUrl || svc.path}')">
                        <span>Test</span>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- 2. Gateway Identity Header Protocol -->
        <div style="border-top: 1px solid var(--forge-border); padding-top: 1.25rem; margin-top: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="color: var(--forge-primary); display: flex;">${astryxIcons.shield}</span>
              <h3 style="font-size: 1.05rem; color: var(--forge-text-main); margin: 0;">Injected Identity Headers Protocol</h3>
            </div>
            <button class="astryx-btn btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.6rem;" onclick="switchTab('sandbox')">
              <span>Test Simulator</span>
              <span style="margin-left: 0.25rem;">${astryxIcons.zap}</span>
            </button>
          </div>
          <p style="font-size: 0.82rem; color: var(--forge-text-muted); margin-bottom: 0.85rem;">
            The Gateway terminates TLS, validates JWT session cookies, and injects verified identity headers upstream:
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 1.25rem;">
            <div style="background: var(--forge-bg-surface); padding: 0.75rem; border: 1px solid var(--forge-border); border-radius: var(--forge-radius);">
              <code style="color: var(--forge-primary);">X-Forwarded-User</code>
              <p style="font-size: 0.75rem; color: var(--forge-text-muted); margin: 0.25rem 0 0 0;">Employee email address</p>
            </div>
            <div style="background: var(--forge-bg-surface); padding: 0.75rem; border: 1px solid var(--forge-border); border-radius: var(--forge-radius);">
              <code style="color: var(--forge-primary);">X-Forwarded-User-Id</code>
              <p style="font-size: 0.75rem; color: var(--forge-text-muted); margin: 0.25rem 0 0 0;">Immutable canonical EID</p>
            </div>
            <div style="background: var(--forge-bg-surface); padding: 0.75rem; border: 1px solid var(--forge-border); border-radius: var(--forge-radius);">
              <code style="color: var(--forge-primary);">X-Forwarded-Role</code>
              <p style="font-size: 0.75rem; color: var(--forge-text-muted); margin: 0.25rem 0 0 0;">RBAC role authorization scope</p>
            </div>
            <div style="background: var(--forge-bg-surface); padding: 0.75rem; border: 1px solid var(--forge-border); border-radius: var(--forge-radius);">
              <code style="color: var(--forge-primary);">X-Trace-Id</code>
              <p style="font-size: 0.75rem; color: var(--forge-text-muted); margin: 0.25rem 0 0 0;">Correlation trace identifier</p>
            </div>
          </div>
        </div>

        <!-- 3. Declarative Ingress Configuration (.env) -->
        <div style="border-top: 1px solid var(--forge-border); padding-top: 1.25rem;">
          <h3 style="font-size: 1.05rem; color: var(--forge-text-main); margin: 0 0 0.4rem 0;">Declarative Service Registration (<code>.env</code>)</h3>
          <p style="font-size: 0.82rem; color: var(--forge-text-muted); margin-bottom: 0.65rem;">
            Add a single line in <code>.env</code> to expose microservices at the edge:
          </p>
          <pre class="code-block" style="margin: 0 0 0.75rem 0;"><code>APP_&lt;ID&gt;="&lt;Display Name&gt;|&lt;Port&gt;|&lt;Path Prefix&gt;|&lt;Category&gt;|&lt;Role Restriction&gt;|&lt;Upstream Host&gt;"
APP_TELEMETRY="Live Telemetry Dashboard|8087|/apps/telemetry|Polyglot Micro-Apps|Public / Engineering|host.docker.internal"</code></pre>
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
            <span style="font-size: 0.78rem; color: var(--forge-text-muted);">Run proxy sync after modifying <code>.env</code>:</span>
            <code style="background: var(--forge-bg-root); padding: 0.25rem 0.6rem; border-radius: 4px; border: 1px solid var(--forge-border); font-size: 0.78rem;">rtk bun scripts/generate-proxy.ts</code>
          </div>
        </div>
      </div>
    </section>
  `;
}
