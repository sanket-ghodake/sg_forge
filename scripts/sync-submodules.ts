#!/usr/bin/env bun
/**
 * @forge/scripts/sync-submodules - Git Submodules Synchronization Engine (2026 LTS)
 * Discovers, initializes, and ensures structural parity for all autonomous Forge App submodules.
 * Synchronizes toolchain wrappers, multi-agent directives, rules, and ignore configurations.
 */

import { existsSync, readdirSync, chmodSync, copyFileSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const REPO_ROOT = process.cwd();
const FORGE_APPS_DIR = join(REPO_ROOT, 'forge-apps');
const TEMPLATE_DIR = join(FORGE_APPS_DIR, 'app-template');

/**
 * syncSubmodules
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
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
    console.log(`🔄 [${app}] Synchronizing configuration & toolchain parity...`);

    // 1. Ensure local git repository initialized (only if standalone submodule mode requested)
    if (process.argv.includes('--standalone-repos')) {
      if (!existsSync(gitDir)) {
        console.log(`   📦 Initializing local git repository...`);
        execSync('git init', { cwd: appPath, stdio: 'pipe' });
      }
    }

    // 2. Ensure executable permissions on run.sh and hooks
    const runSh = join(appPath, 'run.sh');
    if (existsSync(runSh)) {
      try { chmodSync(runSh, 0o755); } catch {}
    }

    const preCommit = join(appPath, '.githooks', 'pre-commit');
    if (existsSync(preCommit)) {
      try { chmodSync(preCommit, 0o755); } catch {}
    }

    const postCommit = join(appPath, '.githooks', 'post-commit');
    if (existsSync(postCommit)) {
      try { chmodSync(postCommit, 0o755); } catch {}
    }

    // 3. Sync Toolchain Wrappers in portables/bin/
    const binDir = join(appPath, 'portables', 'bin');
    if (existsSync(binDir)) {
      const templateBin = join(TEMPLATE_DIR, 'portables', 'bin');
      if (app !== 'app-template' && existsSync(templateBin)) {
        for (const tool of ['rtk', 'codeburn', 'council', 'graft', 'headroom']) {
          const srcTool = join(templateBin, tool);
          const destTool = join(binDir, tool);
          if (existsSync(srcTool) && !existsSync(destTool)) {
            copyFileSync(srcTool, destTool);
          }
        }
      }
      for (const file of readdirSync(binDir)) {
        if (!file.endsWith('.md')) {
          try { chmodSync(join(binDir, file), 0o755); } catch {}
        }
      }
    }

    // 4. Ensure rules parity and folder README.md files
    const rulesDir = join(appPath, '.agents', 'rules');
    mkdirSync(rulesDir, { recursive: true });
    const templateRulesDir = join(TEMPLATE_DIR, '.agents', 'rules');

    if (app !== 'app-template' && existsSync(templateRulesDir)) {
      const templateRules = readdirSync(templateRulesDir);
      for (const rule of templateRules) {
        const srcRule = join(templateRulesDir, rule);
        const destRule = join(rulesDir, rule);
        if (!existsSync(destRule)) {
          copyFileSync(srcRule, destRule);
        }
      }
    }

    // Ensure .agents/skills/ and .agents/workflows/ directories with README.md
    const skillsDir = join(appPath, '.agents', 'skills');
    mkdirSync(skillsDir, { recursive: true });
    const skillsReadme = join(skillsDir, 'README.md');
    if (!existsSync(skillsReadme) && existsSync(join(TEMPLATE_DIR, '.agents', 'skills', 'README.md'))) {
      copyFileSync(join(TEMPLATE_DIR, '.agents', 'skills', 'README.md'), skillsReadme);
    }

    const workflowsDir = join(appPath, '.agents', 'workflows');
    mkdirSync(workflowsDir, { recursive: true });
    const workflowsReadme = join(workflowsDir, 'README.md');
    if (!existsSync(workflowsReadme) && existsSync(join(TEMPLATE_DIR, '.agents', 'workflows', 'README.md'))) {
      copyFileSync(join(TEMPLATE_DIR, '.agents', 'workflows', 'README.md'), workflowsReadme);
    }

    // 5. Ensure Multi-Agent Directives Sync across markdown files
    const agentsMd = join(appPath, 'AGENTS.md');
    if (existsSync(agentsMd)) {
      const content = readFileSync(agentsMd, 'utf8');
      for (const target of ['CLAUDE.md', 'GEMINI.md', join('.agents', 'AGENTS.md')]) {
        const dest = join(appPath, target);
        if (!existsSync(dest) || readFileSync(dest, 'utf8') !== content) {
          writeFileSync(dest, content, 'utf8');
        }
      }
    }

    // 6. Sync Ignore Files via submodule sync-ignores.ts if available
    const syncIgnoresScript = join(appPath, 'scripts', 'sync-ignores.ts');
    if (existsSync(syncIgnoresScript)) {
      try {
        execSync(`bun ${syncIgnoresScript}`, { cwd: appPath, stdio: 'ignore' });
      } catch {}
    }

    // 7. Configure local git hooks path
    try {
      execSync('git config core.hooksPath .githooks', { cwd: appPath, stdio: 'ignore' });
    } catch {}
  }

  console.log('\n🎉 All Forge App submodules successfully verified & synchronized!');
}

if (import.meta.main) {
  syncSubmodules();
}
