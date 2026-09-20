/**
 * @forge/verify-checks - Extended Tier 1 Deterministic Tool Runners
 * Integrates open-source portable tools with non-blocking watchdog timeouts
 * and air-gapped zero-egress execution guarantees (2026 LTS Baseline).
 *
 * Clean Architecture Modular Dispatcher (<100 Lines, Strict Domain Isolation)
 */

export type { CheckResult } from './checks/architecture-checks';
export {
  resolveMicroserviceDir,
  isCorePlatformService,
} from './checks/microservice-resolver';

export {
  checkDynamic5TierArchitecture,
  checkArchitectureBoundaries,
  checkCircularDependencies,
} from './checks/architecture-checks';

export {
  checkSemgrepInvariants,
  checkOsvVulnerabilities,
  checkTrivySecurity,
  checkDependencyLicenses,
  checkSyftSbomIntegrity,
} from './checks/security-checks';

export {
  checkTypeCoverage,
  checkShellScripts,
  checkAxeAccessibility,
  checkSpectralContracts,
  checkCodeComplexity,
  checkForgeAppSubmoduleCompliance,
  checkSystemTraceability,
} from './checks/code-quality-checks';
