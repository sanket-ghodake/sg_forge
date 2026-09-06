# SG Forge Architecture & Traceability Diagrams

Canonical, accessible vector SVG diagrams authored with the `diagram-design` skill and themed with Astryx design tokens (`--forge-*`) are centrally maintained in [`apps/src/docs/public/diagrams/`](apps/src/docs/public/diagrams/).

During compilation, Astro automatically bundles all assets from `public/diagrams/` directly into `dist/diagrams/` to serve them over HTTP at `/docs/diagrams/*.html`.

## Canonical Storage Location
* Single Source of Truth: [`apps/src/docs/public/diagrams/`](apps/src/docs/public/diagrams/)
* Public URL Path: `/docs/diagrams/<filename>.html`

## Verification
Lint all diagrams against accessibility and single-file contracts:
```bash
rtk ./run.sh diagram:lint
```
