# 🌐 Landing Discovery Hub (`@forge/landing`)

Public ingress portal serving on Port `:3000` (proxied at root `/` on Ports 80 & 443).

---

## 📊 Code & Architecture Metrics

*Generated using portable toolchain (`portables/bin/scc` & `scripts/verify-gate.ts`)*

| Metric | Value | Details / Specification |
| :--- | :--- | :--- |
| **Package Name** | `@forge/landing` | Platform Service |
| **Ingress Port / Route** | `:3000` &rarr; `/` | Reverse proxy gateway upstream |
| **Total Files** | `14` files | Source, HTML templates, Docker, and test suites |
| **Lines of Code (SLOC)**| `332` SLOC | 456 total lines (57 comments, 67 blanks) |
| **Complexity Score** | `32` | Highly cohesive modular structure |
| **Language Breakdown** | TypeScript (260 SLOC), Markdown (44), Docker (14), JSON (14) | 100% type-safe |
| **Database Instance** | Stateless | Dynamic registry loaded from `@forge/sdk/registry` |
| **5-Tier Test Suite** | `7` passing tests | `test/unit/`, `test/integration/`, `test/security/`, `test/contracts/`, `test/e2e/` |
| **Verification Gate** | **100% Passing** ✅ | Strict WCAG 2.1 HTML5 & Astryx compliance |

---

## 🚀 Features
* **Dynamic Service Registry**: Loads registered services dynamically from `@forge/sdk/registry` (`.env`).
* **Astryx UI**: Consumes `@forge/ui` with high-contrast tokens, responsive grid cards, and animated SVG theme toggler.
* **Tab Isolation**: Distinct apps open in a new tab (`target="_blank" rel="noopener noreferrer"`).
* **Live Health Checks**: Probes internal micro-services and micro-apps in real-time.

---

## 📁 Internal Architecture

```text
apps/src/landing/
├── README.md              # Service documentation & code metrics
├── package.json           # Package manifest
├── src/
│   ├── index.ts           # Service barrel export
│   └── server.ts          # Bun HTTP server & dynamic app cards renderer
├── docker/
│   └── Dockerfile         # Multi-stage production container
├── logs/                  # Isolated structured JSON log sink
└── test/                  # 5-Tier test suite
    ├── unit/
    ├── integration/
    ├── security/
    ├── contracts/
    └── e2e/
```

---

## 🏃 Local Execution & Verification

```bash
# Run standalone server
rtk bun apps/src/landing/src/server.ts

# Run test suite
rtk bun test apps/src/landing/test/
```
