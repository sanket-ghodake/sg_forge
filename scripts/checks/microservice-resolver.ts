/**
 * @forge/checks/microservice-resolver - Autonomous Microservice Resolution Engine
 * SG Forge Clean Architecture & Enterprise Standards (2026 LTS Baseline)
 *
 * Responsibilities:
 * - Dynamically resolves microservice source paths across core apps, monorepo submodules,
 *   and autonomous sibling workspaces (e.g. ../forge-app/<id>).
 * - Distinguishes between local resident services and external/containerized microservices.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = process.cwd();

/**
 * Resolves the physical filesystem directory of a microservice by identifier.
 * Checks core apps, local submodules, and autonomous sibling development workspaces.
 *
 * @requirements [SR-GATE-001] [LLR-SUB-007] [HLR-NET-002]
 */
export function resolveMicroserviceDir(serviceId: string): string | null {
  // 1. Check direct core platform apps (/apps/src/<id>)
  const directApp = join(REPO_ROOT, 'apps', 'src', serviceId);
  if (existsSync(directApp)) return directApp;

  // 2. Check core platform app aliases
  if (serviceId === 'devcenter') {
    const devDash = join(REPO_ROOT, 'apps', 'src', 'dev-dashboard');
    if (existsSync(devDash)) return devDash;
  }
  if (serviceId === 'gateway') {
    const devHub = join(REPO_ROOT, 'apps', 'src', 'dev-hub');
    if (existsSync(devHub)) return devHub;
  }

  // 3. Check monorepo Forge App submodule path (/forge-apps/<id>)
  const forgeApp = join(REPO_ROOT, 'forge-apps', serviceId);
  if (existsSync(forgeApp)) return forgeApp;

  // 4. Check autonomous sibling Forge App workspaces (e.g. ../forge-app/<id> or ../<id>)
  const siblingForgeApp = join(REPO_ROOT, '..', 'forge-app', serviceId);
  if (existsSync(siblingForgeApp)) return siblingForgeApp;

  const siblingDirectApp = join(REPO_ROOT, '..', serviceId);
  if (existsSync(siblingDirectApp) && existsSync(join(siblingDirectApp, 'package.json'))) {
    return siblingDirectApp;
  }

  return null;
}

/**
 * Evaluates whether a service is a core platform service that MUST reside locally in the monorepo.
 *
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export function isCorePlatformService(serviceId: string): boolean {
  const coreServices = new Set(['landing', 'portal', 'devcenter', 'gateway', 'auth', 'docs']);
  return coreServices.has(serviceId.toLowerCase());
}
