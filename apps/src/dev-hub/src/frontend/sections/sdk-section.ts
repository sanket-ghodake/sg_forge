/**
 * @forge/dev-hub - Forge SDK Interactive Reference Section
 * Astryx Design Standards (2026 LTS Baseline)
  * @requirements [HLR-HUB-601] [LLR-SUB-005]
 */

export function renderSdkSection(): string {
  return `
    <section id="section-sdk" class="hub-section">
      <div class="astryx-card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.75rem; margin-bottom: 1rem;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--forge-text-main); margin: 0 0 0.25rem 0;">
              📦 Forge Foundation SDK Reference (<code>@forge/sdk</code>)
            </h2>
            <span style="font-size: 0.85rem; color: var(--forge-text-muted);">
              Universal standard library for logging, error boundaries, auth gates, hierarchy lookups, and iframe bridges.
            </span>
          </div>
          <span class="astryx-badge badge-pill">v2.0.0 LTS</span>
        </div>

        <div class="sdk-modules-container">
          <!-- Module 1: Auth Guard & Zero Trust -->
          <div class="sdk-module-card">
            <div class="sdk-mod-header">
              <div class="sdk-mod-title">
                <span class="mod-pill">Auth & RBAC</span>
                <h3><code>authGuard(req, options)</code> & <code>verifySessionToken(token)</code></h3>
              </div>
              <button class="copy-btn" onclick="copySnippet('code-auth-guard')">Copy Snippet</button>
            </div>
            <p class="sdk-mod-desc">
              Zero-Trust asymmetric Ed25519 token validation (&lt;0.1ms) with direct-jump <code>return_url</code> preservation, public path bypasses, and Astryx 403 HTML/JSON fallback.
            </p>
            <pre class="code-block"><code id="code-auth-guard">import { authGuard, verifySessionToken } from '@forge/sdk';

// In your microservice HTTP handler:
export async function handleRequest(req: Request) {
  const auth = authGuard(req, {
    appName: 'Custom Microservice',
    requiredRoles: ['roles/employee', 'roles/admin'],
    publicPaths: ['/health', '/metrics', '/api/public']
  });

  // If unauthenticated or forbidden, auth.response is an automated 302 or Astryx 403 Response
  if (!auth.authenticated) return auth.response!;

  // Access verified user context with zero database round-trips:
  const { id, email, role, orgPath } = auth.user!;
  return Response.json({ status: 'ok', user: { id, email, role } });
}</code></pre>
          </div>

          <!-- Module 2: Structured Logging & Telemetry -->
          <div class="sdk-module-card">
            <div class="sdk-mod-header">
              <div class="sdk-mod-title">
                <span class="mod-pill">Logging & SRE</span>
                <h3><code>createLogger(serviceName)</code> & <code>redactSensitiveData(data)</code></h3>
              </div>
              <button class="copy-btn" onclick="copySnippet('code-logger')">Copy Snippet</button>
            </div>
            <p class="sdk-mod-desc">
              Enterprise SRE standard structured JSON logging with immutable trace propagation, recursive PII redaction, microsecond DB query metrics, and plain-English heuristic log generation.
            </p>
            <pre class="code-block"><code id="code-logger">import { createLogger, redactSensitiveData } from '@forge/sdk';

const logger = createLogger('payment-service');

// Structured operational logging with metadata
logger.info('Processing order checkout', { orderId: 'ord-9921', amount: 49.99 });

// Automatic PII & credential redaction
const sanitized = redactSensitiveData({ password: 'secret123', token: 'eyJ...', email: 'alice@forge.internal' });

logger.debug('Sanitized payload', sanitized);

// Microsecond DB query timing with slow query detection (>100ms warning)
logger.logDbQuery('SELECT * FROM orders WHERE user_id = ?', 1.45, undefined, 'trace-abc-123');</code></pre>
          </div>

          <!-- Module 3: RFC 7807 Error Boundaries -->
          <div class="sdk-module-card">
            <div class="sdk-mod-header">
              <div class="sdk-mod-title">
                <span class="mod-pill">Error Boundaries</span>
                <h3><code>createSafeHandler(serviceName, handler)</code></h3>
              </div>
              <button class="copy-btn" onclick="copySnippet('code-safe-handler')">Copy Snippet</button>
            </div>
            <p class="sdk-mod-desc">
              RFC 7807 problem details wrapper for Bun/Node HTTP servers. Enforces <code>application/problem+json</code> with execution latency timing and <code>x-trace-id</code> header injection.
            </p>
            <pre class="code-block"><code id="code-safe-handler">import { createSafeHandler } from '@forge/sdk';

export const server = Bun.serve({
  port: 8085,
  fetch: createSafeHandler('inventory-service', async (req: Request) => {
    const url = new URL(req.url);
    if (url.pathname === '/items') {
      return Response.json([{ id: 1, name: 'Server Rack' }]);
    }
    // Unhandled exceptions are safely trapped and returned as RFC 7807 JSON without leaking internal stacks
    throw new Error('Database connection timeout');
  })
});</code></pre>
          </div>

          <!-- Module 4: Scoped Employee Hierarchy Client -->
          <div class="sdk-module-card">
            <div class="sdk-mod-header">
              <div class="sdk-mod-title">
                <span class="mod-pill">Directory & Org</span>
                <h3><code>getScopedHierarchy(id)</code> & <code>isManagerOf(mgr, emp)</code></h3>
              </div>
              <button class="copy-btn" onclick="copySnippet('code-hierarchy')">Copy Snippet</button>
            </div>
            <p class="sdk-mod-desc">
              Zero-Trust scoped hierarchy traversal. Retrieves target employee, upward chain to CEO, direct reports, and resolves manager approval authority.
            </p>
            <pre class="code-block"><code id="code-hierarchy">import { getScopedHierarchy, isManagerOf, getMyHierarchy } from '@forge/sdk';

// 1. Scoped hierarchy lookup by user ID or email
const hierarchy = await getScopedHierarchy('usr-alice-eng');
console.log('Employee:', hierarchy.employee.displayName);
console.log('Direct Manager:', hierarchy.managementChain[0]?.displayName);
console.log('Direct Reports:', hierarchy.directReports.map(r => r.displayName));

// 2. Validate multi-tier management authority (recursive upward check)
const isAuthorized = await isManagerOf('usr-carol-dir', 'usr-alice-eng');
console.log('Carol is manager of Alice:', isAuthorized); // true</code></pre>
          </div>

          <!-- Module 5: Portal Iframe Client Bridge -->
          <div class="sdk-module-card">
            <div class="sdk-mod-header">
              <div class="sdk-mod-title">
                <span class="mod-pill">Portal Iframe Bridge</span>
                <h3><code>ForgeClient.init(options)</code></h3>
              </div>
              <button class="copy-btn" onclick="copySnippet('code-client-bridge')">Copy Snippet</button>
            </div>
            <p class="sdk-mod-desc">
              Bi-directional <code>postMessage</code> handshake bridge for micro-apps embedded in the Portal. Seamlessly synchronizes active user, auth token, theme variables, and provides authenticated proxy <code>fetch()</code>.
            </p>
            <pre class="code-block"><code id="code-client-bridge">import { ForgeClient } from '@forge/sdk';

// In your micro-app frontend:
const client = await ForgeClient.init({
  onUserChange: (user) => console.log('Current user:', user.displayName),
  onThemeChange: (theme) => console.log('Theme mode:', theme),
});

// Authenticated fetch through parent portal session
const data = await client.fetch('/api/v1/projects');</code></pre>
          </div>
        </div>
      </div>
    </section>
  `;
}
