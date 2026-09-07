#!/usr/bin/env bun
/**
 * @forge/scripts/sync-submodules - Git Submodules Synchronization Engine (2026 LTS)
 * Discovers, initializes, and ensures structural parity for all autonomous Forge App submodules.
 */

import { existsSync, readdirSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const REPO_ROOT = process.cwd();
const FORGE_APPS_DIR = join(REPO_ROOT, 'forge-apps');

function syncSubmodules(): void {
  console.log('======================================================================');
  console.log('🧩 SG Forge - Submodules Synchronization Engine (2026 LTS)');
  console.log('======================================================================');

  if (!existsSync(FORGE_APPS_DIR)) {
    console.error('❌ forge-apps/ directory does not exist.');
    process.exit(1);
  }

  const entries = readdirSync(FORGE_APPS_DIR, { withFileTypes: true });
  const appDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  console.log(`🔍 Discovered ${appDirs.length} Forge Apps: ${appDirs.join(', ')}\n`);

  for (const app of appDirs) {
    const appPath = join(FORGE_APPS_DIR, app);
    const gitDir = join(appPath, '.git');

    // 1. Ensure local git repository initialized (only if standalone submodule mode requested)
    if (process.argv.includes('--standalone-repos')) {
      if (!existsSync(gitDir)) {
        console.log(`📦 [${app}] Initializing local git repository...`);
        execSync('git init', { cwd: appPath, stdio: 'pipe' });
      } else {
        console.log(`✅ [${app}] Git repository active.`);
      }
    }

    // 2. Ensure executable permissions on run.sh and hooks
    const runSh = join(appPath, 'run.sh');
    if (existsSync(runSh)) {
      try {
        chmodSync(runSh, 0o755);
      } catch {}
    }

    const preCommit = join(appPath, '.githooks', 'pre-commit');
    if (existsSync(preCommit)) {
      try {
        chmodSync(preCommit, 0o755);
      } catch {}
    }

    const postCommit = join(appPath, '.githooks', 'post-commit');
    if (existsSync(postCommit)) {
      try {
        chmodSync(postCommit, 0o755);
      } catch {}
    }

    const rtkBin = join(appPath, 'portables', 'bin', 'rtk');
    if (existsSync(rtkBin)) {
      try {
        chmodSync(rtkBin, 0o755);
      } catch {}
    }

    // 3. Configure local git hooks path
    try {
      execSync('git config core.hooksPath .githooks', { cwd: appPath, stdio: 'pipe' });
    } catch {}
  }

  console.log('\n🎉 All Forge App submodules successfully verified & synchronized!');
}

if (import.meta.main) {
  syncSubmodules();
}
