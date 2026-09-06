#!/usr/bin/env bun
/**
 * SG Forge - Brand Asset Git Lock & In-Place Customization Engine (2026 LTS)
 * Allows organizations to replace public/brand/logo.png and logo.svg in-place
 * while ensuring Git marks the files as skip-worktree, preventing a dirty working tree.
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = process.cwd();
const TARGET_FILES = ['public/brand/logo.png', 'public/brand/logo.svg'];

function runGit(args: string): string {
  try {
    return execSync(`git ${args}`, { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  } catch (err: any) {
    return err.stdout?.toString() || err.message;
  }
}

/**
 * getLockStatus
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export function getLockStatus(): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const file of TARGET_FILES) {
    const out = runGit(`ls-files -v ${file}`);
    // 'S' = skip-worktree active, 'H' = normal tracked
    result[file] = out.startsWith('S');
  }
  return result;
}

/**
 * setLock
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export function setLock(lock: boolean): void {
  const flag = lock ? '--skip-worktree' : '--no-skip-worktree';
  for (const file of TARGET_FILES) {
    if (existsSync(join(REPO_ROOT, file))) {
      runGit(`update-index ${flag} ${file}`);
    }
  }
}

function main() {
  const command = process.argv[2] || 'status';

  if (command === 'lock') {
    setLock(true);
    console.log('🔒 [Brand Lock] Successfully locked brand logo files (skip-worktree):');
    TARGET_FILES.forEach((f) => console.log(`   └─ ${f}`));
    console.log('   Git will now ignore local in-place changes to these files (git status remains clean).');
  } else if (command === 'unlock') {
    setLock(false);
    console.log('🔓 [Brand Lock] Successfully unlocked brand logo files:');
    TARGET_FILES.forEach((f) => console.log(`   └─ ${f}`));
    console.log('   Git will track upstream modifications normally.');
  } else {
    const status = getLockStatus();
    console.log('📋 [Brand Lock Status]:');
    for (const [file, isLocked] of Object.entries(status)) {
      console.log(`   ${isLocked ? '🔒 Locked (skip-worktree active)' : '🔓 Unlocked (normal tracking)'}: ${file}`);
    }
  }
}

if (import.meta.main) {
  main();
}
