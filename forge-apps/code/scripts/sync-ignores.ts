#!/usr/bin/env bun
/**
 * Standalone Forge Micro-App - Ignore & Git Attributes Synchronization Script (2026 LTS)
 * Ensures consistency across .gitignore, .dockerignore, .antigravityignore, .cursorignore, .copilotignore, and .gitattributes.
 */

import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const APP_ROOT = process.cwd();

const IGNORE_PATTERNS = `# Dependencies & Package Managers
node_modules/
dist/
build/
out/
.cache/
*.tsbuildinfo

# Submodule Environment & Secrets
.env
.env.*
!.env.example
*.pem
*.key
*.crt

# Submodule Local Database & Transients
data/*.db
data/*.db-wal
data/*.db-shm
data/*.sqlite
data/*.sqlite3

# Submodule Local Logs
logs/*.log

# Operating System & IDE Transients
.DS_Store
Thumbs.db
.idea/
.vscode/
*.swp
`;

const DOCKER_IGNORE_PATTERNS = `.git
.agents
.githooks
node_modules
test
logs
data
.env
.env.*
!.env.example
`;

const GIT_ATTRIBUTES_CONTENT = `* text=auto eol=lf
*.ts text eol=lf
*.js text eol=lf
*.json text eol=lf
*.md text eol=lf
*.sh text eol=lf
*.bat text eol=crlf
*.yml text eol=lf
*.yaml text eol=lf
*.png binary
*.jpg binary
*.jpeg binary
*.ico binary
*.svg text eol=lf
*.db binary
*.db-shm binary
*.db-wal binary
`;

const IGNORE_TARGETS = [
  '.gitignore',
  '.antigravityignore',
  '.cursorignore',
  '.copilotignore',
];

for (const target of IGNORE_TARGETS) {
  writeFileSync(join(APP_ROOT, target), IGNORE_PATTERNS, 'utf8');
}

writeFileSync(join(APP_ROOT, '.dockerignore'), DOCKER_IGNORE_PATTERNS, 'utf8');
writeFileSync(join(APP_ROOT, '.gitattributes'), GIT_ATTRIBUTES_CONTENT, 'utf8');

console.log('✨ [Submodule Sync] Synchronized ignore files and .gitattributes successfully.');
