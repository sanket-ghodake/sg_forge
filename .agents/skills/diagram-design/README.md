# Diagram Design Skill (`.agents/skills/diagram-design/`)

> **39 Visual Diagram Archetypes for SG Forge (Astryx Edition)**
> Self-contained HTML + inline SVG. Zero external JS. Zero shadows. Zero generic Mermaid slop.

---

## 🧭 Purpose & Capabilities

This skill enables AI agents (Antigravity, Claude, Cursor, Copilot) to generate publication-grade, human-designed architectural and data schematics directly within the SG Forge monorepo and its autonomous Forge App submodules.

### Key Features:
- **39 Visual Archetypes**: Complete specifications for `architecture`, `sequence`, `db-schema`, `data-flow`, `state`, `deployment`, `layers`, `sankey`, `kanban`, `journey`, and more.
- **Astryx Token Integration**: Configured via `references/style-guide.md` and the root `.diagram-design` marker to automatically use `--forge-*` brand colors (Indigo accent, dark/light surface tokens).
- **Zero Host Modification**: Renders pure HTML + SVG. No npm installation or build pipeline required for browser viewing.
- **Deterministic AST Linting**: Validated with `scripts/self_check.py` to enforce orthogonal routing, label masking, and the strict $\le 4/10$ complexity budget.

---

## 📁 Directory Structure

- `SKILL.md`: Core agent instructions and decision routing engine.
- `references/`: 40+ modular specifications loaded on-demand per diagram type.
- `scripts/`: AST extractors and self-check linter (`self_check.py`, `mermaid_extract.py`, `drawio_extract.py`).
- `assets/`: Interactive gallery and sample previews.

---

## 📜 Attribution & License

- **Upstream Project**: [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design)
- **Author**: Cathryn Lavery
- **License**: MIT License
