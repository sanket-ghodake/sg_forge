# Telemetry Forge App - Portable Toolchain

This directory contains standalone, isolated toolchain wrappers and runtimes enabling cross-platform, zero-host-modification local development.

## Structure
- `bin/`: POSIX and Windows executable shims (`rtk`, `codeburn`, `council`, `headroom`).
- `bun/`: Isolated, zero-host Bun runtime binaries for self-contained package execution.

## Invariant Compliance
Conforms strictly to SG Forge Invariant #2: Zero Host Modification & Cross-Platform Toolchain. All tooling executes via repo-local binaries.
