# SG Forge CLI Modular Orchestrator (`scripts/run`)

This directory houses the modular domain runners for the root `run.sh` CLI dispatcher.

## Architecture

Following the 2026 Clean Architecture standards and the monorepo 500-line soft file cap, the platform CLI is divided into cohesive, single-responsibility modules:

- **`env.sh`**: Bulletproof cross-platform runtime resolver (portable Bun, RTK, `.env` dynamic extraction, CPU architecture detection).
- **`help.sh`**: Centralized CLI documentation banner and command discovery index.
- **`core.sh`**: Core local development, certificate generation, scaffolding, database initialization, and pre-flight diagnostics.
- **`docker.sh`**: Container lifecycle orchestration, profile management, logs, and real-time container metrics (`ctop`, `monitor`).
- **`quality.sh`**: Deterministic verification gates, SAST, linters, license governance, complexity checkers, and security scanners.
- **`ops.sh`**: Production deployment, instant rollbacks, live-safe snapshot backups, key generation, and storage hardening.

## Direct Execution vs Root Dispatcher

Commands can be invoked directly from the root CLI:
```bash
./run.sh <command> [options]
```

Or specific modules can be sourced directly within automated pipelines:
```bash
source scripts/run/env.sh
scripts/run/quality.sh verify
```
