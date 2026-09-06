# 🔗 Platform Integration Test Suite (`apps/test/integration/`)

Cross-service integration tests verifying database transactions, token rotation, and routing between services.

## 🎯 Coverage Scope
- **Database & Drizzle ORM**: Transactional consistency across SQLite/Turso instances.
- **Session Lifecycle**: Login, session refresh, remote device invalidation.
- **Service-to-Service Communication**: Event delivery and log streaming.
