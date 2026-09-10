# Portable Binaries & Tool Wrappers (Submodule Toolchain)

This directory contains standalone, self-resolving POSIX executable wrappers for development, code intelligence, AI token tracking, and context compression tools.

## Included Tools

| Tool | Purpose | Upstream |
| :--- | :--- | :--- |
| `rtk` | Terminal token compression and command optimization | Local / Monorepo Portable |
| `graft` | Code context and symbol dependency graph engine | [@nanonets/graft](https://github.com/trailhq/Graft) |
| `codeburn` | AI token and lifetime spend tracker | [getagentseal/codeburn](https://github.com/getagentseal/codeburn) |
| `headroom` | Context and prompt compression engine | [headroomlabs-ai/headroom](https://github.com/headroomlabs-ai/headroom) |

## Self-Resolving Execution Strategy

Every wrapper operates autonomously following this resolution hierarchy:
1. **Local Submodule**: Checks `node_modules/.bin/<tool>` or local virtual environment.
2. **Monorepo Parent**: If running within the SG Forge monorepo, resolves `../../portables/bin/<tool>`.
3. **Host System**: Uses system installation if present.
4. **Fallback Runtime**: Executes non-destructive portable fallback via Bun or npx without global host modifications.
