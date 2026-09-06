# Tier 2 Integration Tests - Portal (`@forge/portal`)

This directory contains Tier 2 integration tests verifying internal subsystems and endpoint contracts for the Main Workspace Portal.

## Test Suites
- `auth-gate.test.ts`: Verification of Zero-Trust auth gate and session validation.
- `portal-api-endpoints.test.ts`: Inbox, notifications, celebrations, and organization endpoints.
- `offline-sw.test.ts`: Public unauthenticated serving of `/sw.js` and `/__offline_error.html` across Portal and Landing services.
