# 🛡️ Platform Security Test Suite (`apps/test/security/`)

Security tests evaluating ASVS 5.0 compliance, anti-brute-force rate limiting, JWT tamper rejection, and sandbox containment.

## 🎯 Coverage Scope
- **Rate Limiting**: Anti-brute-force threshold enforcement.
- **Token Replay Defense**: Automatic session family revocation upon token reuse.
- **Multi-Tenant Isolation**: Cross-organization query scoping and unauthorized data access rejection.
