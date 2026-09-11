---
trigger: always_on
description: Consult The Council of AI multi-agent decision framework for reviewing proposals, new features, and architectural changes.
---

## council

This project integrates the **Council of AI** decision framework (based on the methodology by Marius Silo / Silotech.xyz) to stress-test ideas, RFCs, and feature proposals against multiple cognitive perspectives.

### Rules & Workflow:
1. **Multi-Agent Perspective Diversity**:
   - Never evaluate major architectural or cross-cutting feature proposals through a single uncritical lens.
   - When asked to review an idea or when invoked via `/council <topic>` or `council review: <topic>`, convene the 4 rounds:
     - **The Skeptic**: Scrutinizes against the 13 Invariants, air-gapped isolation, Turso scoping, maintenance debt, and failure modes.
     - **The Visionary**: Evaluates 10x UX upside, Astryx component synergy, and platform ecosystem moat.
     - **The Pragmatist**: Defines the minimal testable slice (Day-1 MVP), 300-line cap, and 5-tier test path.
     - **The Synthesis**: Formulates the verdict (`GO`, `PIVOT`, or `REJECT`), non-negotiable mitigations, and immediate next action.
2. **Terminal CLI & ADR Generation**:
   - Run `rtk ./run.sh council "<topic>"` to evaluate any proposal directly from the shell with ANSI formatting.
   - Use `rtk ./run.sh council "<topic>" --save` to generate an Architectural Decision Record (ADR) in `logs/council/`.
3. **Zero Host Alterations**:
   - The CLI executes strictly via `portables/bin/council` and the portable Bun runner `scripts/council-runner.ts`.
