#!/usr/bin/env bun
/**
 * @forge/scripts/harden-storage - Cross-Platform Storage Permission & Key Hardening Engine (2026 LTS)
 *
 * Capabilities:
 * 1. Linux/macOS/WSL: Enforces strict POSIX permissions (chmod 700 on data dirs, chmod 600 on DB files)
 * 2. Windows/NTFS: Restricts file ACLs via icacls (exclusive owner & SYSTEM access)
 * 3. Cryptographic Key Generator: Generates cryptographically secure 256-bit AES keys
 */

import { chmodSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { generateCryptographicKey } from '../apps/src/sdk/src/crypto';

const REPO_ROOT = process.cwd();
const isWindows = process.platform === 'win32';

interface HardeningResult {
  directoriesProtected: string[];
  filesProtected: string[];
  errors: string[];
}

function hardenDirectoryPosix(dirPath: string, result: HardeningResult): void {
  if (!existsSync(dirPath)) return;
  try {
    chmodSync(dirPath, 0o700);
    result.directoriesProtected.push(dirPath);

    const entries = readdirSync(dirPath);
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        hardenDirectoryPosix(fullPath, result);
      } else if (entry.endsWith('.db') || entry.includes('.db-') || entry.endsWith('.enc') || entry.endsWith('.key')) {
        chmodSync(fullPath, 0o600);
        result.filesProtected.push(fullPath);
      }
    }
  } catch (err: any) {
    result.errors.push(`${dirPath}: ${err.message}`);
  }
}

async function hardenWindowsAcl(targetPath: string): Promise<boolean> {
  try {
    // Windows NTFS ACL hardening using icacls: remove inherited permissions and grant full to current user
    const username = process.env.USERNAME || 'Administrators';
    const proc = Bun.spawnSync(['icacls', targetPath, '/inheritance:r', '/grant:r', `${username}:(OI)(CI)F`]);
    return proc.exitCode === 0;
  } catch {
    return false;
  }
}

/**
 * runStorageHardening
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export async function runStorageHardening(): Promise<HardeningResult> {
  const result: HardeningResult = {
    directoriesProtected: [],
    filesProtected: [],
    errors: [],
  };

  const targetDirs = [
    join(REPO_ROOT, 'apps', 'data'),
    join(REPO_ROOT, 'data'),
    join(REPO_ROOT, 'backups'),
  ];

  for (const dir of targetDirs) {
    if (existsSync(dir)) {
      if (isWindows) {
        const ok = await hardenWindowsAcl(dir);
        if (ok) result.directoriesProtected.push(dir);
        else result.errors.push(`Windows icacls failed on ${dir}`);
      } else {
        hardenDirectoryPosix(dir, result);
      }
    }
  }

  return result;
}

// CLI Execution
if (import.meta.main) {
  const args = process.argv.slice(2);

  if (args.includes('--gen-key')) {
    console.log('======================================================================');
    console.log('🔑 SG Forge Cryptographic Key Generator (256-bit AES-GCM)');
    console.log('======================================================================');
    const newKey = generateCryptographicKey();
    console.log(`Generated Key: ${newKey}`);
    console.log('\nCopy and paste this into your .env file as:');
    console.log(`DATA_ENCRYPTION_KEY="${newKey}"`);
    console.log('======================================================================');
    process.exit(0);
  }

  console.log('======================================================================');
  console.log(`🛡️ Hardening Database Storage Permissions (OS: ${process.platform})`);
  console.log('======================================================================');

  runStorageHardening().then((res) => {
    console.log(`✅ Directories Locked: ${res.directoriesProtected.length}`);
    for (const d of res.directoriesProtected) console.log(`   📁 ${d}`);

    console.log(`✅ Files Secured (chmod 600): ${res.filesProtected.length}`);
    for (const f of res.filesProtected) console.log(`   🔒 ${f}`);

    if (res.errors.length > 0) {
      console.log(`⚠️ Warnings/Errors: ${res.errors.length}`);
      for (const e of res.errors) console.log(`   ❌ ${e}`);
    }

    console.log('\n✨ Database storage permission hardening completed successfully.');
  });
}
