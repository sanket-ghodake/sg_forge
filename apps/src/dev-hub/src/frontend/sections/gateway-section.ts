/**
 * @forge/dev-hub - Gateway Ingress & Zero-Trust Reverse Proxy Section
 * Astryx Design Standards (2026 LTS Baseline)
 */

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
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--forge-text-main); margin: 0 0 0.25rem 0;">
              🔀 Gateway Ingress & Zero-Trust Reverse Proxy
            </h2>
            <span style="font-size: 0.85rem; color: var(--forge-text-muted);">
              Declarative service registration, Caddy auto-generation, and zero-trust identity header injection.
            </span>
          </div>
          <span class="astryx-badge badge-online">Port 80 / 443</span>
        </div>

        <!-- Section 1: Injected Headers Table -->
        <h3 style="font-size: 1.1rem; color: var(--forge-text-main); margin: 0 0 0.5rem 0;">1. Injected Identity Headers</h3>
        <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 1rem;">
          When requests pass through the ${brand.name} Gateway, upstream microservices automatically receive pre-authenticated user context. You can read these headers directly in Python, Go, or Node without verifying cookies:
        </p>

        <div class="tokens-table-wrap" style="margin-bottom: 1.5rem;">
          <table class="astryx-table">
            <thead>
              <tr>
                <th>Header Name</th>
                <th>Example Injected Value</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>X-Forwarded-User</code></td>
                <td><code>alice.eng@forge.internal</code></td>
                <td>Authenticated employee email address</td>
              </tr>
              <tr>
                <td><code>X-Forwarded-User-Id</code></td>
                <td><code>usr-alice-eng</code></td>
                <td>Unique immutable user identifier</td>
              </tr>
              <tr>
                <td><code>X-Forwarded-Role</code></td>
                <td><code>roles/employee</code></td>
                <td>RBAC role identifier (<code>roles/admin</code>, <code>roles/employee</code>)</td>
              </tr>
              <tr>
                <td><code>X-Forwarded-Org-Path</code></td>
                <td><code>/root/tech/eng-core</code></td>
                <td>Hierarchical department tree path</td>
              </tr>
              <tr>
                <td><code>X-Trace-Id</code></td>
                <td><code>tr-4f9e2b10a8</code></td>
                <td>Immutable request correlation trace ID</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Section 2: Declarative .env Registration -->
        <h3 style="font-size: 1.1rem; color: var(--forge-text-main); margin: 1.5rem 0 0.5rem 0;">2. Declarative Micro-App Registration in <code>.env</code></h3>
        <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 0.75rem;">
          Register external microservices, Python backends, or dashboards simply by adding a single line to <code>.env</code>:
        </p>

        <pre class="code-block"><code># Format:
# APP_&lt;ID&gt;="&lt;Display Name&gt;|&lt;Port/Upstream&gt;|&lt;Path Prefix&gt;|&lt;Category&gt;|&lt;Role Restriction&gt;|&lt;Upstream Host&gt;"

# Example 1: Python FastAPI ML Analytics Service (Internal Port 8000)
APP_ANALYTICS="ML Analytics Engine|8000|/apps/analytics|AI Tools|Employee / Admin|host.docker.internal"

# Example 2: Go Fiber Real-Time Dashboard (Port 9090)
APP_METRICS="Live Cluster Metrics|9090|/apps/metrics|Infrastructure|Admin Only|host.docker.internal"

# Example 3: Public Documentation Site (Port 8080)
APP_DOCS="Open API Docs|8080|/docs|Developer|Public / Everyone|host.docker.internal"</code></pre>

        <!-- Section 3: Proxy Synchronization Command -->
        <h3 style="font-size: 1.1rem; color: var(--forge-text-main); margin: 1.5rem 0 0.5rem 0;">3. Synchronizing Ingress Proxy</h3>
        <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 0.75rem;">
          To regenerate Caddyfile rules and refresh upstream route mappings without downtime:
        </p>

        <pre class="code-block"><code>rtk bun scripts/generate-proxy.ts</code></pre>
      </div>
    </section>
  `;
}
