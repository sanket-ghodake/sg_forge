---
trigger: always_on
description: Consult Graft for symbol call hierarchies, file skeletons, and code context navigation.
---

## graft

This project integrates Graft (`@nanonets/graft`) as the microscopic code context and symbol dependency graph layer.

### Rules & Workflow:
1. **API Surface & Type Inspection**:
   - Before reading or editing a large source file, run `rtk graft skeleton <path/to/file.ts>` (or `rtk ./run.sh graft skeleton <file>`) to inspect type interfaces, exported functions, and signatures without pulling complete function bodies into context.
2. **Refactoring & Blast Radius Analysis**:
   - Before modifying, renaming, or refactoring an exported function, type, or class, run `rtk graft callers <symbol>` (or with `--direction out` or `--depth <N>`) to trace callers and callees across the monorepo.
   - For staged or working-tree diffs, run `rtk graft blast` to verify impacted code.
3. **Task & Code Navigation**:
   - For targeted task questions (e.g. "where is authentication token validated?", "which file handles proxy generation?"), run `rtk graft ask "<query>"` to retrieve ranked nodes and exact `file:line` locations without blind grepping.
   - Run `rtk graft map` for a token-budgeted overview of directory clusters and central hubs.
4. **Dual-Graph Separation of Concerns**:
   - **Graft (`graft/`)**: Use for code symbols, call graphs, type skeletons, and fast working-tree code diffs.
   - **Graphify (`graphify-out/`)**: Use for high-level architecture comprehension, multimodal documents (PDFs, Markdown docs), community clustering, and Obsidian/HTML visualizations.
5. **Freshness**:
   - Graft checks working-tree file modifications automatically in ~3ms. No manual daemon or external reindexing service is needed.
