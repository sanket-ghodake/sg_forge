# Tier 1 Unit Tests - Foundation SDK (`@forge/sdk`)

This directory houses Tier 1 unit test suites for the `@forge/sdk` core packages.

## Test Suites
- `auth-guard.test.ts`: Zero-Trust SSO auth guard and JWT claim evaluation.
- `branding.test.ts`: Dynamic white-label branding loader and token resolution.
- `browser-bridge.test.ts`: Real-time browser telemetry log streaming bridge.
- `client-bridge.test.ts`: Micro-app iframe handshake and RPC message bridge.
- `custom-landing-ingress.test.ts`: Dynamic custom landing container overrides, HTTPS upstreams, and Caddy proxy generation.
- `directory-client.test.ts`: Hierarchical org tree and employee directory client.
- `env-integrity.test.ts`: Environment variable validation and runtime invariants.
- `error-handler.test.ts`: RFC 7807 problem details error boundaries and trace ID generation.
- `external-ingress.test.ts`: Route ingress definitions and external proxy headers.
- `logger.test.ts`: Structured JSON logging, PII redaction, and log rotation.
- `registry.test.ts`: Dynamic microservice registry discovery from environment configuration.
- `service-worker.test.ts`: Universal air-gapped Service Worker script generator and offline fallback request handler.
