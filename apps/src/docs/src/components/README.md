# SG Forge Documentation Custom Astro Components

This directory houses specialized UI components designed for the SG Forge Living Documentation Portal, built with Astryx design tokens and systems traceability requirements.

## Component Catalog

| Component | Role | Usage |
| :--- | :--- | :--- |
| [`ExecutiveCard.astro`](./ExecutiveCard.astro) | Dual-lens executive brief with analogies for non-technical leadership. | `<ExecutiveCard title="..." analogy="..." impact="..." />` |
| [`AudienceTabs.astro`](./AudienceTabs.astro) | Interactive 3-way toggle (Business, Technical, Standards). | `<AudienceTabs><div slot="business">...</div>...</AudienceTabs>` |
| [`TraceabilityBadge.astro`](./TraceabilityBadge.astro) | Status badge linking requirements to implementation and test verification. | `<TraceabilityBadge reqId="LLR-AUTH-001" status="verified" />` |
| [`DiagramEmbed.astro`](./DiagramEmbed.astro) | Native inline vector SVG diagram container with Astryx styling and standalone link. | `<DiagramEmbed diagram="topology" title="..." />` |
| [`DiagramViewer.astro`](./DiagramViewer.astro) | Responsive container for vector SVGs with fallback support. | `<DiagramViewer src="/diagrams/arch.html" title="..." />` |
| [`CoverageMatrix.astro`](./CoverageMatrix.astro) | Live metric scoreboard reading `traceability/coverage-report.json`. | `<CoverageMatrix />` |
| [`DocsHero.astro`](./DocsHero.astro) | Modern documentation hero with Astryx tokens and search trigger. | `<DocsHero />` |
| [`AstryxPageTitle.astro`](./AstryxPageTitle.astro) | Starlight PageTitle override suppressing redundant headers on splash pages. | Starlight component override |

