# 🎭 Playwright Browser E2E Specs (`apps/test/e2e/playwright/`)

Real browser automated specifications using Playwright across Chromium, Firefox, WebKit, and Mobile devices.

## 🎯 Coverage Scope
- **Theme & Astryx UI**: Dynamic Light/Dark token switching, layout stability, zero unapproved styles.
- **Form Automation**: Real password entropy meter feedback, input validation, and redirect navigation.
- **Viewport Responsiveness**: 320px mobile viewport compliance with zero horizontal overflow.
- **Micro-App Iframe Bridge**: Real postMessage handshake between Portal shell and child apps.
- **WCAG 2.1 AA Accessibility**: Full keyboard tab navigation, aria attributes, and focus indicators.
- **Universal Status & Error Journeys (`error-status-pages.pw.ts`)**: 11 real-world user journeys covering subpath 404 boundaries across all services, anti-enumeration login redirects, API RFC 7807 content negotiation, 10-status edge fallbacks, theme toggles, and trace ID clipboard operations.
