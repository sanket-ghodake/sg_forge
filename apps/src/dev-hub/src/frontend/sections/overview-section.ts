/**
 * @forge/dev-hub - Overview & System Architecture Section
 * Astryx Design Standards (2026 LTS Baseline)
 */

import { loadBrandConfig } from '@forge/sdk';

/**
 * renderOverviewSection
 * @requirements [HLR-HUB-601] [LLR-SUB-005]
 */
export function renderOverviewSection(): string {
  const brand = loadBrandConfig();
  return `
    <section id="section-overview" class="hub-section">
      <!-- Hero Banner -->
      <div class="astryx-card hero-card" style="margin-bottom: 2rem; position: relative; overflow: hidden;">
        <div class="hero-glow"></div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1.5rem; position: relative; z-index: 1;">
          <div style="max-width: 720px;">
            <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.75rem;">
              <span class="astryx-badge badge-pill">@forge/sdk v2.0.0 LTS</span>
              <span class="astryx-badge badge-online">Gateway Port 3003</span>
              <span class="astryx-badge badge-pill">Astryx UI</span>
            </div>
            <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--forge-text-main); margin: 0 0 0.75rem 0; letter-spacing: -0.02em;">
              🚀 Developer Hub & SDK Playground
            </h1>
            <p style="color: var(--forge-text-muted); line-height: 1.6; margin: 0 0 1.25rem 0; font-size: 0.95rem;">
              The centralized developer control plane for <strong>${brand.name}</strong> microservices. Access complete <strong>Forge SDK Contract</strong> specifications, <strong>Docker App Templates</strong>, Zero-Trust gateway headers, and an interactive live API sandbox.
            </p>
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <button class="astryx-btn btn-primary" onclick="switchTab('sandbox')">⚡ Launch API Sandbox</button>
              <button class="astryx-btn btn-outline" onclick="switchTab('sdk')">📦 Explore @forge/sdk</button>
              <button class="astryx-btn btn-outline" onclick="switchTab('gateway')">🔀 Gateway Routing Spec</button>
            </div>
          </div>
          <div class="quick-stats-box">
            <div class="stat-item">
              <span class="stat-num">5-Tier</span>
              <span class="stat-label">Test Governance</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">&lt;0.1ms</span>
              <span class="stat-label">Ed25519 Token Auth</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">RFC 7807</span>
              <span class="stat-label">Error Boundaries</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">100%</span>
              <span class="stat-label">Turso DB Isolation</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Navigation Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        <div class="astryx-card" style="cursor: pointer;" onclick="switchTab('sdk')">
          <h3 style="color: var(--forge-text-main); margin-bottom: 0.5rem; font-size: 1rem;">📦 Forge SDK Contract</h3>
          <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 0.75rem;">
            PostMessage handshake protocol, Zero-Trust Auth Guard, and scoped token validation specifications.
          </p>
          <span class="endpoint-badge">import { authGuard } from '@forge/sdk'</span>
        </div>

        <div class="astryx-card" style="cursor: pointer;" onclick="switchTab('scaffolding')">
          <h3 style="color: var(--forge-text-main); margin-bottom: 0.5rem; font-size: 1rem;">🐳 Docker App Templates</h3>
          <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 0.75rem;">
            Lightweight boilerplates for Python (FastAPI), Go (Fiber), and TypeScript micro-apps.
          </p>
          <span class="endpoint-badge">APP_&lt;NAME&gt; in .env</span>
        </div>

        <div class="astryx-card" style="cursor: pointer;" onclick="switchTab('sandbox')">
          <h3 style="color: var(--forge-text-main); margin-bottom: 0.5rem; font-size: 1rem;">⚡ Interactive Sandbox</h3>
          <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 0.75rem;">
            Execute live API requests and simulate injected Gateway identity headers.
          </p>
          <span class="endpoint-badge">GET /health</span>
        </div>
      </div>

      <!-- Architecture Topology Card -->
      <div class="astryx-card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.85rem; margin-bottom: 1.25rem;">
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--forge-text-main); margin: 0 0 0.25rem 0;">
              🏗️ Platform Architecture & Gateway Ingress Topology
            </h2>
            <span style="font-size: 0.82rem; color: var(--forge-text-muted);">
              Unified reverse proxy traffic distribution on ports 80 & 443 with Zero-Trust header propagation.
            </span>
          </div>
          <span class="astryx-badge badge-pill">Edge Gateway Matrix</span>
        </div>

        <div class="topology-diagram">
          <div class="topo-node topo-client">
            <span class="topo-icon">🌐</span>
            <strong>Client Browser</strong>
            <span class="topo-sub">SPA / Micro-Apps</span>
          </div>
          <div class="topo-arrow">
            <span class="arrow-label">Port 80 / 443</span>
            &rarr;
          </div>
          <div class="topo-node topo-proxy">
            <span class="topo-icon">🔀</span>
            <strong>Caddy / Nginx Ingress</strong>
            <span class="topo-sub">SSL & Header Injection</span>
          </div>
          <div class="topo-arrow">&rarr;</div>
          <div class="topo-services-grid">
            <div class="topo-subnode">
              <span class="badge-mini">/</span>
              <strong>Platform Hub</strong>
              <small>:3000</small>
            </div>
            <div class="topo-subnode">
              <span class="badge-mini">/portal</span>
              <strong>Workspace Portal</strong>
              <small>:3001</small>
            </div>
            <div class="topo-subnode">
              <span class="badge-mini">/auth</span>
              <strong>Auth & Directory</strong>
              <small>:3004</small>
            </div>
            <div class="topo-subnode highlight">
              <span class="badge-mini">/gateway</span>
              <strong>Developer Hub</strong>
              <small>:3003</small>
            </div>
            <div class="topo-subnode">
              <span class="badge-mini">/apps/*</span>
              <strong>Forge Micro-Apps</strong>
              <small>:8080+</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Core 10 Invariants Summary Grid -->
      <div class="astryx-card" style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--forge-text-main); margin: 0 0 1rem 0;">
          🛡️ The 10 Non-Negotiable Engineering Invariants (Enterprise Standard)
        </h2>
        <div class="invariants-grid">
          <div class="inv-card">
            <div class="inv-num">01</div>
            <h4>Grounding & No Guessing</h4>
            <p>Always inspect types, schemas, callers, and tests before modifying code.</p>
          </div>
          <div class="inv-card">
            <div class="inv-num">02</div>
            <h4>500-Line Soft File Cap</h4>
            <p>Source files must remain $\le 500$ lines ($\le 300$ ideal). Blocked by pre-commit gate.</p>
          </div>
          <div class="inv-card">
            <div class="inv-num">03</div>
            <h4>Astryx UI Standard</h4>
            <p>Strictly use <code>@forge/ui</code> and <code>--forge-*</code> variables. Zero OS browser defaults.</p>
          </div>
          <div class="inv-card">
            <div class="inv-num">04</div>
            <h4>Structured Logging & PII</h4>
            <p>RFC 7807 problem details, Enterprise SRE JSON logs, and recursive PII redaction.</p>
          </div>
          <div class="inv-card">
            <div class="inv-num">05</div>
            <h4>Turso DB Multi-Tenant Isolation</h4>
            <p>Dedicated Turso (libSQL) per app. Microservices never query foreign databases.</p>
          </div>
          <div class="inv-card">
            <div class="inv-num">06</div>
            <h4>Directional Modularity</h4>
            <p>Monorepo separation: <code>apps/src/</code> (core) & <code>forge-apps/</code> (independent).</p>
          </div>
          <div class="inv-card">
            <div class="inv-num">07</div>
            <h4>Clean Package Aliases</h4>
            <p>Strict use of <code>@forge/sdk</code>, <code>@forge/ui</code>, <code>@forge/types</code> with zero sprawl.</p>
          </div>
          <div class="inv-card">
            <div class="inv-num">08</div>
            <h4>5-Tier Testing for Truth</h4>
            <p>Real network/cookie tests (unit, integration, security, contracts, e2e). Zero shallow mocks.</p>
          </div>
          <div class="inv-card">
            <div class="inv-num">09</div>
            <h4>Dynamic Ingress & Zero Auto-Commits</h4>
            <p>Ingress driven from <code>.env</code> via <code>generate-proxy.ts</code>. AI commits strictly blocked.</p>
          </div>
          <div class="inv-card">
            <div class="inv-num">10</div>
            <h4>Observability & Worklogs</h4>
            <p>Colocated logs, dual-probe health, TSDoc comments, and per-conversation worklog updates.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}
