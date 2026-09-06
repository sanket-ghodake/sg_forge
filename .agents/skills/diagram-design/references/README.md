# Diagram Design References (`references/`)

This directory contains modular reference specifications for each visual archetype and design primitive. AI agents load individual reference files dynamically based on the requested diagram type:

- `style-guide.md`: Single source of truth for design tokens (mapped to Astryx `--forge-*` variables).
- `semantic-patterns.md`: Behavioral patterns (Fan-in queues, Paved roads, Compensating security layers).
- `output-spec.md`: Deliverable formats (`html`, `svg`, `png`), sizes, and complexity budgets.
- `export.md`: Procedure for extracting standalone SVG and rendering headless PNGs.
- `type-*.md`: Individual layout grammars for all 39 diagram types.
