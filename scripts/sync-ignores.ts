#!/usr/bin/env bun
/**
 * @forge/scripts/sync-ignores - Canonical Ignore & Git Attributes Synchronization Engine (2026 LTS)
 * Ensures 100% uniformity across all monorepo ignore files (.gitignore, .dockerignore, .cursorignore,
 * .antigravityignore, .copilotignore, .graphifyignore, .repomixignore) and .gitattributes.
 *
 * Enterprise Clean Architecture Standard
 */

import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const REPO_ROOT = process.cwd();
const toRelGitPath = (p: string) => relative(REPO_ROOT, p).replace(/\\/g, '/');

/** Core shared exclusion rules across all toolchains  * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export const MANDATORY_EXCLUSIONS = [
  'node_modules',
  '**/.next',
  '**/.astro',
  '**/dist',
  '**/build',
  '**/.cache',
  'portables/**/cache',
  '.env',
  '.env.*',
  '*.pem',
  '*.key',
  '*.crt',
  '*.csr',
  '*.p12',
  '*.pfx',
  '*.keystore',
  '**/certs/*.pem',
  '**/certs/*.key',
  '**/certs/*.crt',
  '**/certs/*.csr',
  'data/*.db',
  'data/*.db-wal',
  'data/*.db-shm',
  'apps/data/',
  'backups/',
  '*.enc',
  '*.sqlite',
  '*.sqlite3',
  'logs/*.log',
  '**/logs/*.log',
  'scratch/',
  'repomix-output.xml',
  '.coverage',
  'public/brand/custom/',
  'public/brand/custom-*',
  'public/brand/*.custom.*',
  'public/brand/custom-logo.*',
  'apps/src/landing-custom/custom/',
  'custom-landing/',
  'proxy/Caddyfile',
  'proxy/errors/*.html',
  'graphify-out/cache/',
  'graphify-out/.graphify_*',
  'graphify-out/20*/',
  'graphify-out/manifest.json',
  '/graft/',
  '**/.graft',
  '.codeburn/',
  'codeburn-*.json',
  'codeburn-*.csv',
  '.headroom/',
  'headroom-*.json',
];


/** Canonical list of root ignore files that must exist and stay in sync  * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export const ROOT_IGNORE_FILES = [
  '.gitignore',
  '.dockerignore',
  '.antigravityignore',
  '.cursorignore',
  '.copilotignore',
  '.graphifyignore',
  '.graftignore',
  '.repomixignore',
];

/** Mandatory attributes in .gitattributes  * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export const MANDATORY_ATTRIBUTES = [
  '* text=auto',
  'run.sh text eol=lf',
  'portables/bin/* text eol=lf',
  'run.bat text eol=crlf',
  '*.bat text eol=crlf',
  '*.cmd text eol=crlf',
  '*.sh text eol=lf',
  '*.bash text eol=lf',
  '*.ts text eol=lf',
  '*.tsx text eol=lf',
  '*.js text eol=lf',
  '*.jsx text eol=lf',
  '*.json text eol=lf',
  '*.md text eol=lf',
  '*.mdx text eol=lf',
  '*.astro text eol=lf',
  '*.svg text eol=lf',
  '*.css text eol=lf',
  '*.env* text eol=lf',
  '*.yml text eol=lf',
  '*.yaml text eol=lf',
  '*.toml text eol=lf',
  '*Dockerfile* text eol=lf',
  'proxy/Caddyfile text eol=lf',
  '*.csv text eol=lf',
  'portables/bun/bin/bun binary',
  'portables/rtk/bin/rtk binary',
  'portables/ctop/ctop binary',
  'portables/hyperfine/hyperfine binary',
  'portables/scc/scc binary',
  '*.exe binary',
  '*.wasm binary',
  '*.db binary',
  '*.sqlite binary',
  '*.sqlite3 binary',
  '*.tar.gz binary',
  '*.png binary',
  '*.jpg binary',
  '*.ico binary',
];

/**
 * ValidationResult
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export interface ValidationResult {
  valid: boolean;
  missingFiles: string[];
  missingPatterns: { file: string; pattern: string }[];
  missingAttributes: string[];
  subfolderLogIgnoresMissing: string[];
  symlinksDetected: string[];
}

/**
 * Validates all root ignore files, .gitattributes, and subfolder log ignore files.
  * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export function validateIgnores(): ValidationResult {
  const missingFiles: string[] = [];
  const missingPatterns: { file: string; pattern: string }[] = [];
  const missingAttributes: string[] = [];
  const subfolderLogIgnoresMissing: string[] = [];
  const symlinksDetected: string[] = [];

  // 1. Validate root ignore files
  for (const file of ROOT_IGNORE_FILES) {
    const filePath = join(REPO_ROOT, file);
    if (!existsSync(filePath)) {
      missingFiles.push(file);
      continue;
    }
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n').map((l) => l.trim());
    for (const pat of MANDATORY_EXCLUSIONS) {
      const normalizedPat = pat.replace(/\/$/, '');
      const found = lines.some(
        (l) =>
          l === normalizedPat ||
          l === `${normalizedPat}/` ||
          l.includes(normalizedPat) ||
          l.includes(normalizedPat.replace(/\*\*\//g, ''))
      );
      if (!found) {
        missingPatterns.push({ file, pattern: pat });
      }
    }
  }

  // 2. Validate .gitattributes
  const attribPath = join(REPO_ROOT, '.gitattributes');
  if (!existsSync(attribPath)) {
    missingFiles.push('.gitattributes');
  } else {
    const attribContent = readFileSync(attribPath, 'utf8');
    for (const attr of MANDATORY_ATTRIBUTES) {
      const token = attr.split(' ')[0];
      if (!attribContent.includes(token)) {
        missingAttributes.push(attr);
      }
    }
  }

  // 3. Validate microservice colocated logs/.gitignore
  const appsDir = join(REPO_ROOT, 'apps', 'src');
  const forgeAppsDir = join(REPO_ROOT, 'forge-apps');

  const checkSubfolders = (parentDir: string) => {
    if (!existsSync(parentDir)) return;
    const entries = readdirSync(parentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const logGitignore = join(parentDir, entry.name, 'logs', '.gitignore');
        if (!existsSync(logGitignore)) {
          subfolderLogIgnoresMissing.push(toRelGitPath(logGitignore));
        }
      }
    }
  };

  checkSubfolders(appsDir);
  checkSubfolders(forgeAppsDir);

  // 4. Validate Zero Symlinks in portable toolchains (guarantees Windows / WSL / macOS parity)
  const portableDirs = [
    join(REPO_ROOT, 'portables', 'bin'),
    join(REPO_ROOT, 'portables', 'bun', 'bin'),
  ];
  for (const pDir of portableDirs) {
    if (existsSync(pDir)) {
      const entries = readdirSync(pDir);
      for (const entry of entries) {
        const fullPath = join(pDir, entry);
        const lstat = lstatSync(fullPath);
        if (lstat.isSymbolicLink()) {
          symlinksDetected.push(toRelGitPath(fullPath));
        }
      }
    }
  }

  const valid =
    missingFiles.length === 0 &&
    missingPatterns.length === 0 &&
    missingAttributes.length === 0 &&
    subfolderLogIgnoresMissing.length === 0 &&
    symlinksDetected.length === 0;

  return { valid, missingFiles, missingPatterns, missingAttributes, subfolderLogIgnoresMissing, symlinksDetected };
}

/**
 * Synchronizes and regenerates all ignore files and .gitattributes to exact canonical uniformity.
  * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export function syncAllIgnores(): { filesUpdated: string[] } {
  const filesUpdated: string[] = [];

  // 1. Generate canonical content for .gitignore / .cursorignore / etc.
  const canonicalIgnoreContent = `# ==============================================================================
# Canonical Ignore Configuration - SG Forge Monorepo (2026 LTS)
# Enterprise Standards: Multi-Package Workspace & Zero Leakage
# Auto-generated by scripts/sync-ignores.ts
# ==============================================================================

# 1. Dependencies & Package Managers
node_modules/
**/node_modules/
.pnp
.pnp.*

# 2. Local Isolated Python / Node Environments & Caches
.venv/
.node_env/
__pycache__/
**/*.py[cod]
.pytest_cache/
.ruff_cache/
.mypy_cache/
.coverage
htmlcov/
portables/**/cache/
portables/**/install/cache/

# 3. Build & Compilation Outputs
.next/
**/.next/
.astro/
**/.astro/
dist/
**/dist/
build/
**/build/
out/
**/out/
.turbo/
.cache/
**/.cache/
*.tsbuildinfo
**/*.tsbuildinfo
*.d.ts.map
repomix-output.xml

# 4. Environment Variables & Sensitive Secrets
.env
.env.*
!.env.example
*.pem
*.key
*.crt
*.p12
*.pfx
*.keystore
*.csr
proxy/certs/*.pem
proxy/certs/*.key
proxy/certs/*.crt
proxy/certs/*.csr

# 5. Database Files, WAL Transients & Snapshots
data/*.db
data/*.db-wal
data/*.db-shm
data/*.db-journal
data/backups/
apps/data/
backups/db/
*.enc
*.sqlite
*.sqlite3
*.db
*.db-wal
*.db-shm

# 6. Microservice Logs & Transient Runtime Files
logs/*.log
**/logs/*.log
*.log
scratch/
.system_generated/
*.swp
*.swo
*~
.DS_Store
Thumbs.db

# 7. Graphify, Graft, CodeBurn & Headroom Transient Backups & Context Caches
graphify-out/cache/
graphify-out/.graphify_*
graphify-out/20*/
graphify-out/manifest.json
/graft/
**/.graft
.codeburn/
codeburn-*.json
codeburn-*.csv
.headroom/
headroom-*.json


# 8. Enterprise Custom Brand Overrides (Never track org-specific custom branding)
public/brand/custom/
public/brand/custom-*
public/brand/*.custom.*
public/brand/custom-logo.*

# 9. Enterprise Custom Landing UI Overrides (Never track org-specific landing pages)
apps/src/landing-custom/custom/
custom-landing/

# 10. Dynamic Ingress Proxy & Pre-Rendered Error Fallbacks (Auto-generated from .env)
proxy/Caddyfile
!proxy/Caddyfile.example
proxy/errors/*.html
`;

  // 2. Write to each root ignore file
  // Non-Git toolchains exclude report/security logs to prevent Docker/AST/AI context bloat,
  // while Git intentionally tracks them for historical compliance and audit trails.
  const nonGitExclusions = `
# 8. Non-Git Toolchain Exclusions (Tracked in Git, excluded from Docker/AI/AST)
logs/reports/
logs/security/
`;

  for (const file of ROOT_IGNORE_FILES) {
    const filePath = join(REPO_ROOT, file);
    const content = file === '.gitignore'
      ? canonicalIgnoreContent
      : canonicalIgnoreContent + nonGitExclusions;
    writeFileSync(filePath, content, 'utf8');
    filesUpdated.push(file);
  }

  // 3. Ensure subfolder logs/.gitignore files exist
  const appsDir = join(REPO_ROOT, 'apps', 'src');
  const forgeAppsDir = join(REPO_ROOT, 'forge-apps');

  const syncSubfolderLogs = (parentDir: string) => {
    if (!existsSync(parentDir)) return;
    const entries = readdirSync(parentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const logsDir = join(parentDir, entry.name, 'logs');
        if (!existsSync(logsDir)) {
          mkdirSync(logsDir, { recursive: true });
        }
        const gitignoreFile = join(logsDir, '.gitignore');
        const content = `# Isolated microservice logs retention\n*.log\n*.log.*\n!.gitignore\n!README.md\n`;
        writeFileSync(gitignoreFile, content, 'utf8');
        filesUpdated.push(toRelGitPath(gitignoreFile));
      }
    }
  };

  syncSubfolderLogs(appsDir);
  syncSubfolderLogs(forgeAppsDir);

  // 4. Synchronize .gitattributes
  const canonicalGitattributes = `# ==============================================================================
# Canonical Git Attributes - SG Forge Monorepo (2026 LTS)
# Enterprise Standards: Strict Line Endings & Binary Integrity
# Auto-generated by scripts/sync-ignores.ts
# ==============================================================================

* text=auto

# Enforce strict LF line-endings on shell and code scripts
run.sh text eol=lf
portables/bin/* text eol=lf
run.bat text eol=crlf
*.bat text eol=crlf
*.cmd text eol=crlf
*.sh text eol=lf
*.bash text eol=lf
*.ts text eol=lf
*.tsx text eol=lf
*.js text eol=lf
*.jsx text eol=lf
*.json text eol=lf
*.md text eol=lf
*.mdx text eol=lf
*.astro text eol=lf
*.svg text eol=lf
*.css text eol=lf
*.env* text eol=lf
*.yml text eol=lf
*.yaml text eol=lf
*.toml text eol=lf
*Dockerfile* text eol=lf
proxy/Caddyfile text eol=lf
*.csv text eol=lf

# Protect native executables from git line-ending corruption and phantom diffs
portables/bun/bin/bun binary
portables/rtk/bin/rtk binary
portables/ctop/ctop binary
portables/hyperfine/hyperfine binary
portables/scc/scc binary
*.exe binary
*.wasm binary

# Protect binary and compiled assets from git corruption
*.db binary
*.sqlite binary
*.sqlite3 binary
*.tar.gz binary
*.png binary
*.jpg binary
*.ico binary
`;

  writeFileSync(join(REPO_ROOT, '.gitattributes'), canonicalGitattributes, 'utf8');
  filesUpdated.push('.gitattributes');

  return { filesUpdated };
}

if (import.meta.main) {
  const result = syncAllIgnores();
  console.log(`✨ [Sync Ignores] Synchronized ${result.filesUpdated.length} ignore files and .gitattributes across the monorepo:`);
  for (const f of result.filesUpdated) {
    console.log(`   └─ ${f}`);
  }
}
