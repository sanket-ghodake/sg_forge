# Public Architecture Diagrams

This directory houses the authoritative, self-contained, accessible Astryx vector SVG diagrams served publicly by the Starlight portal.

## Diagram Catalog

| # | File | Archetype | Subject |
| :-: | :--- | :--- | :--- |
| **01** | [`01-platform-topology.html`](./01-platform-topology.html) | System Context | Unified reverse proxy gateway and microservice topology |
| **02** | [`02-network-airgap.html`](./02-network-airgap.html) | Security Boundary | Core air-gap vs. autonomous submodule dual network model |
| **03** | [`03-turso-db-isolation.html`](./03-turso-db-isolation.html) | Data Architecture | Dedicated Turso libSQL SQLite database isolation per app |
| **04** | [`04-auth-session-lifecycle.html`](./04-auth-session-lifecycle.html) | Sequence Timed | HMAC-SHA256 sliding inactivity token lifecycle |
| **05** | [`05-astryx-token-hierarchy.html`](./05-astryx-token-hierarchy.html) | Design System | Astryx token cascade and zero OS default rules |
| **06** | [`06-tooltip-collision.html`](./06-tooltip-collision.html) | Algorithm Flow | Smart auto-flip and horizontal boundary clamping |
| **07** | [`07-client-state-engine.html`](./07-client-state-engine.html) | State Machine | Zero-FOUC head restoration and versioned store migrations |
| **08** | [`08-portal-spa-routing.html`](./08-portal-spa-routing.html) | UI Wireframe | Single Page Application instant view hydration |
| **09** | [`09-test-pyramid.html`](./09-test-pyramid.html) | Pyramid Hierarchy | Enterprise 5-Tier test verification structure |
| **10** | [`10-precommit-quality-gate.html`](./10-precommit-quality-gate.html) | Pipeline Stages | 29-check deterministic and semantic pre-commit pipeline |
| **11** | [`11-submodule-governance.html`](./11-submodule-governance.html) | Submodule Boundary| Autonomous Forge App lifecycle and zero monorepo bleed |
| **12** | [`12-systems-traceability.html`](./12-systems-traceability.html) | Traceability Chain | Bidirectional requirement-to-code traceability hierarchy |
| **13** | [`13-dev-hub-architecture.html`](./13-dev-hub-architecture.html) | Developer Platform | Developer Hub & SDK playground architecture |
| **14** | [`14-dev-dashboard-telemetry.html`](./14-dev-dashboard-telemetry.html) | Telemetry Mesh | Developer Operations Dashboard & live SSE streaming |
| **15** | [`15-sdk-storage-pipeline.html`](./15-sdk-storage-pipeline.html) | Storage Pipeline | Turso libSQL SQLite factory & atomic backup pipeline |
| **16** | [`16-portal-canvas-inbox.html`](./16-portal-canvas-inbox.html) | Workspace Shell | Portal Org Canvas, Command Palette & universal inbox |
| **17** | [`17-observability-telemetry-flow.html`](./17-observability-telemetry-flow.html) | Telemetry Flow | 4-Pillar Observability, Dual Probes & Browser Bridge |
| **18** | [`18-user-journey-workspace.html`](./18-user-journey-workspace.html) | User Journey | Enterprise Auth, Org Switcher & Sandboxed Canvas |
| **19** | [`19-developer-onboarding-toolchain.html`](./19-developer-onboarding-toolchain.html) | Developer Journey | Portable Toolchain, App Generator & 29-Check Gate |
| **20** | [`20-disaster-recovery-backup.html`](./20-disaster-recovery-backup.html) | Disaster Recovery | AES-256-GCM Backup, Rolling Retention & Restore |
| **21** | [`21-security-strix-audit.html`](./21-security-strix-audit.html) | Security Audit | In-Chat AI Code Review & Live Endpoint Pentest |
| **22** | [`22-docker-orchestration-dev-prod.html`](./22-docker-orchestration-dev-prod.html) | Docker Lifecycle | Dev Bind-Mount Hot Reload vs Multi-Stage Prod AOT Compilation & Obfuscation |
