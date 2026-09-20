#!/usr/bin/env bun
/**
 * @forge/scripts/sync-submodules - Git Submodules Synchronization Engine (2026 LTS)
 * Discovers, initializes, and ensures 100% structural parity for all autonomous Forge App submodules.
 * Synchronizes toolchain wrappers, multi-agent directives (.github, .cursor, .agents),
 * IDE configurations (.vscode), shell activators (env.sh), and quality workflows.
 */

import { existsSync, readdirSync, chmodSync, copyFileSync, readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { syncAllDirectives } from './sync-directives';

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

    // 1. Ensure local git repository initialized if requested
    if (process.argv.includes('--standalone-repos')) {
      if (!existsSync(gitDir)) {
        console.log(`   📦 Initializing local git repository...`);
        execSync('git init', { cwd: appPath, stdio: 'pipe' });
      }
    }

    if (app !== 'app-template') {
      // 2. Sync Toolchain Wrappers in portables/bin/
      const binDir = join(appPath, 'portables', 'bin');
      mkdirSync(binDir, { recursive: true });
      const templateBin = join(TEMPLATE_DIR, 'portables', 'bin');
      if (existsSync(templateBin)) {
        for (const file of readdirSync(templateBin)) {
          const srcTool = join(templateBin, file);
          const destTool = join(binDir, file);
          copyFileSync(srcTool, destTool);
        }
      }

      // 3. Sync .github configurations (copilot-instructions, workflows, issue templates)
      const githubDir = join(appPath, '.github');
      mkdirSync(githubDir, { recursive: true });
      const templateGithub = join(TEMPLATE_DIR, '.github');
      if (existsSync(templateGithub)) {
        cpSync(templateGithub, githubDir, { recursive: true });
      }

      // 4. Sync .vscode workspace configuration
      const vscodeDir = join(appPath, '.vscode');
      mkdirSync(vscodeDir, { recursive: true });
      const templateVscode = join(TEMPLATE_DIR, '.vscode');
      if (existsSync(templateVscode)) {
        cpSync(templateVscode, vscodeDir, { recursive: true });
      }

      // 5. Sync .cursor workspace configuration
      const cursorDir = join(appPath, '.cursor');
      mkdirSync(cursorDir, { recursive: true });
      const templateCursor = join(TEMPLATE_DIR, '.cursor');
      if (existsSync(templateCursor)) {
        cpSync(templateCursor, cursorDir, { recursive: true });
      }

      // 6. Sync docs/api/ specifications if missing
      const apiDir = join(appPath, 'docs', 'api');
      mkdirSync(apiDir, { recursive: true });
      const templateApi = join(TEMPLATE_DIR, 'docs', 'api');
      if (existsSync(templateApi)) {
        for (const file of readdirSync(templateApi)) {
          const dest = join(apiDir, file);
          if (!existsSync(dest)) {
            copyFileSync(join(templateApi, file), dest);
          }
        }
      }

      // 7. Sync root shell activator and dotfiles
      for (const dotfile of ['env.sh', '.editorconfig', 'bunfig.toml', '.spectral.yaml']) {
        const src = join(TEMPLATE_DIR, dotfile);
        const dest = join(appPath, dotfile);
        if (existsSync(src)) {
          copyFileSync(src, dest);
        }
      }

      // 8. Sync scripts parity (all scripts from app-template)
      const scriptsDir = join(appPath, 'scripts');
      mkdirSync(scriptsDir, { recursive: true });
      const templateScriptsDir = join(TEMPLATE_DIR, 'scripts');
      if (existsSync(templateScriptsDir)) {
        for (const s of readdirSync(templateScriptsDir)) {
          const srcScript = join(templateScriptsDir, s);
          const destScript = join(scriptsDir, s);
          copyFileSync(srcScript, destScript);
        }
      }

      // 8b. Sync package.json toolchain scripts
      const pkgPath = join(appPath, 'package.json');
      const templatePkgPath = join(TEMPLATE_DIR, 'package.json');
      if (existsSync(pkgPath) && existsSync(templatePkgPath)) {
        try {
          const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
          const tPkg = JSON.parse(readFileSync(templatePkgPath, 'utf8'));
          pkg.scripts = { ...pkg.scripts, ...tPkg.scripts };
          writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
        } catch {}
      }

      // 9. Sync run.sh & run.bat
      for (const runner of ['run.sh', 'run.bat']) {
        const srcRunner = join(TEMPLATE_DIR, runner);
        const destRunner = join(appPath, runner);
        if (existsSync(srcRunner)) {
          copyFileSync(srcRunner, destRunner);
        }
      }
    }

    // 10. Ensure executable permissions on runners, env.sh, portables, and hooks
    for (const executable of [
      join(appPath, 'run.sh'),
      join(appPath, 'env.sh'),
      join(appPath, '.githooks', 'pre-commit'),
      join(appPath, '.githooks', 'post-commit'),
      join(appPath, '.githooks', 'commit-msg'),
    ]) {
      if (existsSync(executable)) {
        try { chmodSync(executable, 0o755); } catch {}
      }
    }

    const binDir = join(appPath, 'portables', 'bin');
    if (existsSync(binDir)) {
      for (const file of readdirSync(binDir)) {
        if (!file.endsWith('.md')) {
          try { chmodSync(join(binDir, file), 0o755); } catch {}
        }
      }
    }

    // 11. Ensure rules parity and folder README.md files
    const rulesDir = join(appPath, '.agents', 'rules');
    mkdirSync(rulesDir, { recursive: true });
    const templateRulesDir = join(TEMPLATE_DIR, '.agents', 'rules');
    if (app !== 'app-template' && existsSync(templateRulesDir)) {
      for (const rule of readdirSync(templateRulesDir)) {
        copyFileSync(join(templateRulesDir, rule), join(rulesDir, rule));
      }
    }

    const skillsDir = join(appPath, '.agents', 'skills');
    mkdirSync(skillsDir, { recursive: true });
    const templateSkillsDir = join(TEMPLATE_DIR, '.agents', 'skills');
    if (existsSync(templateSkillsDir)) {
      for (const entry of readdirSync(templateSkillsDir, { withFileTypes: true })) {
        const srcPath = join(templateSkillsDir, entry.name);
        const destPath = join(skillsDir, entry.name);
        if (entry.isDirectory()) {
          mkdirSync(destPath, { recursive: true });
          for (const f of readdirSync(srcPath)) {
            copyFileSync(join(srcPath, f), join(destPath, f));
          }
        } else if (entry.isFile() && !existsSync(destPath)) {
          copyFileSync(srcPath, destPath);
        }
      }
    }

    // Ensure data/ directory has README.md and .gitignore
    const dataDir = join(appPath, 'data');
    mkdirSync(dataDir, { recursive: true });
    const dataReadme = join(dataDir, 'README.md');
    if (!existsSync(dataReadme) && existsSync(join(TEMPLATE_DIR, 'data', 'README.md'))) {
      copyFileSync(join(TEMPLATE_DIR, 'data', 'README.md'), dataReadme);
    }
    const dataGitignore = join(dataDir, '.gitignore');
    if (!existsSync(dataGitignore) && existsSync(join(TEMPLATE_DIR, 'data', '.gitignore'))) {
      copyFileSync(join(TEMPLATE_DIR, 'data', '.gitignore'), dataGitignore);
    }

    // Ensure logs/ directory has README.md and .gitignore
    const logsDir = join(appPath, 'logs');
    mkdirSync(logsDir, { recursive: true });
    const logsReadme = join(logsDir, 'README.md');
    if (!existsSync(logsReadme) && existsSync(join(TEMPLATE_DIR, 'logs', 'README.md'))) {
      copyFileSync(join(TEMPLATE_DIR, 'logs', 'README.md'), logsReadme);
    }
    const logsGitignore = join(logsDir, '.gitignore');
    if (!existsSync(logsGitignore) && existsSync(join(TEMPLATE_DIR, 'logs', '.gitignore'))) {
      copyFileSync(join(TEMPLATE_DIR, 'logs', '.gitignore'), logsGitignore);
    }

    // Ensure backups/ directory has README.md if present
    const backupsDir = join(appPath, 'backups');
    if (existsSync(backupsDir)) {
      const bReadme = join(backupsDir, 'README.md');
      if (!existsSync(bReadme)) {
        writeFileSync(bReadme, '# 💾 Submodule Database Backups (`backups/`)\n\nIsolated VACUUM snapshots for this microservice.\n', 'utf8');
      }
      const bDbDir = join(backupsDir, 'db');
      if (existsSync(bDbDir)) {
        const bDbReadme = join(bDbDir, 'README.md');
        if (!existsSync(bDbReadme)) {
          writeFileSync(bDbReadme, '# 📦 Database Snapshots (`backups/db/`)\n\nSnapshot archives generated by `scripts/backup-db.ts`.\n', 'utf8');
        }
      }
    }

    const workflowsDir = join(appPath, '.agents', 'workflows');
    mkdirSync(workflowsDir, { recursive: true });
    if (!existsSync(join(workflowsDir, 'README.md')) && existsSync(join(TEMPLATE_DIR, '.agents', 'workflows', 'README.md'))) {
      copyFileSync(join(TEMPLATE_DIR, '.agents', 'workflows', 'README.md'), join(workflowsDir, 'README.md'));
    }

    // 12. Ensure Multi-Agent Directives Sync across markdown files
    const agentsMd = join(appPath, 'AGENTS.md');
    if (existsSync(agentsMd)) {
      const content = readFileSync(agentsMd, 'utf8');
      for (const target of [
        'CLAUDE.md',
        'GEMINI.md',
        '.cursorrules',
        join('.agents', 'AGENTS.md'),
        join('.github', 'copilot-instructions.md'),
        join('.cursor', 'rules', 'AGENTS.md'),
      ]) {
        const dest = join(appPath, target);
        if (!existsSync(dest) || readFileSync(dest, 'utf8') !== content) {
          writeFileSync(dest, content, 'utf8');
        }
      }
    }

    // 13. Sync Ignore Files via submodule sync-ignores.ts
    const syncIgnoresScript = join(appPath, 'scripts', 'sync-ignores.ts');
    if (existsSync(syncIgnoresScript)) {
      try {
        execSync(`bun ${syncIgnoresScript}`, { cwd: appPath, stdio: 'ignore' });
      } catch {}
    }

    // 14. Configure local git hooks path & filemode
    try {
      execSync('git config core.hooksPath .githooks', { cwd: appPath, stdio: 'ignore' });
      execSync('git config core.filemode false', { cwd: appPath, stdio: 'ignore' });
      execSync('git config core.autocrlf false', { cwd: appPath, stdio: 'ignore' });
    } catch {}
  }

  // 15. Ensure Multi-Agent Directives are 100% hash in-sync
  syncAllDirectives(false);

  console.log('\n🎉 All Forge App submodules successfully verified & synchronized!');
}

if (import.meta.main) {
  syncSubmodules();
}
