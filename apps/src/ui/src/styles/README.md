# Astryx Styles Sub-Module (`@forge/ui/styles`)

Modular stylesheet generator sub-modules for Astryx Design System v2.0 (2026 LTS).

## Architecture & Layout
- `base.ts`: Design tokens (`--forge-*`), typography baseline, and custom Astryx scrollbars (`::-webkit-scrollbar`, `scrollbar-width: thin`).
- `components.ts`: Enterprise sticky navigation header, interactive Sun/Moon theme toggler, Astryx card primitives, buttons, badges, and responsive grid layout.
- `overlays.ts`: Modern Astryx dropdowns (`appearance: none`, custom SVG chevron), universal glassmorphic dialog modals (`.astryx-modal-backdrop`), and toast notification containers (`.astryx-toast-container`).
