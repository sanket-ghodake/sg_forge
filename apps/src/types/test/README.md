# @forge/types - 5-Tier Test Architecture

This directory maintains isolated tests for the foundational type models and schemas of the SG Forge ecosystem.

## Tier Layout
- **unit/**: Structural type conformance, runtime validation guards, and model invariant checks.
- **integration/**: Cross-package type serialization, wire compatibility, and conversion tests.
- **security/**: Type-narrowing against untrusted JSON, prototype pollution guards, and schema sanitization.
- **contracts/**: OpenAPI / RFC 7807 contract parity and JSON schema validations.
- **e2e/**: End-to-end import stability and TS compile verification across monorepo packages.
