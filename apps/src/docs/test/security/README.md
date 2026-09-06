# Tier 3: Security Tests - @forge/docs

Security tests validating AppSec boundaries in `@forge/docs`:
- Path traversal defense (`../` escapes)
- Null-byte injection neutralization (`%00`)
- Security headers verification (`X-Content-Type-Options: nosniff`)
