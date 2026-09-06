#!/usr/bin/env bun
/**
 * @file link-test-requirements.ts
 * @description Injects requirement tags into test files for verification traceability.
 * @standards Enterprise Architecture Standards
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "..");

const TEST_MAPPINGS: Record<string, string[]> = {
  // Auth Tests
  "apps/src/auth/test/unit/crypto.test.ts": ["LLR-AUTH-001", "LLR-AUTH-006"],
  "apps/src/auth/test/unit/session-guardrails.test.ts": ["LLR-AUTH-002"],
  "apps/src/auth/test/unit/hierarchy.test.ts": ["LLR-AUTH-003"],
  "apps/src/auth/test/security/replay-defense.test.ts": ["LLR-AUTH-004"],
  "apps/src/auth/test/security/rate-limiter.test.ts": ["LLR-AUTH-005"],
  "apps/src/auth/test/security/security-headers.test.ts": ["LLR-AUTH-007"],
  "apps/src/auth/test/security/employee-rbac.test.ts": ["HLR-AUTH-102"],
  "apps/src/auth/test/e2e/portal-auth-gate.test.ts": ["HLR-AUTH-101"],
  "apps/src/auth/test/integration/auth-flow.test.ts": ["SR-AUTH-001", "LLR-AUTH-007"],
  "apps/src/auth/test/integration/session-rotation.test.ts": ["LLR-AUTH-002", "LLR-AUTH-004"],
  "apps/src/auth/test/integration/org-api.test.ts": ["LLR-AUTH-003"],
  "apps/src/auth/test/integration/db-schema.test.ts": ["LLR-DB-003"],
  "apps/src/auth/test/unit/employee-controller.test.ts": ["LLR-DB-005"],

  // SDK Tests
  "apps/src/sdk/test/unit/registry.test.ts": ["LLR-SDK-001", "HLR-SDK-301"],
  "apps/src/sdk/test/unit/logger.test.ts": ["LLR-SDK-002", "HLR-SDK-303", "SR-LOG-001"],
  "apps/src/sdk/test/security/security-headers-defense.test.ts": ["LLR-SDK-003"],
  "apps/src/sdk/test/unit/error-handler.test.ts": ["LLR-SDK-004"],
  "apps/src/sdk/test/unit/external-ingress.test.ts": ["LLR-SDK-005"],
  "apps/src/sdk/test/unit/browser-bridge.test.ts": ["LLR-SDK-006"],
  "apps/src/sdk/test/e2e/sdk-lifecycle.test.ts": ["LLR-SDK-007"],
  "apps/src/sdk/test/unit/directory-client.test.ts": ["LLR-DB-001", "HLR-SDK-302"],
  "apps/src/sdk/test/unit/backup-engine.test.ts": ["LLR-DB-001", "LLR-DB-004"],

  // UI Tests
  "apps/src/ui/test/contracts/theme-tokens-schema.test.ts": ["LLR-UI-001"],
  "apps/src/ui/test/unit/tooltip-collision.test.ts": ["LLR-UI-002", "HLR-UI-402"],
  "apps/src/ui/test/unit/toast-dropdown.test.ts": ["LLR-UI-003", "LLR-UI-004"],
  "apps/src/ui/test/unit/header-tokens.test.ts": ["LLR-UI-005"],
  "apps/src/ui/test/unit/browser-state.test.ts": ["LLR-UI-006", "HLR-UI-403"],
  "apps/src/ui/test/integration/state-sync.test.ts": ["LLR-UI-007"],
  "apps/src/ui/test/unit/error-page.test.ts": ["LLR-UI-008"],
  "apps/src/ui/test/e2e/ui-bundle-integrity.test.ts": ["HLR-UI-401", "SR-UI-001"],

  // Portal Tests
  "apps/src/portal/test/integration/portal-api-endpoints.test.ts": ["HLR-PORTAL-201"],
  "apps/src/portal/test/security/portal-rbac-security.test.ts": ["HLR-PORTAL-202", "LLR-SUB-006"],

  // Dev Dashboard Tests
  "apps/src/dev-dashboard/test/unit/vitals-engine.test.ts": ["HLR-DEV-501"],
  "apps/src/dev-dashboard/test/unit/db-diagnostics.test.ts": ["LLR-DB-006"],

  // Dev Hub Tests
  "apps/src/dev-hub/test/integration/hub-routes.test.ts": ["HLR-HUB-601", "SR-DOC-001"],

  // Submodules & Scripts Tests
  "forge-apps/code/test/security/git-sanitizer.test.ts": ["LLR-SUB-003"],
  "forge-apps/code/test/unit/lock-coordinator.test.ts": ["LLR-SUB-001", "HLR-CODE-001", "LLR-CODE-001.1"],
  "forge-apps/code/test/integration/code-server.test.ts": ["LLR-SUB-005", "HLR-CODE-002", "LLR-CODE-001.2", "LLR-CODE-002.1"],
  "forge-apps/code/test/contracts/health-schema.test.ts": ["HLR-CODE-003"],
  "forge-apps/code/test/e2e/server.test.ts": ["HLR-CODE-701"],
  "forge-apps/telemetry/test/unit/telemetry.test.ts": ["HLR-TEL-001", "LLR-TEL-001.1"],
  "forge-apps/telemetry/test/integration/db-isolation.test.ts": ["LLR-DB-002", "SR-TURSO-001", "HLR-TEL-002", "LLR-TEL-001.2"],
  "forge-apps/telemetry/test/contracts/problem-json.test.ts": ["HLR-TEL-003", "LLR-TEL-002.1"],
  "forge-apps/telemetry/test/e2e/telemetry-server.test.ts": ["HLR-TEL-801", "LLR-SUB-004"],
  "forge-apps/app-template/test/contracts/health-schema.test.ts": ["LLR-SUB-002"],
  "scripts/test/create-app.test.ts": ["SR-SUB-001", "LLR-SUB-001"],
  "scripts/test/run-sh.test.ts": ["SR-GATE-001", "LLR-SUB-007"],
  "apps/test/security/air-gap-compliance.test.ts": ["SR-SEC-001", "HLR-NET-001", "HLR-NET-002"],
};

/**
 * linkTestRequirements
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export function linkTestRequirements(): void {
  let modifiedCount = 0;

  for (const [testRelPath, reqs] of Object.entries(TEST_MAPPINGS)) {
    const fullPath = resolve(REPO_ROOT, testRelPath);
    try {
      let content = readFileSync(fullPath, "utf-8");
      const tagsToInject = reqs.filter((r) => !content.includes(`[${r}]`));

      if (tagsToInject.length === 0) continue;

      const tagString = tagsToInject.map((t) => `[${t}]`).join(" ");

      // If there is already a top describe block, inject into the description
      if (content.includes("describe(")) {
        content = content.replace(/(describe\s*\(\s*['"`])([^'"`]+)(['"`])/, `$1$2 ${tagString}$3`);
      } else {
        content = `// Verification: ${tagString}\n` + content;
      }

      writeFileSync(fullPath, content, "utf-8");
      modifiedCount++;
      console.log(`✅ Linked ${tagsToInject.length} reqs to test: ${testRelPath}`);
    } catch (err) {
      console.warn(`⚠️ Could not update ${testRelPath}:`, err);
    }
  }

  console.log(`\n🎉 Successfully linked test requirements across ${modifiedCount} test files.`);
}

if (import.meta.main) {
  linkTestRequirements();
}
