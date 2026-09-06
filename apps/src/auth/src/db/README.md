# 🗄️ Auth Database Layer (`@forge/auth/db`)

Dedicated database layer managing `auth.db` via SQLite / libSQL in WAL mode.

## 🚀 Features
* **Polymorphic Org Hierarchy**: Customizable node types (`Division`, `Department`, `Faculty`, `Ward`, `Squad`) with materialized paths.
* **GCP-Style IAM Engine**: Granular permissions, predefined & custom roles, and resource-scoped policy bindings.
* **Session Lifecycle**: Replay-protected refresh token family store with instant revocation.
* **Deterministic Seeding**: Populates test personas with default password `password123` and forced first-time password reset.
