# Astryx Frontend UI & Anti-Vibecoding Directives

> ⚠️ **MANDATORY UI DIRECTIVE FOR ALL AGENTS**
> Every frontend interface across the SG Forge platform MUST look polished, enterprise-grade, and strictly adhere to the **Astryx Design System (`@forge/ui`)**. Zero amateur / "vibecoded" ad-hoc styling.

---

## 🛑 THE 12 ENTERPRISE ASTRYX UI INVARIANTS

### 1. Zero Ad-Hoc Styling (Mandatory Token Consumption)
- **NEVER** use random hex colors, arbitrary inline styles, or ad-hoc gradients.
- **ALWAYS** consume centralized `--forge-*` CSS custom properties:
  - Backgrounds: `var(--forge-bg-root)`, `var(--forge-bg-surface)`, `var(--forge-bg-card)`, `var(--forge-bg-card-hover)`, `var(--forge-bg-elevated)`
  - Borders: `var(--forge-border)`, `var(--forge-border-medium)`
  - Primary & Accents: `var(--forge-primary)`, `var(--forge-primary-gradient)`, `var(--forge-accent)`
  - Text: `var(--forge-text-main)` (`#f8fafc`), `var(--forge-text-muted)` (`#94a3b8`), `var(--forge-text-subtle)` (`#64748b`)
  - Status: `var(--forge-success)`, `var(--forge-warning)`, `var(--forge-error)`

### 2. 8-Point Mathematical Spacing Scale
- All paddings, margins, gaps, and card dimensions must strictly align with the 8-point modular scale:
  - `4px` (xs), `8px` (sm), `16px` (md), `24px` (lg), `32px` (xl), `48px` (xxl).
- Avoid arbitrary values like `13px`, `19px`, or `27px`.

### 3. High-End Typography & Contrast (WCAG 2.1 AAA)
- Font stack: `-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', 'Segoe UI', Roboto, sans-serif`.
- Headings: Bold (`700` / `800`), calibrated negative letter-spacing (`letter-spacing: -0.02em` to `-0.03em`), line-height `1.15` to `1.25`.
- Body: Normal (`400` / `500`), line-height `1.6`, clean readability.

### 4. Interactive State Machine on All Elements
- Every interactive element (Buttons, Cards, Inputs, Tabs) must have complete, smooth CSS transitions:
  - **Idle**: Clean hairline border with subtle background.
  - **Hover**: Subtle lift (`transform: translateY(-2px)`), border glow, and elevated shadow.
  - **Active / Click**: `transform: translateY(0)` with slight brightness reduction.
  - **Focus-Visible**: High-visibility focus ring (`box-shadow: 0 0 0 2px var(--forge-primary)`).
  - **Disabled**: `opacity: 0.5; cursor: not-allowed; pointer-events: none;`.

### 5. Glassmorphism & Elevation with Discipline
- Use subtle, calibrated backdrop blurs (`backdrop-filter: blur(16px)` to `blur(20px)`).
- Never stack heavy blur layers that degrade GPU performance.
- Hairline border overlay (`1px solid rgba(255, 255, 255, 0.08)`) on all elevated cards.

### 6. Zero Horizontal Scrolling (320px Responsive Guarantee)
- All containers must enforce `max-width: 100%`, `box-sizing: border-box`, `min-width: 0`.
- Text containers must use `overflow-wrap: anywhere` or `word-break: break-word`.
- Grid column tracks must use `minmax(0, 1fr)`.
- Zero horizontal page scroll (`document.documentElement.scrollWidth <= window.innerWidth`) down to 320px viewport.

### 7. Non-Technical End-User POV & Empathetic Feedback
- NEVER expose raw technical stack traces or cryptic HTTP errors (502, 500) to the user.
- Always provide clear, actionable, friendly messages with retry cues.
- Multi-state buttons: *Idle* &rarr; *In-Flight (Spinner)* &rarr; *Success/Error confirmation*.

### 8. Custom Astryx Scrollbars (Zero Browser/OS Defaults)
- **NEVER** let default browser/OS scrollbars render.
- **ALWAYS** enforce custom slim Astryx scrollbars (`::-webkit-scrollbar`, `scrollbar-width: thin`, `scrollbar-color`):
  - Track: `var(--forge-bg-root)` or `transparent`.
  - Thumb: `var(--forge-border-medium)` with rounded radius (`var(--forge-radius-full)`).
  - Hover: `var(--forge-primary)`.
  - High-density scrolling containers (terminals, log viewers, drawers, code blocks, tables) must look sleek and integrated with the dark/light theme.

### 9. Modern Astryx Popups, Modals, Dialogs & Drawers (Zero Native Dialogs)
- **NEVER** use browser `window.confirm()`, `window.prompt()`, or unstyled native `<dialog>` elements.
- **ALWAYS** use Astryx modal and drawer primitives (`.astryx-modal-backdrop`, `.astryx-modal`, `.astryx-modal-header`, `.astryx-modal-body`, `.astryx-modal-footer`, `.astryx-drawer-backdrop`, `.astryx-drawer`):
  - Deep glassmorphic backdrop (`backdrop-filter: blur(16px)`, `background: rgba(0, 0, 0, 0.75)`).
  - Smooth enter/exit transition physics (`scale(0.96) translateY(8px) -> scale(1) translateY(0)` with cubic-bezier `0.16, 1, 0.3, 1`).
  - Viewport-safe bounds: `max-width: min(92vw, 680px)`, `max-height: 88vh`, internal scrollable body with custom slim Astryx scrollbars.
  - Strict keyboard accessibility (`Escape` to close topmost layer, click-outside-to-dismiss, autofocus management).

### 10. Astryx Toast & Notification Engine (Zero Native alert())
- **NEVER** use `window.alert()` or default browser notification alerts.
- **ALWAYS** use modern Astryx Toast notifications (`.astryx-toast`, `.astryx-toast-container`, `window.astryxToast(msg, type, duration)`):
  - 4 status variants: Success (`--forge-success`), Error (`--forge-accent` / `--forge-danger`), Warning (`--forge-warning`), Info (`--forge-primary`).
  - Glassmorphic card styling (`backdrop-filter: blur(20px)`, hairline border `1px solid var(--forge-border-medium)`), auto-dismiss timer progress bar, action buttons, pause-on-hover, and smooth slide-in physics.
  - Viewport placement: bottom-right on desktop (`bottom: 1.5rem; right: 1.5rem; max-width: 420px;`), full-width bottom-center on mobile (`bottom: 1rem; right: 1rem; left: 1rem; width: auto;`).

### 11. Modern Astryx Dropdowns, Popovers & Select Controls (Zero Native OS Menus)
- **NEVER** leave `<select>` elements with unstyled default OS appearance or bright white OS option menus in dark mode.
- **ALWAYS** enhance with custom Astryx glass dropdown primitives (`.astryx-custom-select-wrap`, `.astryx-custom-select-trigger`, `.astryx-custom-select-menu`, `.astryx-custom-select-item`):
  - Styled trigger with custom SVG chevron arrow, `--forge-border` hairline border, and `--forge-primary` focus ring.
  - Floating glassmorphic menu (`background: rgba(18, 20, 26, 0.96)`, `backdrop-filter: blur(20px) saturate(180%)`, deep elevation shadow).
  - Selected item indicators (`✓`), highlight hover states (`rgba(62, 207, 142, 0.14)`), keyboard arrow/enter navigation.
- **Smart Viewport Collision Detection**: All dropdown menus and popovers MUST dynamically calculate viewport bounds upon opening:
  - **Auto-Flip Up**: If remaining space below the trigger is less than menu height, flip upwards (`.drop-up` / `bottom: calc(100% + 5px)`).
  - **Auto-Shift Horizontal**: If menu overflows the right screen edge, align to the right edge (`.align-right` / `right: 0; left: auto`).
  - **Max-Height Clamping**: Clamp `max-height: min(280px, window.innerHeight - 60px)` to guarantee menu stays 100% inside the visible window.

### 12. Strict Portal Single Page Application (SPA) & Responsiveness Invariant
- **Single Page Application**: The portal workspace (`apps/src/portal`) MUST strictly operate as an SPA.
  - Zero full-page hard refreshes when switching between workspace views or admin suite sections.
  - All navigation links must use client-side view switching (`data-view` / `data-nav` and `switchView()`) with URL query parameter history preservation (`history.replaceState`).
  - Active state must persist across tab/view transitions and client-side reload hydration.
- **Fluid Responsiveness**:
  - Fully responsive across desktop (>1024px), tablet (768px-1024px), and mobile (320px-768px).
  - Search trigger, organization pills, user triggers, and cards must seamlessly adapt to viewport width down to 320px with zero horizontal scrollbars.

### 13. Z-Index Layering Hierarchy Standards
- Always enforce standard z-index layers to prevent popovers or dropdowns from being hidden under headers, sidebars, or modals:
  - Base Layout / Cards: `z-index: 1 - 10`
  - Sticky Headers & Sidebars: `z-index: 30 - 50`
  - In-Page Dropdown Menus & Popovers: `z-index: 1000 - 1200`
  - Slideout Drawers: `z-index: 2000 - 2500`
  - Modal Dialogs & Backdrops: `z-index: 3000 - 5000`
  - Floating Tooltips & Popovers: `z-index: 100000`
  - Toast Notifications: `z-index: 9999+`

### 14. Modern Astryx Floating Tooltips & Informational Popovers (Zero Native OS `title` Tooltips)
- **NEVER** rely on browser default `title="..."` tooltips, which produce delayed, unstyled, OS-dependent boxes.
- **ALWAYS** use Astryx custom floating tooltips (`data-astryx-tooltip="..."`, `data-tooltip-title="..."`, `getAstryxTooltipScript()`):
  - Glassmorphic backdrop (`backdrop-filter: blur(16px)`, `background: var(--forge-bg-surface)`).
  - Hairline border (`1px solid var(--forge-border-medium)`), subtle glow, and elevated shadow (`box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45)`).
  - High-visibility typography with primary color title and clean readable text.
  - **Smart Viewport Collision Detection**: Auto-flips UP when near the bottom of the viewport, horizontally clamps to remain 100% visible inside the active viewport window without clipping.
  - Smooth micro-animation (`opacity 0.14s ease, transform 0.14s ease`).

### 15. Universal Astryx Dual-Theme Contract (Dark & Light Parity)
- **Zero Dark-Only Hardcoding**: UI components, cards, tables, toolbars, badges, diagrams, and SVGs MUST NEVER use hardcoded dark colors (e.g. `#111827`, `#0b0f19`, `#171717`, `#1e1b4b`, text `#f3f4f6`, `#ffffff`, `#ededed`, or strokes `rgba(255,255,255,0.1)`) without corresponding `[data-theme="light"]` and `@media (prefers-color-scheme: light)` tokens.
- **Dynamic CSS Properties Only**: All elements must consume `--forge-*` tokens (`--forge-bg-card`, `--forge-bg-surface`, `--forge-border`, `--forge-text-main`, `--forge-text-muted`, `--forge-primary`).
- **Diagram & SVG Theme Invariant**: All vector SVG diagrams embedded in documentation, portal canvases, or standalone viewers must support both dark and light modes:
  - Container backgrounds must dynamically adapt (`--forge-bg-card`, `--forge-bg-surface`).
  - SVG node cards and fills must render light surfaces in light mode (`#ffffff` / `#f8fafc`) with crisp borders (`#e2e8f0`).
  - SVG text labels must render dark readable text (`#0f172a` primary, `#475569` secondary) with $\ge 4.5:1$ WCAG AA contrast against their card backgrounds.
  - Accent colors (emerald, indigo, cyan, amber) must maintain calibrated contrast in both themes.
- **Theme Synchronization Engine**: All micro-apps and documentation portals MUST synchronize theme state across `forge:v1:platform:theme`, `starlight-theme`, and `BroadcastChannel('sg_forge_state_sync_bus')` with zero-FOUC inline head restoration and live MutationObserver listeners.



