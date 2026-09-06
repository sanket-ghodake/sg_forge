# Living Engineering Standards & System Traceability (Enterprise Architecture Standards & Enterprise C4 Standard)

> **Mandatory Code-to-Doc Parity Standard across SG Forge Monorepo and all Autonomous Forge Apps**

---

## 1. 5-Tier System Traceability Hierarchy
Every capability within the platform must belong to the bidirectional traceability chain:
1. **System Requirements (SR)**: Platform-wide guarantees (Air-Gap, Turso Isolation, Zero-Trust Auth). Located in `docs/sr/`.
2. **High-Level Requirements (HLR)**: Subsystem and service-level responsibilities. Located in `docs/hlr/`.
3. **Low-Level Requirements (LLR)**: Component specifications, exact algorithmic behavior, parameters, RFC 7807 error boundaries, and state machines. Located in `docs/llr/`.
4. **Source Code Symbols**: Exported functions, classes, and types carrying `@requirements [LLR-...]` TSDoc tags.
5. **Automated Verification**: Test cases referencing the requirement ID across the 5-tier test architecture in `test/` or submodule `test/`.

---

## 2. Exported Symbol TSDoc Annotation Standard
All exported functions, classes, and interfaces MUST declare their traceability metadata:

```typescript
/**
 * Brief summary of function responsibility.
 * 
 * @requirements [HLR-AUTH-101] [LLR-AUTH-001]
 * @param paramName - Description of input parameter
 * @returns Description of return value
 * @throws {ProblemDetails} RFC 7807 error response condition
 * @complexity Time: O(1), Space: O(1)
 */
```

---

## 3. Editorial Diagramming Standard (`diagram-design`)
- **Zero Mermaid Slop**: All architecture, sequence, data-flow, and database schematics must be created using the `diagram-design` skill (`.agents/skills/diagram-design/`).
- **Astryx Tokens**: Schematics must strictly consume `--forge-*` brand colors (Indigo `#6366f1` / `#818cf8`, dark `#090d16`, light `#f8fafc`).
- **Universal Dual-Theme Parity (Dark & Light)**: All diagrams, SVGs, and interactive visual components MUST strictly support both dark and light themes with 100% WCAG AA contrast compliance:
  - Standalone HTML diagrams must include `@media (prefers-color-scheme: light)` and `[data-theme="light"]` token overrides (switching canvas backgrounds to `#ffffff`, node fills to white/light surfaces, borders to `#e2e8f0`, and text to high-contrast `#0f172a` / `#475569`).
  - Embedded SVG diagrams in documentation must adhere to Astryx generic SVG remapping rules without hardcoded dark-only colors or white-on-white text regressions.
- **Complexity Budget**: Density must not exceed 4/10. Orthogonal connectors only; arrow text must have opaque masking rects.
- **Validation**: Generated diagrams must pass `python3 scripts/diagrams/self_check.py <file.html>`.

---

## 4. Automated Verification Gate
- Run `rtk ./run.sh docs:coverage` before staging changes.
- Pre-commit gate (Gate 29) automatically scans staged TypeScript files and enforces that new exported symbols carry valid requirement tags and existing documents.
