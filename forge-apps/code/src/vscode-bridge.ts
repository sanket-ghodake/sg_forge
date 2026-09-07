/**
 * @forge-apps/code - VS Code Server Daemon Bridge (2026 LTS)
 * Manages headless VS Code Web daemon reusing host machine extensions & Copilot setup
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createLogger } from './lib/sdk';

const logger = createLogger('code-vscode-bridge');
const VSCODE_PORT = Number(process.env.VSCODE_PORT || 3090);
const VSCODE_HOST = process.env.VSCODE_HOST || '127.0.0.1';

let daemonProcess: ChildProcess | null = null;
let isStarted = false;

const CANDIDATE_BINARIES = [
  '/snap/code/current/usr/share/code/bin/code-tunnel',
  'code-tunnel',
  '/snap/bin/code',
  'code',
];

/**
 * getVsCodeTargetUrl
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function getVsCodeTargetUrl(repoPath?: string): string {
  const base = '/apps/code/session';
  if (repoPath) {
    return `${base}/?folder=${encodeURIComponent(repoPath)}`;
  }
  return `${base}/`;
}

/**
 * checkVsCodeHealth
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export async function checkVsCodeHealth(): Promise<boolean> {
  const candidateUrls = [
    `http://${VSCODE_HOST}:${VSCODE_PORT}/apps/code/session/`,
    `http://host.docker.internal:${VSCODE_PORT}/apps/code/session/`,
    `http://127.0.0.1:${VSCODE_PORT}/apps/code/session/`,
    `http://localhost:${VSCODE_PORT}/apps/code/session/`,
  ];

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(800),
      });
      if (res.status < 500) return true;
    } catch {
      // Continue to next probe
    }
  }
  return false;
}

function resolveBinary(): string | null {
  for (const bin of CANDIDATE_BINARIES) {
    if (bin.startsWith('/') && existsSync(bin)) {
      return bin;
    }
    if (!bin.startsWith('/')) {
      return bin;
    }
  }
  return null;
}

/**
 * ensureVsCodeDaemon
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export async function ensureVsCodeDaemon(): Promise<{ ready: boolean; port: number; error?: string }> {
  const isHealthy = await checkVsCodeHealth();
  if (isHealthy) {
    return { ready: true, port: VSCODE_PORT };
  }

  if (isStarted && daemonProcess && !daemonProcess.killed) {
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 400));
      if (await checkVsCodeHealth()) return { ready: true, port: VSCODE_PORT };
    }
  }

  const binary = resolveBinary();
  if (!binary) {
    logger.warn('[VSCODE_BOOT] No local VS Code binary found; daemon must run externally on host port 3090');
    return { ready: false, port: VSCODE_PORT, error: 'VS Code binary not found in container' };
  }

  logger.info(`[VSCODE_BOOT] Spawning headless VS Code Web server using ${binary} on port ${VSCODE_PORT}...`);

  try {
    const proc = spawn(
      binary,
      [
        'serve-web',
        '--host',
        '0.0.0.0',
        '--port',
        String(VSCODE_PORT),
        '--without-connection-token',
        '--accept-server-license-terms',
        '--disable-telemetry',
        '--server-base-path',
        '/apps/code/session',
      ],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: true,
      }
    );

    daemonProcess = proc;
    isStarted = true;

    proc.on('error', (err) => {
      logger.warn(`[VSCODE_SPAWN_ERROR] Child process execution error: ${err.message}`);
      isStarted = false;
      daemonProcess = null;
    });

    proc.stdout?.on('data', (data) => {
      logger.info(`[VSCODE_STDOUT] ${data.toString().trim()}`);
    });

    proc.stderr?.on('data', (data) => {
      logger.warn(`[VSCODE_STDERR] ${data.toString().trim()}`);
    });

    proc.on('exit', (code, sig) => {
      logger.warn(`[VSCODE_EXIT] Process exited with code ${code}, signal ${sig}`);
      isStarted = false;
      daemonProcess = null;
    });

    proc.unref();

    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 500));
      if (await checkVsCodeHealth()) {
        logger.info(`[VSCODE_READY] VS Code Web server verified active on port ${VSCODE_PORT}`);
        return { ready: true, port: VSCODE_PORT };
      }
    }

    return { ready: false, port: VSCODE_PORT, error: 'VS Code daemon startup timed out' };
  } catch (err: any) {
    logger.error(`[VSCODE_SPAWN_ERROR] Failed to spawn VS Code: ${err.message}`);
    return { ready: false, port: VSCODE_PORT, error: err.message };
  }
}

/**
 * stopVsCodeDaemon
 * @requirements [HLR-CODE-701] [LLR-SUB-003]
 */
export function stopVsCodeDaemon(): void {
  if (daemonProcess && !daemonProcess.killed) {
    logger.info('[VSCODE_SHUTDOWN] Terminating VS Code Web daemon...');
    try {
      daemonProcess.kill('SIGTERM');
    } catch {
      // ignore
    }
  }
}
