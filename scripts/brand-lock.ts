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

const TARGET_GROUPS: Record<string, string[]> = {
  logo: ['public/brand/logo.png', 'public/brand/logo.svg'],
  landing: ['apps/src/landing/src/server.ts'],
};

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
export function getLockStatus(group: string = 'logo'): Record<string, boolean> {
  const files = TARGET_GROUPS[group] || TARGET_GROUPS.logo;
  const result: Record<string, boolean> = {};
  for (const file of files) {
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
export function setLock(lock: boolean, group: string = 'logo'): void {
  const flag = lock ? '--skip-worktree' : '--no-skip-worktree';
  const files = TARGET_GROUPS[group] || TARGET_GROUPS.logo;
  for (const file of files) {
    if (existsSync(join(REPO_ROOT, file))) {
      runGit(`update-index ${flag} ${file}`);
    }
  }
}

function main() {
  let command = process.argv[2] || 'status';
  let target = process.argv[3] || 'logo';

  if (command === 'lock-landing') {
    command = 'lock';
    target = 'landing';
  } else if (command === 'unlock-landing') {
    command = 'unlock';
    target = 'landing';
  } else if (command === 'landing-status') {
    command = 'status';
    target = 'landing';
  }

  const files = TARGET_GROUPS[target] || TARGET_GROUPS.logo;

  if (command === 'lock') {
    setLock(true, target);
    console.log(`🔒 [Asset Lock] Successfully locked ${target} files (skip-worktree):`);
    files.forEach((f) => console.log(`   └─ ${f}`));
    console.log('   Git will now ignore local in-place changes to these files (git status remains clean).');
  } else if (command === 'unlock') {
    setLock(false, target);
    console.log(`🔓 [Asset Lock] Successfully unlocked ${target} files:`);
    files.forEach((f) => console.log(`   └─ ${f}`));
    console.log('   Git will track upstream modifications normally.');
  } else {
    const status = getLockStatus(target);
    const label = target === 'logo' ? 'Brand Lock Status' : `${target.toUpperCase()} Lock Status`;
    console.log(`📋 [${label}]:`);
    for (const [file, isLocked] of Object.entries(status)) {
      console.log(`   ${isLocked ? '🔒 Locked (skip-worktree active)' : '🔓 Unlocked (normal tracking)'}: ${file}`);
    }
  }
}

if (import.meta.main) {
  main();
}
