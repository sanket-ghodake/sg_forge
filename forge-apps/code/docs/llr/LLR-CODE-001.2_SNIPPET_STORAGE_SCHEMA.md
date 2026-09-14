# LLR-CODE-001.2: Snippet Database Storage Schema

> **Low-Level Requirement (LLR)** | Status: `VERIFIED` | Traceability ID: `[LLR-CODE-001.2]`

---

## 1. Specification
The Code microservice stores projects, snippets, and member permissions in its isolated `data/code.db` SQLite database using Drizzle ORM schemas.

## 2. Table Schemas
- `code_projects`: `id`, `name`, `description`, `owner_id`, `org_id`, `created_at`
- `project_members`: `id`, `project_id`, `user_id`, `role`, `created_at`

## 3. Invariants
- All queries must enforce `WHERE org_id = ?` to guarantee cross-tenant isolation.
- Cascade deletions for project members on project teardown.

## 4. Traceability Links
- **Parent HLR**: `[HLR-CODE-001]`
- **Implementation**: `src/db/schema.ts`, `src/db/index.ts`
- **Verification**: `test/integration/code-server.test.ts`
