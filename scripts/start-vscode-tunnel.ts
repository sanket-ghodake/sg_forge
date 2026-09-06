#!/usr/bin/env bun
/**
 * @forge/scripts - VS Code Web Headless Daemon Launcher (2026 LTS)
 * Starts and maintains the host code-tunnel serve-web daemon for @forge-apps/code
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, openSync } from 'node:fs';
import { join } from 'node:path';

const PORT = Number(process.env.VSCODE_PORT || 3090);
const BASE_PATH = '/apps/code/session';

const CANDIDATES = [
  '/snap/code/current/usr/share/code/bin/code-tunnel',
  'code-tunnel',
  '/snap/bin/code',
  'code',
];

async function isAlive(): Promise<boolean> {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}${BASE_PATH}/`, {
      method: 'GET',
      signal: AbortSignal.timeout(1000),
    });
    return res.status < 500;
  } catch {
    return false;
  }
}

function findBinary(): string | null {
  for (const p of CANDIDATES) {
    if (p.startsWith('/') && existsSync(p)) return p;
    if (!p.startsWith('/')) return p;
  }
  return null;
}

async function main() {
  if (await isAlive()) {
    console.log(`[VS Code Daemon] Already active and healthy on port ${PORT}${BASE_PATH}`);
    process.exit(0);
  }

  const binary = findBinary();
  if (!binary) {
    console.error('[VS Code Daemon] Error: No code or code-tunnel binary found on system');
    process.exit(1);
  }

  console.log(`[VS Code Daemon] Launching headless web server using ${binary} on port ${PORT}...`);

  const logDir = join(import.meta.dir, '..', 'forge-apps', 'code', 'logs');
  mkdirSync(logDir, { recursive: true });
  const outLog = openSync(join(logDir, 'daemon.log'), 'a');

  const proc = spawn(
    binary,
    [
      'serve-web',
      '--host', '0.0.0.0',
      '--port', String(PORT),
      '--without-connection-token',
      '--accept-server-license-terms',
      '--disable-telemetry',
      '--server-base-path', BASE_PATH,
    ],
    {
      stdio: ['ignore', outLog, outLog],
      detached: true,
    }
  );

  proc.on('error', (err) => {
    console.error(`[VS Code Daemon] Spawn error: ${err.message}`);
    process.exit(1);
  });

  proc.unref();

  // Wait for health check with 15s timeout
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await isAlive()) {
      console.log(`[VS Code Daemon] Successfully started in background on http://127.0.0.1:${PORT}${BASE_PATH}`);
      process.exit(0);
    }
  }

  console.error('[VS Code Daemon] Failed to start daemon within 15 seconds. Check forge-apps/code/logs/daemon.log');
  process.exit(1);
}

if (import.meta.main) {
  main();
}
