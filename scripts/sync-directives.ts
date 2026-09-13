#!/usr/bin/env bun
/**
 * @forge/scripts/sync-directives - Multi-Agent Directive Synchronization Engine (2026 LTS)
 * Ensures 100% hash parity across all AI agent configuration targets (AGENTS.md, CLAUDE.md,
 * GEMINI.md, .cursorrules, .agents/AGENTS.md, .cursor/rules/AGENTS.md, and .github/copilot-instructions.md)
 * across the root monorepo and all autonomous Forge App submodules.
 *
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */

import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const REPO_ROOT = process.cwd();
const FORGE_APPS_DIR = join(REPO_ROOT, 'forge-apps');

export const DIRECTIVE_TARGETS = [
  'CLAUDE.md',
  'GEMINI.md',
  '.cursorrules',
  join('.agents', 'AGENTS.md'),
  join('.cursor', 'rules', 'AGENTS.md'),
  join('.github', 'copilot-instructions.md'),
];

export interface SyncResult {
  location: string;
  updated: string[];
  inSync: string[];
  missingMaster: boolean;
}

/**
 * syncDirectoryDirectives
 * Synchronizes derivative AI instruction files from AGENTS.md within a specific directory.
 */
export function syncDirectoryDirectives(dir: string, checkOnly = false): SyncResult {
  const masterPath = join(dir, 'AGENTS.md');
  const relLocation = relative(REPO_ROOT, dir) || '.';

  if (!existsSync(masterPath)) {
    return { location: relLocation, updated: [], inSync: [], missingMaster: true };
  }

  const masterContent = readFileSync(masterPath, 'utf8');
  const updated: string[] = [];
  const inSync: string[] = [];

  for (const target of DIRECTIVE_TARGETS) {
    const destPath = join(dir, target);
    const targetDir = join(dir, target.includes('/') ? target.slice(0, target.lastIndexOf('/')) : '');

    const needsUpdate = !existsSync(destPath) || readFileSync(destPath, 'utf8') !== masterContent;

    if (needsUpdate) {
      if (!checkOnly) {
        if (targetDir && !existsSync(targetDir)) {
          mkdirSync(targetDir, { recursive: true });
        }
        writeFileSync(destPath, masterContent, 'utf8');
      }
      updated.push(target);
    } else {
      inSync.push(target);
    }
  }

  return { location: relLocation, updated, inSync, missingMaster: false };
}

/**
 * syncAllDirectives
 * Traverses root monorepo and all discovered Forge Apps to ensure 100% directive parity.
 */
export function syncAllDirectives(checkOnly = false): { results: SyncResult[]; hasChanges: boolean } {
  const results: SyncResult[] = [];

  // 1. Sync Monorepo Root
  results.push(syncDirectoryDirectives(REPO_ROOT, checkOnly));

  // 2. Discover and Sync Submodules
  if (existsSync(FORGE_APPS_DIR)) {
    const entries = readdirSync(FORGE_APPS_DIR);
    for (const entry of entries) {
      const appPath = join(FORGE_APPS_DIR, entry);
      if (statSync(appPath).isDirectory() && existsSync(join(appPath, 'AGENTS.md'))) {
        results.push(syncDirectoryDirectives(appPath, checkOnly));
      }
    }
  }

  const hasChanges = results.some((r) => r.updated.length > 0);
  return { results, hasChanges };
}

// CLI Execution Entry Point
if (import.meta.main) {
  const checkOnly = process.argv.includes('--check');

  console.log('======================================================================');
  console.log('🤖 SG Forge - Multi-Agent Directive Synchronization Engine (2026 LTS)');
  console.log(`Mode: ${checkOnly ? '🔍 Verification Check' : '⚡ Synchronizing Targets'}`);
  console.log('======================================================================\n');

  const { results, hasChanges } = syncAllDirectives(checkOnly);

  let totalUpdated = 0;
  let totalInSync = 0;

  for (const r of results) {
    if (r.missingMaster) {
      console.log(`⚠️  [${r.location}] AGENTS.md master not found. Skipped.`);
      continue;
    }

    totalUpdated += r.updated.length;
    totalInSync += r.inSync.length;

    if (r.updated.length > 0) {
      const verb = checkOnly ? 'Out of sync' : 'Synchronized';
      console.log(`🔄 [${r.location}] ${verb} (${r.updated.length} files):`);
      for (const u of r.updated) {
        console.log(`   ├─ ${u}`);
      }
    } else {
      console.log(`✅ [${r.location}] All ${r.inSync.length} directive targets in 100% parity.`);
    }
  }

  console.log('\n----------------------------------------------------------------------');
  if (checkOnly) {
    if (hasChanges) {
      console.error(`❌ ${totalUpdated} directive targets are out of sync with their respective AGENTS.md.`);
      console.error('   Run: ./run.sh sync-directives (or bun scripts/sync-directives.ts) to resolve.');
      process.exit(1);
    } else {
      console.log(`✨ All ${totalInSync} multi-agent directive targets match master AGENTS.md files.`);
      process.exit(0);
    }
  } else {
    console.log(`🎉 Synchronization completed! ${totalUpdated} updated, ${totalInSync} already in sync.`);
    process.exit(0);
  }
}
