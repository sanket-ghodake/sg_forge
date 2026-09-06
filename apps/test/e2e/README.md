# 🚀 Platform End-to-End User Journey Test Suite (`apps/test/e2e/`)

End-to-End (E2E) user journey and cross-service authentication tests simulating complete user workflows across the SG Forge platform.

## 🎯 Coverage Scope
- **Auth & Portal Lifecycle**: Full sign-in, forced password reset, session persistence, and portal landing.
- **Session Replay Defense**: Multi-device token rotation and family revocation.
- **Micro-App Ingress Dispatch**: Dynamic service resolution and iframe authentication handshake.
- **Telemetry Streaming**: Real-time structured log ingestion and SSE distribution.
- **Browser Automation**: Headless Playwright specs for DOM, responsive layouts, and WCAG A11y.
