/**
 * @forge/dev-hub - 5-Tier Testing Rigor & Quality Gate Section
 * Astryx Design Standards (2026 LTS Baseline)
  * @requirements [HLR-HUB-601] [LLR-SUB-005]
 */

export function renderTestingSection(): string {
  return `
    <section id="section-testing" class="hub-section">
      <div class="astryx-card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--forge-text-main); margin: 0 0 0.25rem 0;">
              🧪 5-Tier Testing Rigor & Quality Gate (Enterprise Standard)
            </h2>
            <span style="font-size: 0.85rem; color: var(--forge-text-muted);">
              Zero shallow mocking. 100% Branch coverage on Auth/RBAC, $\ge 90\%$ on business logic.
            </span>
          </div>
          <span class="astryx-badge badge-pill">Testing for Truth</span>
        </div>

        <!-- 5-Tier Breakdown Grid -->
        <div class="testing-tiers-grid">
          <div class="tier-card">
            <div class="tier-badge">Tier 1: Unit</div>
            <div class="tier-path"><code>test/unit/</code></div>
            <p>Pure business logic, math calculations, schema validators, AST transforms. Microsecond execution.</p>
          </div>
          <div class="tier-card">
            <div class="tier-badge">Tier 2: Integration</div>
            <div class="tier-path"><code>test/integration/</code></div>
            <p>In-memory database interactions, router dispatches, middleware chaining, and multi-module pipelines.</p>
          </div>
          <div class="tier-card">
            <div class="tier-badge">Tier 3: Security</div>
            <div class="tier-path"><code>test/security/</code></div>
            <p>ASVS 5.0 invariants, anti-brute force, token replay defense, cross-tenant isolation, and PII leak tests.</p>
          </div>
          <div class="tier-card">
            <div class="tier-badge">Tier 4: Contracts</div>
            <div class="tier-path"><code>test/contracts/</code></div>
            <p>RFC 7807 schema compliance, Ed25519 signature checks, and cross-microservice boundary interfaces.</p>
          </div>
          <div class="tier-card">
            <div class="tier-badge">Tier 5: E2E</div>
            <div class="tier-path"><code>test/e2e/</code></div>
            <p>Live HTTP socket requests, cookie persistence, browser DOM rendering, and full proxy routing.</p>
          </div>
        </div>

        <!-- 3A Pattern & Verification Commands -->
        <div style="margin-top: 2rem;">
          <h3 style="font-size: 1.1rem; color: var(--forge-text-main); margin: 0 0 0.5rem 0;">1. Mandatory 3A Pattern (Arrange, Act, Assert)</h3>
          <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 0.75rem;">
            Every test across the repository must explicitly declare the 3A sections:
          </p>

          <pre class="code-block"><code>import { describe, expect, it } from 'bun:test';
import { isManagerOf } from '@forge/sdk';

describe('Tier 3 Security: Authorization Hierarchy Boundary', () => {
  it('prevents non-managers from approving sensitive employee requests', async () => {
    // 1. Arrange
    const regularEmployeeId = 'usr-charlie-dev';
    const targetEmployeeId = 'usr-alice-eng';

    // 2. Act
    const canApprove = await isManagerOf(regularEmployeeId, targetEmployeeId);

    // 3. Assert
    expect(canApprove).toBe(false);
  });
});</code></pre>
        </div>

        <div style="margin-top: 1.5rem;">
          <h3 style="font-size: 1.1rem; color: var(--forge-text-main); margin: 0 0 0.5rem 0;">2. Automated Verification Commands</h3>
          <pre class="code-block"><code># Run full repository test gate
rtk bun test

# Run 15 pre-flight checks and invariant gate
rtk bun scripts/verify-gate.ts

# Append worklog entry after task completion
rtk bun scripts/append-worklog.ts "Enhanced Developer Hub UI"</code></pre>
        </div>
      </div>
    </section>
  `;
}
