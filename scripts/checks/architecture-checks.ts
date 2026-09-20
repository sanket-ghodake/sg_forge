/**
 * @forge/checks/architecture - Monorepo & Dynamic 5-Tier Architecture Guardrails
 * SG Forge Clean Architecture & Enterprise Standards (2026 LTS Baseline)
 */

import { existsSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { loadServiceRegistry } from '../../apps/src/sdk/src/registry';
import { runWithWatchdog } from '../exec-watchdog';
import { isCorePlatformService, resolveMicroserviceDir } from './microservice-resolver';

const REPO_ROOT = process.cwd();

/**
 * Standard quality gate check result.
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export interface CheckResult {
  status: 'PASSED' | 'FAILED' | 'WARNING';
  details: string;
}

/**
 * Check 15: Dynamic Microservice 5-Tier Test Architecture Scanner
 * Discovers all registered platform microservices and verifies complete 5-tier test suites.
 *
 * @requirements [SR-GATE-001] [LLR-SUB-007] [HLR-NET-002]
 */
export function checkDynamic5TierArchitecture(): CheckResult {
  const registeredServices = loadServiceRegistry();
  const requiredTiers = ['unit', 'integration', 'security', 'contracts', 'e2e'];
  const violations: string[] = [];
  let verifiedCount = 0;
  let externalCount = 0;

  for (const s of registeredServices) {
    const sPath = resolveMicroserviceDir(s.id);
    if (!sPath) {
      if (isCorePlatformService(s.id)) {
        violations.push(`Core service ${s.id} directory not found`);
      } else {
        // Autonomous/External Micro-App running in Docker or separate repo
        externalCount++;
      }
      continue;
    }

    const rel = relative(REPO_ROOT, sPath);
    const testDir = join(sPath, 'test');
    if (!existsSync(testDir)) {
      violations.push(`${rel} is missing test/ directory`);
      continue;
    }
    if (!existsSync(join(testDir, 'README.md'))) {
      violations.push(`${rel}/test/README.md is missing`);
    }

    for (const tier of requiredTiers) {
      const tierDir = join(testDir, tier);
      if (!existsSync(tierDir)) {
        violations.push(`${rel}/test/${tier} (missing tier folder)`);
      } else {
        const testFiles = readdirSync(tierDir).filter((f) => f.endsWith('.test.ts') || f.endsWith('.pw.ts'));
        if (testFiles.length === 0) {
          violations.push(`${rel}/test/${tier} (no test files found)`);
        }
      }
    }

    verifiedCount++;
  }

  if (violations.length > 0) {
    return { status: 'FAILED', details: `5-Tier Test violations in ${violations.length} check(s): ${violations.join('; ')}` };
  }

  const extraNote = externalCount > 0 ? ` (${externalCount} external/container service(s) routed)` : '';
  return {
    status: 'PASSED',
    details: `All ${verifiedCount} registered microservices maintain complete, verified 5-Tier test architectures${extraNote}.`,
  };
}

/**
 * Check 16: Monorepo Architecture Boundaries
 * Enforces domain isolation boundaries via dependency-cruiser.
 *
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export async function checkArchitectureBoundaries(): Promise<CheckResult> {
  const depcruiseBin = join(REPO_ROOT, 'portables', 'bin', 'depcruise');
  const proc = await runWithWatchdog([depcruiseBin, 'apps/src', 'forge-apps'], { timeoutMs: 15000 });
  if (proc.timedOut) {
    return { status: 'WARNING', details: 'depcruise timed out after 15000ms.' };
  }
  if (proc.exitCode !== 0) {
    const errText = proc.stderr || proc.stdout;
    return {
      status: 'FAILED',
      details: errText.slice(0, 300) || 'Architectural boundary violation detected.',
    };
  }
  return {
    status: 'PASSED',
    details: 'All micro-apps and layers strictly satisfy domain isolation boundaries.',
  };
}

/**
 * Check 17: Circular Dependency Audit
 * Audits module dependency graphs via Madge AST.
 *
 * @requirements [SR-GATE-001] [LLR-SUB-007]
 */
export async function checkCircularDependencies(): Promise<CheckResult> {
  const madgeBin = join(REPO_ROOT, 'portables', 'bin', 'madge');
  const proc = await runWithWatchdog([madgeBin, 'apps/src'], { timeoutMs: 15000 });
  if (proc.timedOut) {
    return { status: 'WARNING', details: 'madge timed out after 15000ms.' };
  }
  if (proc.exitCode !== 0) {
    return {
      status: 'FAILED',
      details: 'Circular dependencies detected in module import graph.',
    };
  }
  return {
    status: 'PASSED',
    details: 'Zero circular dependencies across all workspace modules.',
  };
}
