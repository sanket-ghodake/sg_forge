# Telemetry Forge App - Lifecycle Scripts

This directory contains standalone utility scripts for verification, maintenance, and synchronization of the Telemetry forge app.

## Available Scripts
- `verify-gate.ts`: Pre-flight compliance validator verifying multi-tier testing, linting, licensing, and folder structure.
- `sync-ignores.ts`: Contextual ignore auditor keeping `.gitignore` and `.dockerignore` aligned with runtime artifacts.
- `append-worklog.ts`: Worklog management tool ensuring automated trace updates in `logs/WORKLOGS.md`.

## Usage
Run scripts via portable Bun:
```bash
rtk bun scripts/verify-gate.ts
```
