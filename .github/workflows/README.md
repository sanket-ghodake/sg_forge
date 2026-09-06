# SG Forge CI/CD Workflows

This directory contains the GitHub Actions workflow configurations for the SG Forge enterprise platform.

## Architecture

SG Forge enforces a **single, unified pipeline** ([pipeline.yml](pipeline.yml)) running as one streamlined, end-to-end job in a single runner environment. The `verify-gate.ts` script is the **single source of truth** for all 27 quality gates:

```
[SG Forge Unified CI/CD Pipeline]
  ├── 1. Checkout Code & Setup Bun Runtime (1.3.14)
  ├── 2. Ensure Executable Permissions on All Portables & Scripts
  ├── 3. Frozen Lockfile Install (with Bun Cache) & Environment Setup
  ├── 4. Initialize Isolated Development Databases
  ├── 5. Deterministic 27-Gate Quality Verification (verify-gate.ts)
  │     ├── Gitleaks Secret Audit (160+ Token Rules)
  │     ├── TypeScript Static Compilation (tsc --noEmit)
  │     ├── Biome AST Linter & Formatter
  │     ├── Full 5-Tier Test Suites (bun test across all microservices)
  │     ├── CycloneDX 1.5 SBOM Generation & Validation
  │     ├── Architecture Boundaries, Circular Deps, Type Coverage
  │     ├── Shell Script Safety, WCAG 2.1 AA, PII Redaction
  │     └── + 17 more deterministic checks
  ├── 6. Upload CycloneDX SBOM Artifact
  └── 7. Optional CodeQL Deep Security SAST Analysis (manual trigger)
```

## How to Trigger

| Trigger | When |
|---------|------|
| `workflow_dispatch` | Manual via GitHub UI or CLI |

### Via GitHub CLI (`gh`)
```bash
# Run full pipeline
gh workflow run pipeline.yml --ref main

# Run with CodeQL enabled
gh workflow run pipeline.yml --ref main -f run_codeql=true
```

## Performance & Invariant Optimizations

- **Single Source of Truth**: `verify-gate.ts` runs all 27 checks — zero duplication between pipeline steps.
- **Deterministic Parity**: CI runs the exact same gate as local pre-commit checks.
- **Bun Cache Keying**: Caches `~/.bun/install/cache` against `bun.lock`, enabling sub-2-second installs.
- **Fail-Fast Hierarchy**: Halts in < 10 seconds if secret leaks or syntax issues exist before running heavy analysis.
- **Zero OS Host Modifications**: Portable Bun runtime (1.3.14) with frozen lockfile validation.
