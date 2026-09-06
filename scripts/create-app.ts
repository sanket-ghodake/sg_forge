#!/usr/bin/env bun
/**
 * SG Forge - 1-Command Micro-App Generator (2026 LTS)
 * Enterprise Standard Microservice Scaffolding Engine
 *
 * Usage:
 *   rtk bun scripts/create-app.ts <app-name> [display-name] [category] [role]
 * Example:
 *   rtk bun scripts/create-app.ts inventory "Inventory & Asset Tracker" "Operations" "Employee / Admin"
 */

import { chmodSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { Database } from 'bun:sqlite';
import { join, relative } from 'node:path';
import { loadServiceRegistry } from '../apps/src/sdk/src/registry';
import { generateCaddyfile } from './generate-proxy';

const REPO_ROOT = process.cwd();

/**
 * CreateAppOptions
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export interface CreateAppOptions {
  appName: string;
  displayName?: string;
  category?: string;
  role?: string;
}

/**
 * createApp
 * @requirements [SR-GATE-001] [LLR-SUB-007] [SR-SUB-001]
 */
export function createApp(options: CreateAppOptions): {
  success: boolean;
  appName: string;
  port: number;
  ingressPath: string;
  targetDir: string;
  error?: string;
} {
  const rawName = options.appName.trim().toLowerCase();
  const appName = rawName.replace(/[^a-z0-9\-]/g, '-').replace(/^-+|-+$/g, '');

  if (!appName) {
    return {
      success: false,
      appName: '',
      port: 0,
      ingressPath: '',
      targetDir: '',
      error: 'Invalid application name. Must contain alphanumeric characters or hyphens.',
    };
  }

  const targetDir = join(REPO_ROOT, 'forge-apps', appName);
  const templateDir = join(REPO_ROOT, 'forge-apps', 'app-template');

  if (existsSync(targetDir)) {
    return {
      success: false,
      appName,
      port: 0,
      ingressPath: '',
      targetDir,
      error: `Application directory "forge-apps/${appName}" already exists.`,
    };
  }

  if (!existsSync(templateDir)) {
    return {
      success: false,
      appName,
      port: 0,
      ingressPath: '',
      targetDir,
      error: `Template directory "forge-apps/app-template" not found.`,
    };
  }

  // 1. Discover Next Available Port (scan .env registry)
  const existingServices = loadServiceRegistry();
  const microAppPorts = existingServices
    .map((s) => s.port)
    .filter((p) => p >= 8080 && p < 8999);
  const allocatedPort = microAppPorts.length > 0 ? Math.max(...microAppPorts) + 1 : 8088;

  // 2. Clone App Template with Sanitized Exclusion Filter (Zero Commit/Data/Transient Bleed)
  cpSync(templateDir, targetDir, {
    recursive: true,
    filter: (src) => {
      const rel = relative(templateDir, src);
      if (!rel) return true;
      if (rel === '.git' || rel.startsWith('.git/')) return false;
      if (rel === 'data' || rel.startsWith('data/')) return false;
      if (rel === 'backups' || rel.startsWith('backups/')) return false;
      if (rel === 'node_modules' || rel.startsWith('node_modules/')) return false;
      if (rel === 'logs/commits.jsonl' || rel === 'logs/WORKLOGS.md') return false;
      if (rel.endsWith('.tsbuildinfo')) return false;
      return true;
    },
  });

  const displayName =
    options.displayName ||
    appName
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') + ' Service';

  const category = options.category || 'Isolated Polyglot Forge Micro-Apps';
  const role = options.role || 'Employee / Admin';
  const ingressPath = `/apps/${appName}`;

  // Ensure clean logs directory with pristine worklog & ledger
  const appLogsDir = join(targetDir, 'logs');
  mkdirSync(appLogsDir, { recursive: true });
  writeFileSync(join(appLogsDir, 'WORKLOGS.md'), '# WORKLOGS\n', 'utf8');
  writeFileSync(join(appLogsDir, 'commits.jsonl'), '', 'utf8');

  // 3. Customize Files (Replace Template Placeholders)
  const replaceInFile = (relPath: string, replacements: Record<string, string>) => {
    const fullPath = join(targetDir, relPath);
    if (!existsSync(fullPath)) return;
    let content = readFileSync(fullPath, 'utf8');
    for (const [target, replacement] of Object.entries(replacements)) {
      content = content.replaceAll(target, replacement);
    }
    writeFileSync(fullPath, content, 'utf8');
  };

  // package.json
  replaceInFile('package.json', {
    '@forge-apps/template': `@forge-apps/${appName}`,
  });

  // src/server.ts
  replaceInFile('src/server.ts', {
    'app-template': `app-${appName}`,
    'Forge App Template: Standard Microservice Reference': `Forge App: ${displayName}`,
    'PORT || 8099': `PORT || ${allocatedPort}`,
    'SG Forge - Micro-App Template': `SG Forge - ${displayName}`,
    'TEMPLATE': appName.toUpperCase().slice(0, 10),
    'FORGE MICRO-APP': 'FORGE APP',
    '🚀 Forge App Template': `🚀 ${displayName}`,
    'template.db': `${appName}.db`,
    'template_turso.db': `${appName}.db`,
    'turso_template.db': `${appName}.db`,
    'startTemplateServer': `start${appName.replace(/-/g, '')}Server`,
  });

  // src/db/index.ts
  replaceInFile('src/db/index.ts', {
    'template-db': `${appName}-db`,
    'template.db': `${appName}.db`,
    'template_items': `${appName.replace(/-/g, '_')}_items`,
    'template microservice': `${appName} microservice`,
  });

  // docker/Dockerfile
  replaceInFile('docker/Dockerfile', {
    '8099': `${allocatedPort}`,
  });

  // docker-compose.yml
  replaceInFile('docker-compose.yml', {
    'forge-app-template': `forge-app-${appName}`,
    'app-airgap-net': `${appName}-airgap-net`,
    'app-template': `app-${appName}`,
    '8099': `${allocatedPort}`,
  });

  // AGENTS.md
  replaceInFile('AGENTS.md', {
    'FORGE MICRO-APP SUBMODULE': `${displayName.toUpperCase()} SUBMODULE`,
  });

  // README.md
  writeFileSync(
    join(targetDir, 'README.md'),
    `# 🚀 ${displayName} (\`forge-apps/${appName}\`)\n\n` +
      `Dedicated isolated microservice submodule operating on internal port \`${allocatedPort}\` with dedicated Turso libSQL instance.\n\n` +
      `## 🛠️ Routes\n` +
      `- Ingress Path: \`${ingressPath}\`\n` +
      `- Health Probe: \`${ingressPath}/health\`\n` +
      `- Telemetry Log Bridge: \`${ingressPath}/api/logs/browser\`\n`,
    'utf8'
  );

  // Customize Tests (Rename template.test.ts and replace headers/describes)
  const templateUnitTest = join(targetDir, 'test', 'unit', 'template.test.ts');
  const appUnitTest = join(targetDir, 'test', 'unit', `${appName}.test.ts`);
  if (existsSync(templateUnitTest)) {
    renameSync(templateUnitTest, appUnitTest);
  }

  const testDir = join(targetDir, 'test');
  const customizeTestsRecursively = (dir: string) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        customizeTestsRecursively(full);
      } else if (/\.test\.ts$/.test(entry.name)) {
        let content = readFileSync(full, 'utf8');
        content = content.replaceAll('@forge/app-template', `@forge-apps/${appName}`);
        content = content.replaceAll('App Template', displayName);
        content = content.replaceAll('startTemplateServer', `start${appName.replace(/-/g, '')}Server`);
        writeFileSync(full, content, 'utf8');
      }
    }
  };
  customizeTestsRecursively(testDir);

  // 4. Provision Dedicated Turso DB inside Submodule data/ Directory
  const appDataDir = join(targetDir, 'data');
  if (!existsSync(appDataDir)) {
    mkdirSync(appDataDir, { recursive: true });
  }
  const dbPath = join(appDataDir, `${appName}.db`);
  const db = new Database(dbPath);
  db.run(`
    CREATE TABLE IF NOT EXISTS ${appName.replace(/-/g, '_')}_records (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at INTEGER NOT NULL
    );
  `);
  db.close();

  // 5. Initialize Git Repository for Submodule Autonomy & Configure Hooks
  try {
    execSync('git init -b main', { cwd: targetDir, stdio: 'ignore' });
  } catch {
    try {
      execSync('git init', { cwd: targetDir, stdio: 'ignore' });
    } catch {}
  }
  try {
    execSync('git config core.hooksPath .githooks', { cwd: targetDir, stdio: 'ignore' });
  } catch {}

  // Set executable permissions on CLI runner and githooks
  try {
    chmodSync(join(targetDir, 'run.sh'), 0o755);
    chmodSync(join(targetDir, '.githooks', 'pre-commit'), 0o755);
    chmodSync(join(targetDir, '.githooks', 'post-commit'), 0o755);
    chmodSync(join(targetDir, 'portables', 'bin', 'rtk'), 0o755);
  } catch {}

  // 6. Register Submodule in Root .gitmodules
  const gitmodulesPath = join(REPO_ROOT, '.gitmodules');
  if (existsSync(gitmodulesPath)) {
    let gm = readFileSync(gitmodulesPath, 'utf8');
    if (!gm.includes(`[submodule "forge-apps/${appName}"]`)) {
      gm += `\n[submodule "forge-apps/${appName}"]\n\tpath = forge-apps/${appName}\n\turl = ./forge-apps/${appName}\n\tbranch = main\n`;
      writeFileSync(gitmodulesPath, gm, 'utf8');
    }
  }

  // 7. Append to .env & .env.example Registry
  const envUpper = appName.toUpperCase().replace(/-/g, '_');
  const envLine = `APP_${envUpper}="${displayName}|${allocatedPort}|${ingressPath}|${category}|${role}|app-${appName}"\n`;

  for (const file of ['.env', '.env.example']) {
    const targetPath = join(REPO_ROOT, file);
    if (existsSync(targetPath)) {
      let content = readFileSync(targetPath, 'utf8');
      if (!content.includes(`APP_${envUpper}=`)) {
        content += envLine;
        writeFileSync(targetPath, content, 'utf8');
      }
    }
  }

  // 8. Regenerate Caddyfile
  generateCaddyfile();

  return {
    success: true,
    appName,
    port: allocatedPort,
    ingressPath,
    targetDir,
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
⚡ SG Forge 1-Command Micro-App Generator

Usage:
  rtk bun scripts/create-app.ts <app-name> [display-name] [category] [role]

Examples:
  rtk bun scripts/create-app.ts inventory
  rtk bun scripts/create-app.ts ai-assistant "AI Research Assistant" "Engineering Squads" "Employee / Admin"
`);
    process.exit(0);
  }

  const [name, display, cat, role] = args;
  console.log(`🔨 Scaffolding new Forge Micro-App "${name}"...`);
  const res = createApp({
    appName: name,
    displayName: display,
    category: cat,
    role,
  });

  if (!res.success) {
    console.error(`❌ Failed to create app: ${res.error}`);
    process.exit(1);
  }

  console.log(`
✅ [Success] Successfully created Forge Micro-App: "${res.appName}"!
   ├─ Location:     forge-apps/${res.appName}
   ├─ Port:         ${res.port}
   ├─ Ingress Path: ${res.ingressPath}
   ├─ Database:     forge-apps/${res.appName}/data/${res.appName}.db
   └─ Ingress:      Auto-synced to proxy/Caddyfile & Landing Hub

🚀 To start in development:
   cd forge-apps/${res.appName} && rtk bun src/server.ts
`);
}
