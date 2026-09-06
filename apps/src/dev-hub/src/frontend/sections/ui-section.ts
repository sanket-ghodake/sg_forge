/**
 * @forge/dev-hub - Astryx UI System & Design Tokens Section
 * Astryx Design Standards (2026 LTS Baseline)
  * @requirements [HLR-HUB-601] [LLR-SUB-005]
 */

export function renderUiSection(): string {
  return `
    <section id="section-ui" class="hub-section">
      <div class="astryx-card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--forge-text-main); margin: 0 0 0.25rem 0;">
              🎨 Astryx Design System (<code>@forge/ui</code>)
            </h2>
            <span style="font-size: 0.85rem; color: var(--forge-text-muted);">
              Enterprise dark-mode aesthetic with glassmorphic cards, custom scrollbars, toast notifications, and zero browser defaults.
            </span>
          </div>
          <span class="astryx-badge badge-pill">CSS Custom Properties</span>
        </div>

        <!-- Token Reference Grid -->
        <h3 style="font-size: 1.1rem; color: var(--forge-text-main); margin: 0 0 0.75rem 0;">1. Design System CSS Tokens</h3>
        <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 1rem;">
          All microservices and portal apps MUST strictly use <code>--forge-*</code> CSS variables. Ad-hoc hardcoded colors are strictly forbidden by pre-commit rules.
        </p>

        <div class="tokens-table-wrap">
          <table class="astryx-table">
            <thead>
              <tr>
                <th>Variable Name</th>
                <th>Preview</th>
                <th>Theme Token Role</th>
                <th>Usage Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>--forge-bg-root</code></td>
                <td><span class="color-chip" style="background: var(--forge-bg-root);"></span></td>
                <td><code>Root Canvas</code></td>
                <td>Root background for full document canvas</td>
              </tr>
              <tr>
                <td><code>--forge-bg-surface</code></td>
                <td><span class="color-chip" style="background: var(--forge-bg-surface);"></span></td>
                <td><code>Surface</code></td>
                <td>Secondary containers, code blocks, sidebars</td>
              </tr>
              <tr>
                <td><code>--forge-bg-card</code></td>
                <td><span class="color-chip" style="background: var(--forge-bg-card);"></span></td>
                <td><code>Glass Card</code></td>
                <td>Glassmorphic cards with backdrop blur</td>
              </tr>
              <tr>
                <td><code>--forge-border</code></td>
                <td><span class="color-chip" style="background: var(--forge-border);"></span></td>
                <td><code>Subtle Border</code></td>
                <td>Subtle dividers, input borders, card borders</td>
              </tr>
              <tr>
                <td><code>--forge-primary</code></td>
                <td><span class="color-chip" style="background: var(--forge-primary);"></span></td>
                <td><code>Emerald Primary</code></td>
                <td>Astryx Emerald: primary buttons, success state</td>
              </tr>
              <tr>
                <td><code>--forge-accent</code></td>
                <td><span class="color-chip" style="background: var(--forge-accent);"></span></td>
                <td><code>Sapphire Accent</code></td>
                <td>Sapphire Blue: links, info badges, focus rings</td>
              </tr>
              <tr>
                <td><code>--forge-warning</code></td>
                <td><span class="color-chip" style="background: var(--forge-warning);"></span></td>
                <td><code>Amber Warning</code></td>
                <td>Amber: warning badges, slow query indicators</td>
              </tr>
              <tr>
                <td><code>--forge-danger</code></td>
                <td><span class="color-chip" style="background: var(--forge-danger);"></span></td>
                <td><code>Crimson Error</code></td>
                <td>Crimson: errors, deletions, critical alerts</td>
              </tr>
              <tr>
                <td><code>--forge-text-main</code></td>
                <td><span class="color-chip" style="background: var(--forge-text-main);"></span></td>
                <td><code>Primary Text</code></td>
                <td>High-contrast primary typography</td>
              </tr>
              <tr>
                <td><code>--forge-text-muted</code></td>
                <td><span class="color-chip" style="background: var(--forge-text-muted);"></span></td>
                <td><code>Muted Text</code></td>
                <td>Secondary labels, captions, metadata</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Zero Defaults Policy -->
        <div style="margin-top: 2rem;">
          <h3 style="font-size: 1.1rem; color: var(--forge-text-main); margin: 0 0 0.5rem 0;">2. Zero Browser Defaults Policy & Viewport Containment</h3>
          <div class="zero-defaults-grid">
            <div class="zero-card">
              <div class="zero-icon">📜</div>
              <h4>Slim Scrollbars</h4>
              <p>OS-native thick scrollbars are blocked. Must use <code>::-webkit-scrollbar</code> with <code>--forge-border</code> thumb.</p>
            </div>
            <div class="zero-card">
              <div class="zero-icon">🍞</div>
              <h4>Astryx Toasts</h4>
              <p>OS/browser dialog popups are forbidden. Must use Astryx Toast overlays with progress bars and pause on hover.</p>
            </div>
            <div class="zero-card">
              <div class="zero-icon">🔽</div>
              <h4>Smart Glass Dropdowns</h4>
              <p>Unstyled selects replaced with custom Astryx glass dropdowns featuring smart collision detection (auto-flip/shift).</p>
            </div>
            <div class="zero-card">
              <div class="zero-icon">🪟</div>
              <h4>Backdrop Modals & Drawers</h4>
              <p>All dialogs render with z-index 3000, glass backdrop filter, and smooth scale transitions.</p>
            </div>
          </div>
        </div>

        <!-- Interactive Component Showcase -->
        <div style="margin-top: 2rem;">
          <h3 style="font-size: 1.1rem; color: var(--forge-text-main); margin: 0 0 0.5rem 0;">3. Interactive Component Playground</h3>
          <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 0.85rem;">
            Test the live Astryx Toast notifications and select controls directly in this playground:
          </p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem;">
            <button class="astryx-btn btn-primary" onclick="if(window.astryxToast) window.astryxToast('Service deployed successfully (200 OK)', 'success');">✅ Trigger Success Toast</button>
            <button class="astryx-btn btn-outline" style="border-color: var(--forge-accent); color: var(--forge-accent);" onclick="if(window.astryxToast) window.astryxToast('Rate limit threshold reached (429)', 'error');">❌ Trigger Error Toast</button>
            <button class="astryx-btn btn-outline" style="border-color: var(--forge-warning); color: var(--forge-warning);" onclick="if(window.astryxToast) window.astryxToast('Slow query latency detected (>50ms)', 'warning');">⚠️ Trigger Warning Toast</button>
            <button class="astryx-btn btn-outline" onclick="if(window.astryxToast) window.astryxToast('Database checkpoint created', 'info');">ℹ️ Trigger Info Toast</button>
          </div>
        </div>

        <!-- UI Component Code Examples -->
        <div style="margin-top: 1rem;">
          <h3 style="font-size: 1.1rem; color: var(--forge-text-main); margin: 0 0 0.5rem 0;">4. Component & Layout Wrappers</h3>
          <pre class="code-block"><code>import { getAstryxHeaderHtml, getAstryxStyles, getAstryxToastScript, renderAstryxErrorPage } from '@forge/ui';

// In server-rendered HTML view:
export function renderPage() {
  return \`&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
  &lt;style&gt;\${getAstryxStyles()}&lt;/style&gt;
&lt;/head&gt;
&lt;body&gt;
  \${getAstryxHeaderHtml('MY_APP', 'MICROSERVICE TITLE')}
  &lt;main class="astryx-container"&gt;
    &lt;div class="astryx-card"&gt;
      &lt;h2&gt;Content Card&lt;/h2&gt;
      &lt;button class="astryx-btn btn-primary" onclick="window.astryxToast('Saved successfully', 'success')"&gt;Action&lt;/button&gt;
    &lt;/div&gt;
  &lt;/main&gt;
  &lt;script&gt;\${getAstryxToastScript()}&lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;\`;
}</code></pre>
        </div>
      </div>
    </section>
  `;
}
