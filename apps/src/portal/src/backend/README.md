# `@forge/portal` - Backend Services & Hierarchy Engine (2026 LTS)

This directory houses backend server services, tree resolution algorithms, and data access layers for the Main Workspace Portal microservice.

---

## 📁 Architecture & File Layout

* [`org-tree-service.ts`](apps/src/portal/src/backend/org-tree-service.ts):
  - Resolves live organization hierarchy from SQLite database (`auth.db`).
  - Supports 5-level depth bounding, progressive subtree resolution by `rootId`, and calculation of direct reports vs. total recursive subtree headcount.
  - Generates division summary metrics for dynamic canvas filtering.

---

## 🔒 Security & Governance Invariants

1. **Zero-Trust Scoping**: Ensures queries are strictly bounded and sanitized without data leakage.
2. **500-Line Soft Cap**: Kept modular and cohesive under 300 lines.
3. **Dedicated Turso/SQLite Isolation**: Reads only from the designated operational database.
