/**
 * @forge/dev-hub - Micro-App Scaffolding & Docker Boilerplates Section
 * Astryx Design Standards & Vector Icon Standards (2026 LTS Baseline)
 * @requirements [HLR-HUB-601] [LLR-SUB-005]
 */

import { astryxIcons } from '@forge/ui';

export function renderScaffoldingSection(): string {
  return `
    <section id="section-scaffolding" class="hub-section">
      <div class="astryx-card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span style="color: var(--forge-primary); display: flex;">${astryxIcons.layers}</span>
              <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--forge-text-main); margin: 0;">
                Micro-App Scaffolding & Multi-Language Templates
              </h2>
            </div>
            <span style="font-size: 0.85rem; color: var(--forge-text-muted);">
              Instant 1-command service generation with full Turso DB isolation, 5-tier tests, and Docker readiness.
            </span>
          </div>
          <span class="astryx-badge badge-pill">1-Command CLI</span>
        </div>

        <!-- 1-Command App Generation -->
        <h3 style="font-size: 1.1rem; color: var(--forge-text-main); margin: 0 0 0.5rem 0;">1. Create an Isolated Microservice</h3>
        <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 0.75rem;">
          Generate a standalone Forge micro-app under <code>forge-apps/&lt;name&gt;</code> with dedicated Turso database, SDK logging, and 5-tier test suites:
        </p>

        <pre class="code-block"><code># Generate a new micro-app
./run.sh create-app inventory-tracker

# Start the dev cluster
./run.sh dev</code></pre>

        <!-- Multi-Language Boilerplate Tabs -->
        <h3 style="font-size: 1.1rem; color: var(--forge-text-main); margin: 1.5rem 0 0.5rem 0;">2. Upstream Microservice Boilerplates</h3>
        <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 1rem;">
          Read injected Gateway identity headers in your preferred backend language:
        </p>

        <!-- Language Code Switcher -->
        <div class="lang-switcher">
          <button class="lang-tab active" onclick="switchLang('ts')">TypeScript (Bun / Node)</button>
          <button class="lang-tab" onclick="switchLang('py')">Python (FastAPI)</button>
          <button class="lang-tab" onclick="switchLang('go')">Go (Fiber)</button>
        </div>

        <!-- TypeScript Snippet -->
        <div id="snippet-ts" class="lang-snippet active">
          <pre class="code-block"><code>import { authGuard, createLogger, createSafeHandler } from '@forge/sdk';

const logger = createLogger('inventory-service');

export const server = Bun.serve({
  port: 8088,
  fetch: createSafeHandler('inventory-service', async (req: Request) => {
    // 1. Zero-Trust Gateway Auth & Role Check
    const auth = authGuard(req, {
      appName: 'Inventory Service',
      requiredRoles: ['roles/employee']
    });
    if (!auth.authorized) return auth.response;

    logger.info('Handling inventory request', { user: auth.user });
    return Response.json({ status: 'ok', items: [] });
  })
});</code></pre>
        </div>

        <!-- Python FastAPI Snippet -->
        <div id="snippet-py" class="lang-snippet">
          <pre class="code-block"><code>from fastapi import FastAPI, Header, HTTPException

app = FastAPI(title="Inventory Microservice")

@app.get("/items")
async def get_items(
    x_forwarded_user: str = Header(...),
    x_forwarded_role: str = Header(...),
    x_trace_id: str = Header(None)
):
    if "roles/employee" not in x_forwarded_role:
        raise HTTPException(status_code=403, detail="Forbidden: Employee role required")

    return {
        "status": "ok",
        "actor": x_forwarded_user,
        "trace": x_trace_id,
        "items": ["SKU-001", "SKU-002"]
    }</code></pre>
        </div>

        <!-- Go Fiber Snippet -->
        <div id="snippet-go" class="lang-snippet">
          <pre class="code-block"><code>package main

import (
    "github.com/gofiber/fiber/v2"
)

func main() {
    app := fiber.New()

    app.Get("/items", func(c *fiber.Ctx) error {
        user := c.Get("X-Forwarded-User")
        role := c.Get("X-Forwarded-Role")

        if role != "roles/employee" {
            return c.Status(403).JSON(fiber.Map{"error": "Forbidden: Employee role required"})
        }

        return c.JSON(fiber.Map{
            "status": "ok",
            "actor":  user,
            "items":  []string{"SKU-001", "SKU-002"},
        })
    })

    app.Listen(":8088")
}</code></pre>
        </div>

        <!-- Section 3: 5-Tier Testing Rigor & Quality Gate -->
        <div style="margin-top: 2.5rem; border-top: 1px solid var(--forge-border); padding-top: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="color: var(--forge-primary); display: flex;">${astryxIcons.check}</span>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--forge-text-main); margin: 0;">
                5-Tier Testing Rigor & Quality Gate (Enterprise Standard)
              </h3>
            </div>
            <span class="astryx-badge badge-pill">Testing for Truth</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--forge-text-muted); margin-bottom: 1rem;">
            Every generated micro-app must maintain isolated <code>test/</code> subtiers with zero shallow mocking:
          </p>

          <div class="testing-tiers-grid" style="margin-bottom: 1.5rem;">
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
          <h4 style="font-size: 0.95rem; font-weight: 600; color: var(--forge-text-main); margin: 0 0 0.5rem 0;">Mandatory 3A Pattern (Arrange, Act, Assert)</h4>
          <pre class="code-block" style="margin-bottom: 1rem;"><code>import { describe, expect, it } from 'bun:test';
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

          <h4 style="font-size: 0.95rem; font-weight: 600; color: var(--forge-text-main); margin: 0 0 0.5rem 0;">Automated Verification Commands</h4>
          <pre class="code-block"><code># Run full test gate across microservices
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
