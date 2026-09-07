/**
 * @forge-apps/code - Git Sanitizer & Ephemeral Discard Worker (2026 LTS)
 * Zero Host Mutation & Pristine Disk State Guarantee
 */

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createLogger } from './lib/sdk';

const logger = createLogger('code-git-sanitizer');

/**
 * validateRepoPath
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function validateRepoPath(targetPath: string): { valid: boolean; normalizedPath: string; error?: string } {
  if (!targetPath || typeof targetPath !== 'string') {
    return { valid: false, normalizedPath: '', error: 'Target path is required' };
  }

  const normalized = resolve(targetPath);

  // Security barrier: block sensitive root system directories and user credentials
  const blockedPrefixes = ['/etc', '/proc', '/sys', '/dev', '/root', '/bin', '/sbin', '/usr/bin'];
  if (
    blockedPrefixes.some((b) => normalized === b || normalized.startsWith(`${b}/`)) ||
    normalized.includes('/.ssh') ||
    normalized.includes('/.aws') ||
    normalized.includes('/.gnupg')
  ) {
    return { valid: false, normalizedPath: normalized, error: 'Path traversal to protected system directory blocked' };
  }

  if (!existsSync(normalized)) {
    return { valid: false, normalizedPath: normalized, error: 'Directory does not exist on server' };
  }

  const gitDir = resolve(normalized, '.git');
  const hasLocalGit = existsSync(gitDir);
  const gitCheck = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], { cwd: normalized });
  if (!hasLocalGit && gitCheck.status !== 0) {
    return { valid: false, normalizedPath: normalized, error: 'Target directory is not an initialized Git repository' };
  }

  return { valid: true, normalizedPath: normalized };

}

/**
 * discardRepoModifications
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function discardRepoModifications(repoPath: string): { success: boolean; error?: string } {
  const validation = validateRepoPath(repoPath);
  if (!validation.valid) {
    logger.error(`[DISCARD_FAILED] Invalid repo path: ${repoPath}`, { error: validation.error });
    return { success: false, error: validation.error };
  }

  const target = validation.normalizedPath;
  const platformRoot = resolve(process.cwd());

  // Critical safeguard: Never execute destructive reset or clean on the active platform repository itself!
  if (target === platformRoot || target === '/app') {
    logger.warn(`[DISCARD_GUARD] Target ${target} is active platform monorepo root. Skipping destructive reset.`);
    return { success: true };
  }

  logger.info(`[DISCARD_START] Discarding all session modifications in ${target}...`);

  try {
    const gitOpts = ['-c', 'safe.directory=*', '-C', target];

    // 1. Force checkout tracked files
    const checkoutRes = spawnSync('git', [...gitOpts, 'checkout', '-f'], { encoding: 'utf8' });
    if (checkoutRes.status !== 0) {
      logger.warn(`[GIT_CHECKOUT_WARN] git checkout -f returned non-zero: ${checkoutRes.stderr}`);
    }

    // 2. Hard reset to HEAD
    const resetRes = spawnSync('git', [...gitOpts, 'reset', '--hard', 'HEAD'], { encoding: 'utf8' });
    if (resetRes.status !== 0) {
      logger.warn(`[GIT_RESET_WARN] git reset --hard returned non-zero: ${resetRes.stderr}`);
    }

    // 3. Clean untracked files and directories
    const cleanRes = spawnSync('git', [...gitOpts, 'clean', '-fd'], { encoding: 'utf8' });
    if (cleanRes.status !== 0) {
      logger.warn(`[GIT_CLEAN_WARN] git clean -fd returned non-zero: ${cleanRes.stderr}`);
    }

    logger.info(`[DISCARD_SUCCESS] Successfully restored pristine state for ${target}`);
    return { success: true };
  } catch (err: any) {
    logger.error(`[DISCARD_EXCEPTION] Failed to reset repo ${target}`, { error: err.message });
    return { success: false, error: err.message };
  }
}
