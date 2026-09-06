#!/usr/bin/env bun
/**
 * Dynamic Native Development Supervisor (2026 LTS)
 * Automatically discovers all registered microservices from .env via @forge/sdk,
 * detects port collisions, manages process lifetimes, and handles clean SIGINT/Ctrl+C termination.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Subprocess } from 'bun';
import { loadBrandConfig, loadServiceRegistry, type ServiceEntry } from '../apps/src/sdk/src';
import { generateCaddyfile } from './generate-proxy';

const REPO_ROOT = process.cwd();
const brand = loadBrandConfig();

interface ResolvedService {
  service: ServiceEntry;
  entryPath: string;
}

/**
 * Resolves the server entrypoint file path for a registered service.
 */
function resolveEntrypoint(service: ServiceEntry): string | null {
  if (service.isExternal) {
    return null;
  }

  const candidates = [
    join(REPO_ROOT, 'apps', 'src', service.id, 'src', 'server.ts'),
    join(REPO_ROOT, 'forge-apps', service.id, 'src', 'server.ts'),
    join(REPO_ROOT, 'apps', 'src', service.containerName, 'src', 'server.ts'),
    join(REPO_ROOT, 'forge-apps', service.containerName.replace(/^app-/, ''), 'src', 'server.ts'),
    join(REPO_ROOT, service.containerName, 'src', 'server.ts'),
  ];

  if (service.id === 'landing') {
    candidates.length = 0;
    if (service.containerName === 'landing') {
      candidates.push(join(REPO_ROOT, 'apps', 'src', 'landing', 'src', 'server.ts'));
    } else if (service.containerName === 'landing-custom') {
      candidates.push(join(REPO_ROOT, 'apps', 'src', 'landing-custom', 'src', 'server.ts'));
    } else {
      candidates.push(join(REPO_ROOT, service.containerName, 'src', 'server.ts'));
    }
  }

  if (service.id === 'devcenter') {
    candidates.unshift(join(REPO_ROOT, 'apps', 'src', 'dev-dashboard', 'src', 'server.ts'));
  }
  if (service.id === 'gateway') {
    candidates.unshift(join(REPO_ROOT, 'apps', 'src', 'dev-hub', 'src', 'server.ts'));
  }

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

/**
 * Checks if a TCP port is currently open and accepting connections.
 */
async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const socket = Bun.connect({
        hostname: '127.0.0.1',
        port,
        socket: {
          open(s) {
            s.end();
            resolve(true);
          },
          error() {
            resolve(false);
          },
          connectError() {
            resolve(false);
          },
        },
      });
      // Safety timeout
      setTimeout(() => resolve(false), 200);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Main supervisor execution flow.
 */
async function main() {
  const targetFilter = process.argv[2]?.trim().toLowerCase();

  console.log(`🔀 [${brand.name}] Synchronizing dynamic reverse proxy routes from .env...`);
  generateCaddyfile();

  const allServices = loadServiceRegistry();
  const resolvedList: ResolvedService[] = [];

  for (const s of allServices) {
    if (s.isExternal) continue;

    if (targetFilter) {
      const match =
        s.id.toLowerCase() === targetFilter ||
        s.name.toLowerCase().includes(targetFilter) ||
        s.containerName.toLowerCase() === targetFilter;
      if (!match) continue;
    }

    const entry = resolveEntrypoint(s);
    if (entry) {
      resolvedList.push({ service: s, entryPath: entry });
    } else {
      console.warn(`⚠️ [${brand.name}] No server.ts found for service '${s.id}' (${s.name})`);
    }
  }

  if (resolvedList.length === 0) {
    if (targetFilter) {
      console.error(`❌ No microservice matching '${targetFilter}' found in registry.`);
      console.log(`Available services: ${allServices.map((s) => s.id).join(', ')}`);
    } else {
      console.error(`❌ No runnable microservices found in registry.`);
    }
    process.exit(1);
  }

  // Pre-flight Port Collision Check
  console.log(`🩺 [${brand.name}] Checking port availability for ${resolvedList.length} services...`);
  const occupiedPorts: number[] = [];
  for (const item of resolvedList) {
    if (await isPortInUse(item.service.port)) {
      occupiedPorts.push(item.service.port);
      console.warn(`⚠️  Port ${item.service.port} (${item.service.name}) is ALREADY in use by another process.`);
    }
  }

  if (occupiedPorts.length > 0) {
    console.warn(`\n⚠️  Some target ports (${occupiedPorts.join(', ')}) are occupied.`);
    console.warn(`   If previous instances are running, stop them or run './run.sh docker down'. Continuing startup...\n`);
  }

  console.log(`🚀 [${brand.name}] Launching ${resolvedList.length} microservices natively...`);
  for (const item of resolvedList) {
    console.log(`   ├─ ${item.service.name.padEnd(32)} Port: :${item.service.port} (${item.service.path})`);
  }
  console.log(`\n💡 Press Ctrl+C at any time to gracefully terminate all child processes.\n`);

  const children: Subprocess[] = [];
  let isShuttingDown = false;

  const shutdownAll = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`\n🛑 [${brand.name}] Gracefully terminating ${children.length} microservices...`);
    for (const child of children) {
      try {
        if (process.platform === 'win32') {
          child.kill();
        } else {
          child.kill(15); // SIGTERM
        }
      } catch {
        // Process might already be dead
      }
    }
    setTimeout(() => {
      for (const child of children) {
        try {
          child.kill(9); // SIGKILL fallback
        } catch {
          // Ignore
        }
      }
      console.log(`✨ [${brand.name}] All development processes stopped cleanly.`);
      process.exit(0);
    }, 400);
  };

  process.on('SIGINT', shutdownAll);
  process.on('SIGTERM', shutdownAll);
  if (process.platform !== 'win32') {
    process.on('SIGHUP', shutdownAll);
  }

  for (const item of resolvedList) {
    try {
      const child = Bun.spawn([process.execPath, 'run', item.entryPath], {
        stdout: 'inherit',
        stderr: 'inherit',
        env: {
          ...process.env,
          PORT: String(item.service.port),
          SERVICE_ID: item.service.id,
          SERVICE_NAME: item.service.name,
        },
      });
      children.push(child);
    } catch (err) {
      console.error(`❌ Failed to spawn ${item.service.name}:`, err);
    }
  }

  // Await all children to exit
  await Promise.all(children.map((c) => c.exited));
  if (!isShuttingDown) {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal dev runner error:', err);
  process.exit(1);
});
