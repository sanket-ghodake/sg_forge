# Telemetry Forge App - End-to-End Tests (Tier 5)

This directory contains Tier 5 End-to-End integration and browser flow tests for the Telemetry forge app.

## Scope
- Verifies real HTTP request-response cycles against running server instances.
- Validates telemetry collection ingestion endpoints (`/api/events`, `/api/metrics`).
- Tests dashboard view rendering and Astryx dual-theme state integration.
- Tests authenticated session cookie persistence and access control.

## Running Tests
```bash
rtk bun test test/e2e
```
