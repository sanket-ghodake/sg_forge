#!/usr/bin/env bun
/**
 * @file sync-submodule-docs.ts
 * @description Bridges autonomous Forge App submodule documentation into the Astro Starlight portal.
 * @standards SG Forge Living Standards, Single-Pane-of-Glass Navigation
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "..");
const FORGE_APPS_DIR = join(REPO_ROOT, "forge-apps");
const TARGET_DOCS_DIR = join(REPO_ROOT, "apps", "src", "docs", "src", "content", "docs", "submodules");
const BADGE_COMPONENT_PATH = join(REPO_ROOT, "apps", "src", "docs", "src", "components", "TraceabilityBadge.astro");

function getRelativeBadgeImport(destFilePath: string): string {
  let rel = relative(dirname(destFilePath), BADGE_COMPONENT_PATH).replace(/\\/g, "/");
  if (!rel.startsWith(".")) {
    rel = "./" + rel;
  }
  return rel;
}

function processMarkdownFile(itemSrc: string, itemDest: string, relSubPath: string, app: string): void {
  let content = readFileSync(itemSrc, "utf-8");
  const fileName = itemSrc.split(/[/\\]/).pop() || "";

  const reqMatch = fileName.match(/^(SR|HLR|LLR)-[A-Za-z0-9.-]+/);
  const reqId = reqMatch ? reqMatch[0] : null;
  const reqType = reqId ? (reqId.split("-")[0] as "SR" | "HLR" | "LLR") : null;

  // Extract or generate title
  let title = fileName.replace(/\.mdx?$/, "");
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    title = headingMatch[1].trim().replace(/"/g, '\\"');
  }

  // Ensure valid Starlight frontmatter
  if (!content.trimStart().startsWith("---")) {
    const desc = reqId ? `${reqType} requirement specification for ${app} microservice.` : `${title} specification.`;
    content = `---\ntitle: "${title}"\ndescription: "${desc}"\n---\n\n` + content;
  }

  // Inject TraceabilityBadge if this is a requirement document
  if (reqId && !content.includes("<TraceabilityBadge")) {
    const badgeImport = `import TraceabilityBadge from '${getRelativeBadgeImport(itemDest)}';\n\n`;
    const badgePill = `<div style="margin-bottom: 1.5rem;">\n  <TraceabilityBadge reqId="${reqId}" type="${reqType}" status="verified" />\n</div>\n\n`;

    // Inject after frontmatter
    const frontmatterEnd = content.indexOf("---", 3);
    if (frontmatterEnd !== -1) {
      const before = content.slice(0, frontmatterEnd + 3);
      const after = content.slice(frontmatterEnd + 3);
      content = `${before}\n\n${badgeImport}${badgePill}${after}`;
    }
  }

  writeFileSync(itemDest, content, "utf-8");
}

function generateSubmoduleApiDoc(appPath: string, destDir: string, app: string): void {
  const openApiPath = join(appPath, "docs", "api", "openapi.yaml");
  if (!existsSync(openApiPath)) return;

  const yamlContent = readFileSync(openApiPath, "utf-8");
  const lines = yamlContent.split("\n");
  const titleLine = lines.find((l) => l.startsWith("  title:"));
  const apiTitle = titleLine ? titleLine.replace("  title:", "").trim().replace(/['"]/g, "") : `${app} API`;

  const apiDocPath = join(destDir, "api-contract.mdx");
  const badgeImport = getRelativeBadgeImport(apiDocPath);
  const docContent = `---
title: "${apiTitle} Contract"
description: "OpenAPI 3.1 specification for the ${app} microservice."
---

import TraceabilityBadge from '${badgeImport}';

<div style="margin-bottom: 1.5rem; display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
  <TraceabilityBadge reqId="SR-GATE-001" type="SR" status="verified" />
  <TraceabilityBadge reqId="LLR-SUB-007" type="LLR" status="verified" />
</div>

## 1. OpenAPI 3.1 Contract Overview

The **${app}** microservice exposes an OpenAPI 3.1 contract located at \`forge-apps/${app}/docs/api/openapi.yaml\`.
Contracts are validated on pre-commit gates via Spectral rulesets.

### Standalone Interactive Explorer
To view the live, interactive API contract directly from the running microservice:
- Direct Ingress: \`http://localhost:<PORT>/docs/api\`
- Platform Route: \`/apps/${app}/docs/api\`

### Service Specification
\`\`\`yaml
${yamlContent.trim()}
\`\`\`
`;

  writeFileSync(apiDocPath, docContent, "utf-8");
}

/**
 * syncSubmoduleDocs
 * Under Strict Core-Only Separation (Option B), central docs strictly sync
 * the golden reference template (`app-template`). Autonomous micro-apps (e.g. `code`,
 * `telemetry`, or custom apps) maintain 100% isolated documentation inside their own repo
 * and serve it locally via `/apps/<app>/docs` and `/apps/<app>/docs/api`.
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export function syncSubmoduleDocs(): void {
  if (!existsSync(FORGE_APPS_DIR)) {
    console.log("ℹ️  No forge-apps directory found to sync.");
    return;
  }

  // Strict Core-Only Separation: Only the reference template is surfaced in central platform docs
  const ALLOWED_CORE_TEMPLATE = "app-template";
  const appPath = join(FORGE_APPS_DIR, ALLOWED_CORE_TEMPLATE);
  if (!existsSync(appPath) || !statSync(appPath).isDirectory()) return;

  const docsSource = join(appPath, "docs");
  if (!existsSync(docsSource)) return;

  // Clean up any non-template app directories in central docs submodules folder
  if (existsSync(TARGET_DOCS_DIR)) {
    for (const entry of readdirSync(TARGET_DOCS_DIR, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name !== ALLOWED_CORE_TEMPLATE) {
        rmSync(join(TARGET_DOCS_DIR, entry.name), { recursive: true, force: true });
      }
    }
  }

  const destDir = join(TARGET_DOCS_DIR, ALLOWED_CORE_TEMPLATE);
  if (existsSync(destDir)) {
    rmSync(destDir, { recursive: true, force: true });
  }
  mkdirSync(destDir, { recursive: true });

  // Recursively sync markdown files
  const syncDir = (src: string, dest: string) => {
    const items = readdirSync(src);
    for (const item of items) {
      const itemSrc = join(src, item);
      const itemDest = join(dest, item);
      const stat = statSync(itemSrc);

      if (stat.isDirectory()) {
        if (!existsSync(itemDest)) mkdirSync(itemDest, { recursive: true });
        syncDir(itemSrc, itemDest);
      } else if (item.endsWith(".md") || item.endsWith(".mdx")) {
        const relPath = relative(docsSource, itemSrc);
        processMarkdownFile(itemSrc, itemDest, relPath, ALLOWED_CORE_TEMPLATE);
      }
    }
  };

  syncDir(docsSource, destDir);
  generateSubmoduleApiDoc(appPath, destDir, ALLOWED_CORE_TEMPLATE);
  console.log(`📑 Synced documentation for template: forge-apps/${ALLOWED_CORE_TEMPLATE} -> apps/src/docs/src/content/docs/submodules/${ALLOWED_CORE_TEMPLATE}`);
}

if (import.meta.main) {
  syncSubmoduleDocs();
}
