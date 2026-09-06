/**
 * @forge/dev-hub - Interactive API Sandbox & Polyglot Request Builder
 * Astryx Design Standards (2026 LTS Baseline)
 */

import { loadBrandConfig } from '@forge/sdk';

/**
 * renderSandboxSection
 * @requirements [HLR-HUB-601] [LLR-SUB-005]
 */
export function renderSandboxSection(): string {
  const brand = loadBrandConfig();
  return `
    <section id="section-sandbox" class="hub-section">
      <div class="astryx-card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--forge-text-main); margin: 0 0 0.25rem 0;">
              ⚡ Interactive Live API Sandbox & Polyglot Request Builder
            </h2>
            <span style="font-size: 0.85rem; color: var(--forge-text-muted);">
              Dispatch live requests to ${brand.name} Gateway endpoints or generate instant code in multiple languages.
            </span>
          </div>
          <span class="astryx-badge badge-online">Live Network Client</span>
        </div>

        <!-- Sandbox Form Controls -->
        <div class="sandbox-controls-box">
          <div class="sandbox-field-group">
            <label class="sandbox-label">Preset Endpoint</label>
            <div class="astryx-select-wrapper">
              <select id="sandbox-endpoint-select" class="astryx-select" onchange="onEndpointSelectChange()">
                <option value="/health">GET /health (Dev Hub Gateway Health)</option>
                <option value="/auth/health">GET /auth/health (Auth Gateway Health)</option>
                <option value="/portal/health">GET /portal/health (Workspace Portal Health)</option>
                <option value="/auth/api/v1/auth/hierarchy/usr-alice-eng">GET /auth/api/v1/auth/hierarchy/usr-alice-eng (Scoped Hierarchy: Alice)</option>
                <option value="/auth/api/v1/auth/hierarchy/usr-bob-lead">GET /auth/api/v1/auth/hierarchy/usr-bob-lead (Scoped Hierarchy: Bob)</option>
                <option value="/auth/api/v1/auth/hierarchy/me">GET /auth/api/v1/auth/hierarchy/me (Calling User Session)</option>
                <option value="custom">-- Custom Path --</option>
              </select>
            </div>
          </div>

          <div class="sandbox-url-row">
            <span class="method-tag">GET</span>
            <input type="text" id="sandbox-url-input" class="astryx-input" value="/health" placeholder="/api/v1/..." oninput="updatePolyglotSnippets()" />
            <button id="sandbox-submit-btn" class="astryx-btn btn-primary" onclick="runSandboxRequest()">
              <span>Send Request</span>
            </button>
          </div>
        </div>

        <!-- Response View Window -->
        <div class="sandbox-response-container" style="margin-bottom: 1.5rem;">
          <div class="response-header-bar">
            <div style="display: flex; gap: 0.75rem; align-items: center;">
              <span id="sandbox-status-badge" class="status-pill status-ready">READY</span>
              <span id="sandbox-latency-label" style="font-size: 0.78rem; color: var(--forge-text-muted);">0 ms</span>
            </div>
            <button class="copy-btn" onclick="copySnippet('sandbox-response-body')">Copy Response</button>
          </div>
          <pre class="code-block response-body"><code id="sandbox-response-body">{
  "info": "Click 'Send Request' to execute a live query against the ${brand.name} Gateway."
}</code></pre>
        </div>

        <!-- Polyglot Code Generator -->
        <h3 style="font-size: 1.1rem; color: var(--forge-text-main); margin: 1.5rem 0 0.5rem 0;">
          💻 Ready-to-Run Request Code Generator
        </h3>
        <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 0.75rem;">
          Auto-generated code for the active endpoint with cookies & headers:
        </p>

        <div class="lang-switcher">
          <button class="lang-tab active" onclick="switchSandboxLang('curl')">cURL</button>
          <button class="lang-tab" onclick="switchSandboxLang('ts')">TypeScript (fetch)</button>
          <button class="lang-tab" onclick="switchSandboxLang('py')">Python (requests)</button>
          <button class="lang-tab" onclick="switchSandboxLang('go')">Go (net/http)</button>
        </div>

        <div id="sandbox-code-curl" class="sandbox-snippet active">
          <pre class="code-block"><code id="code-curl-snippet">curl -X GET "http://localhost/health" \\
  -H "Accept: application/json" \\
  -H "Cookie: sg_forge_session=your_token_here"</code></pre>
        </div>
        <div id="sandbox-code-ts" class="sandbox-snippet" style="display: none;">
          <pre class="code-block"><code id="code-ts-snippet">const res = await fetch('http://localhost/health', {
  headers: { 'Accept': 'application/json' },
  credentials: 'include'
});
const data = await res.json();
console.log(data);</code></pre>
        </div>
        <div id="sandbox-code-py" class="sandbox-snippet" style="display: none;">
          <pre class="code-block"><code id="code-py-snippet">import requests

url = "http://localhost/health"
cookies = {"sg_forge_session": "your_token_here"}
resp = requests.get(url, cookies=cookies)
print(resp.json())</code></pre>
        </div>
        <div id="sandbox-code-go" class="sandbox-snippet" style="display: none;">
          <pre class="code-block"><code id="code-go-snippet">req, _ := http.NewRequest("GET", "http://localhost/health", nil)
req.AddCookie(&http.Cookie{Name: "sg_forge_session", Value: "your_token_here"})
resp, err := http.DefaultClient.Do(req)</code></pre>
        </div>

        <!-- Section 2: Header Simulator -->
        <div style="margin-top: 2rem; border-top: 1px solid var(--forge-border); padding-top: 1.5rem;">
          <h3 style="font-size: 1.1rem; color: var(--forge-text-main); margin: 0 0 0.5rem 0;">
            🔍 Injected Header Simulator
          </h3>
          <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 1rem;">
            Test how your microservice parses Gateway identity headers for a given simulated role:
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
            <div>
              <label class="sandbox-label">User Email</label>
              <input type="text" id="sim-user" class="astryx-input" value="alice.eng@${brand.domain || 'forge.internal'}" oninput="updateHeaderSimulation()" />
            </div>
            <div>
              <label class="sandbox-label">User ID</label>
              <input type="text" id="sim-user-id" class="astryx-input" value="usr-alice-eng" oninput="updateHeaderSimulation()" />
            </div>
            <div>
              <label class="sandbox-label">Role</label>
              <input type="text" id="sim-role" class="astryx-input" value="roles/employee" oninput="updateHeaderSimulation()" />
            </div>
            <div>
              <label class="sandbox-label">Org Path</label>
              <input type="text" id="sim-org" class="astryx-input" value="/root/tech/eng-core" oninput="updateHeaderSimulation()" />
            </div>
          </div>

          <pre class="code-block"><code id="simulated-headers-preview">X-Forwarded-User: alice.eng@${brand.domain || 'forge.internal'}
X-Forwarded-User-Id: usr-alice-eng
X-Forwarded-Role: roles/employee
X-Forwarded-Org-Path: /root/tech/eng-core
X-Trace-Id: tr-live-simulation-77</code></pre>
        </div>
      </div>
    </section>
  `;
}
