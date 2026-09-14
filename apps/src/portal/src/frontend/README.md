# 🎨 Portal Frontend UI Architecture (`@forge/portal/frontend`)

Modular, accessible, and performant frontend presentation layer for SG Forge Portal (2026 LTS).

---

## 🏛️ Component Architecture

1. **`layout-header.ts`**: Top navigation bar with multi-tenant branding, search trigger (`⌘K`), theme switcher, and user avatar popover.
2. **`layout-sidebar.ts`**: Auto-collapsible sidebar with precision monochrome icons, hover-peek, and role-guarded Admin Console.
3. **`ui-renderer-canvas.ts`**: 2D Org Map & interactive visual hierarchy canvas.
4. **`ui-renderer-apps.ts`**: Apps & Tools Hub with structured 3-tab navigation (*My Active Apps*, *Marketplace Apps*, *Access Requests*), status badges, and request triggers.
5. **`ui-apps-data.ts`**: Canonical definitions and catalog for active and requestable applications with designated app admins.
6. **`ui-apps-scripts.ts`**: Interactive client controller for tab navigation, pinning, search, and category filtering.
7. **`ui-apps-requests-scripts.ts`**: Real-time access request submission with deduplication defense, client-side dynamic catalog hydration (`reconcileActiveAppsCatalog()`), and request details viewer.
8. **`ui-renderer-profile.ts`**: Personal profile, assigned IAM scopes, active session revocation, and PAT generator.
9. **`ui-renderer-inbox.ts`**: Announcements & notifications feed with priority badges.
10. **`ui-admin-members.ts`**: Team & Member management with employee roster table and invite modal.
11. **`ui-admin-apps.ts`**: App Catalog registry, ingress port mapper, and department permission matrix.
12. **`ui-admin-org.ts`**: Visual Org Chart Builder and tree hierarchy editor.
13. **`ui-admin-audit.ts`**: Immutable RFC 7807 security audit stream with PII redaction.
14. **`ui-admin-settings.ts`**: Workspace identity branding, Google/SAML SSO configuration, and Turso DB health cards.
15. **`ui-modals.ts`**: Viewport-safe slide-out action drawers, application details with admin lists, and request governance dialogs.
16. **`ui-command-palette.ts`**: Universal `⌘K` Quick Search overlay indexing all views and tools.
17. **`ui-canvas-scripts.ts`**: Interactive 2D pan/zoom and node centering engine.
18. **`ui-canvas-views.ts`**: Divisions Matrix and Leadership Pipeline multi-perspective view renderers.
19. **`ui-canvas-inspector.ts`**: Colleague profile inspector drawer, reporting chain breadcrumbs, and manager jumps.
20. **`ui-admin-scripts.ts`**: Admin action handlers and feedback toasts.
21. **`ui-styles.ts`**: Astryx CSS styles conforming strictly to `--forge-*` custom properties.
22. **`ui-styles-modals.ts`**: Astryx modal dialogs, form controls, and enhanced text block styles.
23. **`ui-scripts.ts`**: Master client-side router, ⌘K command modal, and state persistence.
24. **`ui-renderer.ts`**: Master HTML layout assembler.
25. **`ui-admin-apps-governance-modal.ts`**: Enterprise Application Governance & Administration modal with Designated Admins roster, Access Policy controls, and Ingress routing.
26. **`ui-admin-apps-governance-scripts.ts`**: Client-side event controller for live App Admin appointment, revocation, policy saving, and real-time synchronization.
27. **`ui-admin-apps-history-modal.ts`**: Application Governance & Access modal console featuring 4 tabs: *Access Policies*, *App Admins*, *History & SLA*, and *Entitled Users* roster with live counts.
28. **`ui-admin-apps-history-scripts.ts`**: Client-side event controller for request stream filtering, real-time search, 1-click inline Approve/Decline actions, and single-click access revocation for entitled users.

