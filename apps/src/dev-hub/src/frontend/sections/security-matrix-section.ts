/**
 * @forge/dev-hub - RFC 7807 Problem Matrix & Security Standards Section
 * Astryx Design Standards (2026 LTS Baseline)
  * @requirements [HLR-HUB-601] [LLR-SUB-005]
 */

export function renderSecurityMatrixSection(): string {
  return `
    <section id="section-security" class="hub-section">
      <div class="astryx-card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--forge-text-main); margin: 0 0 0.25rem 0;">
              🛡️ RFC 7807 Problem Matrix & ASVS 5.0 Security Invariants
            </h2>
            <span style="font-size: 0.85rem; color: var(--forge-text-muted);">
              Standard problem details (application/problem+json) and cryptographic defense boundaries.
            </span>
          </div>
          <span class="astryx-badge badge-pill">RFC 7807 Standard</span>
        </div>

        <!-- Section 1: Standard Problem Response Shapes -->
        <h3 style="font-size: 1.1rem; color: var(--forge-text-main); margin: 0 0 0.5rem 0;">1. Enterprise RFC 7807 Error Catalog</h3>
        <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 1rem;">
          All microservices wrapped in <code>createSafeHandler</code> from <code>@forge/sdk</code> return uniform machine-readable JSON errors:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
          <div class="astryx-card" style="background: var(--forge-bg-surface); padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <strong>401 Unauthorized</strong>
              <span class="status-pill status-error">401</span>
            </div>
            <pre class="code-block" style="margin: 0; font-size: 0.75rem;"><code>{
  "type": "https://forge.internal/errors/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Session cookie is missing or invalid.",
  "traceId": "tr-4a8b1c90"
}</code></pre>
          </div>

          <div class="astryx-card" style="background: var(--forge-bg-surface); padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <strong>403 Forbidden</strong>
              <span class="status-pill status-error">403</span>
            </div>
            <pre class="code-block" style="margin: 0; font-size: 0.75rem;"><code>{
  "type": "https://forge.internal/errors/forbidden",
  "title": "Forbidden",
  "status": 403,
  "detail": "Account lacks required role clearance.",
  "traceId": "tr-6f12e87a"
}</code></pre>
          </div>

          <div class="astryx-card" style="background: var(--forge-bg-surface); padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <strong>429 Rate Limited</strong>
              <span class="status-pill status-loading">429</span>
            </div>
            <pre class="code-block" style="margin: 0; font-size: 0.75rem;"><code>{
  "type": "https://forge.internal/errors/rate-limited",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "Rate limit exceeded. Retry after 60s.",
  "traceId": "tr-91ca34d2"
}</code></pre>
          </div>

          <div class="astryx-card" style="background: var(--forge-bg-surface); padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <strong>502 Bad Gateway</strong>
              <span class="status-pill status-error">502</span>
            </div>
            <pre class="code-block" style="margin: 0; font-size: 0.75rem;"><code>{
  "type": "https://forge.internal/errors/bad-gateway",
  "title": "Bad Gateway",
  "status": 502,
  "detail": "Upstream microservice unreachable.",
  "traceId": "tr-3e78f0b1"
}</code></pre>
          </div>
        </div>

        <!-- Section 2: Rate Limiting Headers -->
        <h3 style="font-size: 1.1rem; color: var(--forge-text-main); margin: 1.5rem 0 0.5rem 0;">2. Rate Limiting Headers Spec</h3>
        <pre class="code-block"><code>RateLimit-Limit: 120
RateLimit-Remaining: 118
RateLimit-Reset: 58
Retry-After: 60</code></pre>
      </div>
    </section>
  `;
}
