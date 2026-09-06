# @forge/sdk Test Suite (5-Tier)

This directory contains automated tests for the Forge SDK, including the centralized structured logger, safe problem response handler, dynamic service registry, and Zero-Trust SSO Auth Guard.

## Subtiers
- `unit/`: Unit tests for `authGuard`, `explainLog`, and `redactSensitiveData`.
- `integration/`: Multi-component log bridges and registry loaders.
- `security/`: Secret redaction, PII sanitization, and tamper resistance.
- `contracts/`: RFC 7807 problem detail contracts.
- `e2e/`: End-to-end SDK loopback verification.
