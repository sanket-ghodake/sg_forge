# `@forge/portal` - Backend Services & Hierarchy Engine (2026 LTS)

This directory houses backend server services, tree resolution algorithms, and data access layers for the Main Workspace Portal microservice.

---

## 📁 Architecture & File Layout

* [`org-tree-service.ts`](apps/src/portal/src/backend/org-tree-service.ts):
  - Resolves live organization hierarchy from SQLite database (`auth.db`).
  - Supports 5-level depth bounding, progressive subtree resolution by `rootId`, and calculation of direct reports vs. total recursive subtree headcount.
  - Generates division summary metrics for dynamic canvas filtering.

* [`app-requests-service.ts`](file:///home/sanket/Desktop/Sanket/org_website_clone/apps/src/portal/src/backend/app-requests-service.ts):
  - Handles access request submissions, deduplication guards (`PENDING` / `APPROVED`), approvals, rejections, and anti-self-approval validation.
  - Provides `getUserApprovedAppIds(userId, userEmail)` for dynamic app catalog hydration across both user ID and email bindings.
  - Implements `isAuthorizedForApp(adminUserId, appId, isGlobalAdmin)` for cross-app isolation.
  - Implements `handleEmployeeOffboarding(userId, userEmail)` with cascading transitions to `USER_INACTIVE` and `REVOKED_INACTIVE`.

* [`app-users-service.ts`](file:///home/sanket/Desktop/Sanket/org_website_clone/apps/src/portal/src/backend/app-users-service.ts):
  - Resolves live entitled user roster (`GET /api/v1/portal/apps/:appId/users`) directly from `portal.db`.
  - Executes single-click atomic user access revocation (`POST /api/v1/portal/apps/users/revoke`).

* [`app-history-service.ts`](file:///home/sanket/Desktop/Sanket/org_website_clone/apps/src/portal/src/backend/app-history-service.ts):
  - Queries historical audit decisions from `portal_app_requests`.
  - Computes real-time mathematical SLA averages (`decided_at - created_at`) with zero fallback dummy data.

* [`app-governance-service.ts`](file:///home/sanket/Desktop/Sanket/org_website_clone/apps/src/portal/src/backend/app-governance-service.ts):
  - Manages designated application administrators, enrollment access policies, and SLAs in `portal.db`.
  - Enforces safety invariants (at least 1 admin required) and synchronizes promotions with Auth IAM policies.

* [`app-governance-routes.ts`](file:///home/sanket/Desktop/Sanket/org_website_clone/apps/src/portal/src/backend/app-governance-routes.ts):
  - RESTful route dispatcher for `/api/v1/portal/apps/:appId/governance`, `/admins`, `/policy`, `/history`, and `/users`.
  - Enforces role-based privilege gates and cross-app isolation boundaries.

* [`inbox-service.ts`](file:///home/sanket/Desktop/Sanket/org_website_clone/apps/src/portal/src/backend/inbox-service.ts):
  - Universal administrative notifications, alerts, and pending action inbox aggregator.


## 🔒 Security & Governance Invariants

1. **Zero-Trust Scoping**: Ensures queries are strictly bounded and sanitized without data leakage.
2. **500-Line Soft Cap**: Kept modular and cohesive under 300 lines.
3. **Dedicated Turso/SQLite Isolation**: Reads only from the designated operational database.
