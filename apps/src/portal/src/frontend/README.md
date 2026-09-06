# 🎨 Portal Frontend UI Architecture (`@forge/portal/frontend`)

Modular, accessible, and performant frontend presentation layer for SG Forge Portal (2026 LTS).

---

## 🏛️ Component Architecture

1. **`layout-header.ts`**: Top navigation bar with multi-tenant branding, search trigger (`⌘K`), theme switcher, and user avatar popover.
2. **`layout-sidebar.ts`**: Auto-collapsible sidebar with precision monochrome icons, hover-peek, and role-guarded Admin Console.
3. **`ui-renderer-canvas.ts`**: 2D Org Map & interactive visual hierarchy canvas.
4. **`ui-renderer-apps.ts`**: Apps & Tools Hub with active tools, elevated access requests, and personal pinning.
5. **`ui-apps-data.ts`**: Canonical definitions and catalog for active and requestable applications.
6. **`ui-apps-scripts.ts`**: Interactive client controller for tab navigation, pinning, search/filter, and access requests.
7. **`ui-renderer-profile.ts`**: Personal profile, assigned IAM scopes, active session revocation, and PAT generator.
8. **`ui-renderer-inbox.ts`**: Announcements & notifications feed with priority badges.
9. **`ui-admin-members.ts`**: Team & Member management with employee roster table and invite modal.
10. **`ui-admin-apps.ts`**: App Catalog registry, ingress port mapper, and department permission matrix.
11. **`ui-admin-org.ts`**: Visual Org Chart Builder and tree hierarchy editor.
12. **`ui-admin-audit.ts`**: Immutable RFC 7807 security audit stream with PII redaction.
13. **`ui-admin-settings.ts`**: Workspace identity branding, Google/SAML SSO configuration, and Turso DB health cards.
14. **`ui-modals.ts`**: Viewport-safe slide-out action drawers and confirmation dialogs.
15. **`ui-command-palette.ts`**: Universal `⌘K` Quick Search overlay indexing all views and tools.
16. **`ui-canvas-scripts.ts`**: Interactive 2D pan/zoom and node centering engine.
17. **`ui-canvas-views.ts`**: Divisions Matrix and Leadership Pipeline multi-perspective view renderers.
18. **`ui-canvas-inspector.ts`**: Colleague profile inspector drawer, reporting chain breadcrumbs, and manager jumps.
19. **`ui-admin-scripts.ts`**: Admin action handlers and feedback toasts.
20. **`ui-styles.ts`**: Astryx CSS styles conforming strictly to `--forge-*` custom properties.
21. **`ui-scripts.ts`**: Master client-side router, ⌘K command modal, and state persistence.
22. **`ui-renderer.ts`**: Master HTML layout assembler.
