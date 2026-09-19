/**
 * @forge/dev-hub - Gateway Ingress & Zero-Trust Reverse Proxy Section
 * Astryx Design Standards & Reverse Proxy Architectural Directives (2026 LTS Baseline)
 */

import { astryxIcons } from '@forge/ui';
import { loadBrandConfig } from '@forge/sdk';

/**
 * renderGatewaySection
 * @requirements [HLR-HUB-601] [LLR-SUB-005]
 */
export function renderGatewaySection(): string {
  const brand = loadBrandConfig();
  return `
    <section id="section-gateway" class="hub-section">
      <div class="astryx-card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span style="color: var(--forge-primary); display: flex;">${astryxIcons.globe}</span>
              <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--forge-text-main); margin: 0;">
                Gateway Ingress & Zero-Trust Reverse Proxy
              </h2>
            </div>
            <span style="font-size: 0.85rem; color: var(--forge-text-muted);">
              Caddy edge reverse proxy specifications, identity header propagation, and Zero-Trust airgap isolation.
            </span>
          </div>
          <span class="astryx-badge badge-online">Port 80 / 443 &bull; TLS</span>
        </div>

        <!-- Section 1: Injected Identity Headers Specification -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
          <h3 style="font-size: 1.05rem; color: var(--forge-text-main); margin: 0;">1. Injected Identity Headers Protocol</h3>
          <button class="astryx-btn btn-outline" style="font-size: 0.75rem; padding: 0.3rem 0.65rem;" onclick="switchTab('sandbox')">
            <span>Test in Header Simulator</span>
            <span style="margin-left: 0.3rem;">${astryxIcons.zap}</span>
          </button>
        </div>
        <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 1rem;">
          The Edge Gateway terminates client TLS, validates session cookies, and propagates trusted identity headers to internal containers on <code>core-airgap-net</code>:
        </p>

        <div class="tokens-table-wrap" style="margin-bottom: 1.5rem;">
          <table class="astryx-table">
            <thead>
              <tr>
                <th>Header Name</th>
                <th>Protocol Type</th>
                <th>Injected Context</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>X-Forwarded-User</code></td>
                <td>RFC 7230 String</td>
                <td>Authenticated employee email address (e.g. <code>alice.eng@forge.internal</code>)</td>
              </tr>
              <tr>
                <td><code>X-Forwarded-User-Id</code></td>
                <td>Canonical EID</td>
                <td>Unique immutable user identifier (e.g. <code>usr-alice-eng</code>)</td>
              </tr>
              <tr>
                <td><code>X-Forwarded-Role</code></td>
                <td>RBAC Scope</td>
                <td>Assigned clearance role (<code>roles/admin</code>, <code>roles/employee</code>)</td>
              </tr>
              <tr>
                <td><code>X-Forwarded-Org-Path</code></td>
                <td>Hierarchy Path</td>
                <td>Hierarchical organizational department node (e.g. <code>/root/tech/eng-core</code>)</td>
              </tr>
              <tr>
                <td><code>X-Trace-Id</code></td>
                <td>Hex UUID</td>
                <td>Immutable request correlation trace ID across microservice hops</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Section 2: Declarative .env Ingress Mapping -->
        <h3 style="font-size: 1.05rem; color: var(--forge-text-main); margin: 1.5rem 0 0.5rem 0;">2. Declarative Ingress Registration (<code>.env</code>)</h3>
        <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 0.75rem;">
          Micro-apps and external services declare ingress routing rules in <code>.env</code> without touching Caddyfile or code:
        </p>

        <pre class="code-block"><code># Ingress Service Specification Syntax:
# APP_&lt;ID&gt;="&lt;Display Name&gt;|&lt;Port/Upstream&gt;|&lt;Path Prefix&gt;|&lt;Category&gt;|&lt;Role Restriction&gt;|&lt;Upstream Host&gt;"

# Example: Real-time Telemetry Dashboard
APP_TELEMETRY="Live Telemetry Dashboard|8087|/apps/telemetry|Polyglot Micro-Apps|Public / Engineering|host.docker.internal"</code></pre>

        <!-- Section 3: Ingress Proxy Generation -->
        <h3 style="font-size: 1.05rem; color: var(--forge-text-main); margin: 1.5rem 0 0.5rem 0;">3. Ingress Route Synchronization</h3>
        <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 0.75rem;">
          To regenerate Caddyfile rules and refresh upstream route mappings without downtime:
        </p>

        <pre class="code-block"><code>rtk bun scripts/generate-proxy.ts</code></pre>
      </div>
    </section>
  `;
}
