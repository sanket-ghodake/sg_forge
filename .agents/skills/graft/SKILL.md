---
name: graft
description: "Use Graft for fine-grained symbol call graphs, API skeletons, blast radius impact, and codebase navigation to reduce token consumption and eliminate repetitive grepping."
---

# /graft

Context layer for codebases: symbol-level dependency graphs, type/API skeletons, and blast radius auditing.

## When to use
- Finding who calls or references a symbol across packages (`rtk graft callers <symbol>`)
- Viewing the API skeleton (functions, classes, interfaces without bodies) of a file (`rtk graft skeleton <path>`)
- Getting exact file:line references for a specific task (`rtk graft ask "<query>"`)
- Checking the blast radius of a change before or during review (`rtk graft blast`)
- Getting a token-budgeted map of code hubs and hotspots (`rtk graft map`)

## Usage

```bash
# Build/refresh graph ($0, no external LLM key needed for Tier 1 wiring)
rtk ./run.sh graft build

# Orientation map
rtk ./run.sh graft map

# Call hierarchy
rtk ./run.sh graft callers <symbol>
rtk ./run.sh graft callers <symbol> --direction out
rtk ./run.sh graft callers <symbol> --depth 2

# Signatures & types of a single file
rtk ./run.sh graft skeleton apps/src/sdk/src/index.ts

# Ask a task-focused question
rtk ./run.sh graft ask "how is authentication cookie verified"

# Check diff blast radius
rtk ./run.sh graft blast --format markdown
```
