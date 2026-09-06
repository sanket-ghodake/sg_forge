#!/usr/bin/env bun
/**
 * @file sync-submodule-docs.ts
 * @description Bridges autonomous Forge App submodule documentation into the Astro Starlight portal.
 * @standards SG Forge Living Standards, Single-Pane-of-Glass Navigation
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "..");
const FORGE_APPS_DIR = join(REPO_ROOT, "forge-apps");
const TARGET_DOCS_DIR = join(REPO_ROOT, "apps", "src", "docs", "src", "content", "docs", "submodules");

/**
 * syncSubmoduleDocs
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export function syncSubmoduleDocs(): void {
  if (!existsSync(FORGE_APPS_DIR)) {
    console.log("ℹ️  No forge-apps directory found to sync.");
    return;
  }

  const appDirs = readdirSync(FORGE_APPS_DIR);
  for (const app of appDirs) {
    const appPath = join(FORGE_APPS_DIR, app);
    if (!statSync(appPath).isDirectory()) continue;

    const docsSource = join(appPath, "docs");
    if (!existsSync(docsSource)) continue;

    const destDir = join(TARGET_DOCS_DIR, app);
    if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

    // Sync markdown files from submodule docs
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
          const { readFileSync, writeFileSync } = require("node:fs");
          let content = readFileSync(itemSrc, "utf-8");
          if (!content.trimStart().startsWith("---")) {
            const match = content.match(/^#\s+(.+)$/m);
            const title = match ? match[1].trim().replace(/"/g, '\\"') : item.replace(/\.mdx?$/, "");
            content = `---\ntitle: "${title}"\n---\n\n` + content;
          }
          writeFileSync(itemDest, content, "utf-8");
        }
      }
    };

    syncDir(docsSource, destDir);
    console.log(`📑 Synced documentation for submodule: forge-apps/${app} -> apps/src/docs/src/content/docs/submodules/${app}`);
  }
}

if (import.meta.main) {
  syncSubmoduleDocs();
}
