/**
 * @forge/dev-hub - Test Token Mint & JWT Inspector Section
 * Astryx Design Standards (2026 LTS Baseline)
  * @requirements [HLR-AUTH-101] [LLR-AUTH-001]
 */

export function renderTokenMintSection(): string {
  return `
    <section id="section-tokens" class="hub-section">
      <div class="astryx-card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--forge-text-main); margin: 0 0 0.25rem 0;">
              🔑 Test Token Mint & JWT Inspector (ASVS 5.0 / Ed25519)
            </h2>
            <span style="font-size: 0.85rem; color: var(--forge-text-muted);">
              Instant 1-click session token minting for local development and real-time cryptographic claim inspection.
            </span>
          </div>
          <span class="astryx-badge badge-pill">Ed25519 Signed</span>
        </div>

        <!-- 1-Click Minting Presets -->
        <h3 style="font-size: 1.1rem; color: var(--forge-text-main); margin: 0 0 0.5rem 0;">1. Mint Test Session Token</h3>
        <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 1rem;">
          Select a role to generate a signed session token. You can copy the cookie or paste it in API clients / cURL:
        </p>

        <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 1.25rem;">
          <button class="astryx-btn btn-primary" onclick="mintTestToken('admin')">👑 Mint Admin Token</button>
          <button class="astryx-btn btn-outline" onclick="mintTestToken('lead')">💼 Mint Tech Lead Token</button>
          <button class="astryx-btn btn-outline" onclick="mintTestToken('employee')">💻 Mint Engineer Token</button>
          <button class="astryx-btn btn-outline" onclick="mintTestToken('contractor')">🤝 Mint Contractor Token</button>
        </div>

        <!-- Generated Token Output Box -->
        <div class="sandbox-controls-box" style="margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <label class="sandbox-label">Active Test Token (JWT / Base64URL)</label>
            <div style="display: flex; gap: 0.5rem;">
              <button class="copy-btn" onclick="copySnippet('active-jwt-token')">Copy Token</button>
              <button class="copy-btn" onclick="copyCookieHeader()">Copy Cookie Header</button>
            </div>
          </div>
          <textarea id="active-jwt-token" class="astryx-input" style="width: 100%; height: 75px; font-family: monospace; font-size: 0.8rem;" placeholder="Click a mint button above or paste any token here..." oninput="inspectActiveToken()"></textarea>
        </div>

        <!-- Token Inspector / Decoded Claims -->
        <h3 style="font-size: 1.1rem; color: var(--forge-text-main); margin: 1.5rem 0 0.5rem 0;">2. Decoded Claims & Signature Verification</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
          <div>
            <label class="sandbox-label">JWT Header</label>
            <pre class="code-block" style="margin-top: 0.35rem;"><code id="jwt-decoded-header">{
  "alg": "EdDSA",
  "typ": "JWT",
  "kid": "key-2026-prod-01"
}</code></pre>
          </div>
          <div>
            <label class="sandbox-label">JWT Payload Claims</label>
            <pre class="code-block" style="margin-top: 0.35rem;"><code id="jwt-decoded-payload">{
  "sub": "usr-alice-eng",
  "email": "alice.eng@forge.internal",
  "display_name": "Alice Smith",
  "roles": ["roles/employee"],
  "org_id": "org-forge-core",
  "iat": 1788240000,
  "exp": 1788326400
}</code></pre>
          </div>
        </div>
      </div>
    </section>
  `;
}
