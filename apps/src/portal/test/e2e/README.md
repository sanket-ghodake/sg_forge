# Tier 5 E2E Tests - Portal (`@forge/portal`)

This directory contains Tier 5 End-to-End browser journey and full lifecycle tests for the Main Workspace Portal.

## Test Suites
- `portal-server.test.ts`: Server startup, dual `/health` probes, and base route rendering.
- `portal-spa-views.test.ts`: Single-Page Application client-side views and navigation state transitions.
- `outage-offline-cache.test.ts`: Real outage simulation testing client-side Service Worker and offline Cache Storage survival during catastrophic server blackouts.
