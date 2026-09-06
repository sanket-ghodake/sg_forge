# @forge/ui - 5-Tier Test Architecture

This directory maintains isolated tests for the Astryx Design System, UI components, state engines, and visual tokens.

## Tier Layout
- **unit/**: Component markup generators, state stores, tooltip collision calculation, dropdown scripts, sanitizers.
- **integration/**: Cross-tab state synchronization, URL-query reflection, and toast notification queueing.
- **security/**: XSS mitigation, HTML attribute sanitization, open-redirect defense, and CSP style-hash stability.
- **contracts/**: Astryx CSS variable schemas (`--forge-*`), theme token invariants, and export parity.
- **e2e/**: End-to-end HTML shell assembly, script execution readiness, and accessibility baseline.
