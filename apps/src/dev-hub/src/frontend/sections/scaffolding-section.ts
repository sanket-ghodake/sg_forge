/**
 * @forge/dev-hub - Micro-App Scaffolding & Docker Boilerplates Section
 * Astryx Design Standards (2026 LTS Baseline)
  * @requirements [HLR-HUB-601] [LLR-SUB-005]
 */

export function renderScaffoldingSection(): string {
  return `
    <section id="section-scaffolding" class="hub-section">
      <div class="astryx-card" style="margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--forge-border); padding-bottom: 0.75rem; margin-bottom: 1.25rem;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--forge-text-main); margin: 0 0 0.25rem 0;">
              🐳 Micro-App Scaffolding & Multi-Language Templates
            </h2>
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
    if (!auth.authenticated) return auth.response!;

    // 2. Access verified identity
    logger.info('Handling inventory query', { user: auth.user?.email });
    return Response.json({ items: ['Server Rack', 'Optic Cable'], user: auth.user });
  })
});</code></pre>
        </div>

        <!-- Python FastAPI Snippet -->
        <div id="snippet-py" class="lang-snippet">
          <pre class="code-block"><code>from fastapi import FastAPI, Header, HTTPException
import uvicorn

app = FastAPI(title="Python Microservice")

@app.get("/items")
async def get_items(
    x_forwarded_user: str = Header(None),
    x_forwarded_user_id: str = Header(None),
    x_forwarded_role: str = Header(None)
):
    # Upstream Gateway already verified credentials and injected headers
    if not x_forwarded_user:
        raise HTTPException(status_code=401, detail="Missing Gateway Identity")

    return {
        "status": "ok",
        "user_email": x_forwarded_user,
        "user_id": x_forwarded_user_id,
        "role": x_forwarded_role,
        "data": ["TensorFlow Model A", "PyTorch Weights B"]
    }

if __name__ == "__main__": // Python entrypoint
    uvicorn.run(app, host="0.0.0.0", port=8000)</code></pre>
        </div>

        <!-- Go Fiber Snippet -->
        <div id="snippet-go" class="lang-snippet">
          <pre class="code-block"><code>package main

import (
	"github.com/gofiber/fiber/v2"
	"log"
)

func main() {
	app := fiber.New()

	app.Get("/metrics", func(c *fiber.Ctx) error {
		// Read pre-authenticated identity from Gateway
		userEmail := c.Get("X-Forwarded-User")
		userId := c.Get("X-Forwarded-User-Id")

		if userEmail == "" { // Go validation
			return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
		}

		return c.JSON(fiber.Map{
			"status":   "ok",
			"user":     userEmail,
			"user_id":  userId,
			"cpu_load": 0.42,
		})
	})

	log.Fatal(app.Listen(":9090"))
}</code></pre>
        </div>
      </div>
    </section>
  `;
}
