# 🧰 Standalone CLI Wrappers (`portables/bin/`)

Zero-host portable executable binaries and self-resolving POSIX shell wrappers (2026 LTS).

---

## 📦 Directory Overview

All binaries and scripts in this directory are self-resolving POSIX wrappers that guarantee cross-platform execution (Linux, macOS, Windows WSL/Git Bash) with zero host modifications.

### 0. Core Runtimes & Runners
- **[`bun`](https://github.com/oven-sh/bun)**: Standalone wrapper to portable Bun v1.3.14 (LTS 2026).
- **[`bunx`](https://github.com/oven-sh/bun)**: Standalone wrapper for executing local packages and tools via portable Bun.

### 1. Architecture, Code Quality & Linters
- **[`biome`](https://github.com/biomejs/biome)**: Fast AST linter and code formatter.
- **[`depcruise`](https://github.com/sverweij/dependency-cruiser)**: Monorepo dependency boundary and rule enforcer.
- **[`madge`](https://github.com/pahen/madge)**: Circular dependency and module relationship visualizer.
- **[`knip`](https://github.com/webpro-nl/knip)**: Unused file, export, and dead code auditor.
- **[`type-coverage`](https://github.com/plantain-00/type-coverage)**: TypeScript strict type-safety and coverage auditor.
- **[`shellcheck`](https://github.com/koalaman/shellcheck)**: POSIX shell script static analysis engine.
- **[`scc`](https://github.com/boyter/scc)**: Sloc, Cloc & Code complexity counter.
- **[`lizard`](https://github.com/terryyin/lizard)**: Cyclomatic Complexity (CCN <= 10) auditor.

### 2. Security, SAST & Supply Chain
- **[`gitleaks`](https://github.com/gitleaks/gitleaks)**: 160+ secret, credential, and private key scanner.
- **[`semgrep`](https://github.com/semgrep/semgrep)**: Semantic AST vulnerability and code security checker.
- **[`osv-scanner`](https://github.com/google/osv-scanner)**: Open-source vulnerability scanner against OSV database.
- **[`trivy`](https://github.com/aquasecurity/trivy)**: Container image and filesystem configuration vulnerability scanner.
- **[`syft`](https://github.com/anchore/syft)**: CycloneDX 1.5 Software Bill of Materials (SBOM) generator.
- **[`hadolint`](https://github.com/hadolint/hadolint)**: Dockerfile linting and best-practice verification.

### 3. API Contracts, Accessibility & Web Vitals
- **[`spectral`](https://github.com/stoplightio/spectral)**: OpenAPI 3.1 specification contract linter.
- **[`schemathesis`](https://github.com/schemathesis/schemathesis)**: Property-based contract fuzzer for OpenAPI endpoints.
- **[`axe`](https://github.com/dequelabs/axe-core)**: Automated WCAG 2.1 AA accessibility compliance engine.
- **[`lhci`](https://github.com/GoogleChrome/lighthouse-ci)**: Lighthouse CI web vitals and performance auditor.

### 4. Benchmarking, Performance & Monitoring
- **[`autocannon`](https://github.com/mcollina/autocannon)**: High-performance HTTP/1.1 benchmarking tool.
- **[`k6`](https://github.com/grafana/k6)**: Modern scriptable load and performance stress testing engine.
- **[`hyperfine`](https://github.com/sharkdp/hyperfine)**: Statistical command-line benchmarking tool.
- **[`ctop`](https://github.com/bcicen/ctop)**: Real-time terminal container metrics dashboard.

### 5. AI Context, Token Optimization & Knowledge Graphs
- **[`rtk`](https://github.com/rtk-ai/rtk)**: LLM token compressor and terminal output optimizer.
- **[`repomix`](https://github.com/yamadashy/repomix)**: Token-compressed XML/Markdown codebase packager.
- **[`caveman`](../caveman)**: Ultra-compressed communication mode utility.
- **[`graphify`](https://github.com/safishamsi/graphify)**: Macroscopic multimodal knowledge graph with community clustering and Obsidian export.
- **[`graft`](https://github.com/trailhq/Graft)**: Microscopic code context graph for AI coding agents (symbol call trees, skeletons, blast radius).
- **[`codeburn`](https://github.com/getagentseal/codeburn)**: Lifetime AI coding token & cost tracker across 41 tools and agents with persistent Git ledgering.
- **[`headroom`](https://github.com/headroomlabs-ai/headroom)**: Context and prompt compression engine (SmartCrusher, CodeCompressor, Kompress).
- **[`council`](https://medium.com/@Silotech.xyz/the-council-of-ai-a-multi-agent-prompting-framework-for-better-decision-making-8e7569c10584)**: Council of AI multi-agent decision & RFC review framework (Marius Silo / Silotech.xyz).
- **[`astryx`](../../apps/src/ui)**: Astryx design token validator and theme parity enforcer.
- **[`tree`](https://github.com/Old-Man-Programmer/tree)**: Filesystem hierarchy visualizer.
