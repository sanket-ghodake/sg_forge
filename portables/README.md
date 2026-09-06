# 🧰 Standalone Portable Runtimes & Toolchain (`portables/`)

Zero-host portable binaries, runtime engines, and cross-platform CLI toolchains.

---

## 📦 Directory Structure

* **[`bin/`](portables/bin/)**: Standalone executable CLI wrappers:
  * **Architecture & Governance**: `depcruise`, `madge`, `spectral`, `schemathesis`
  * **Quality & Static Analysis**: `biome`, `knip`, `type-coverage`, `shellcheck`, `scc`, `lizard`
  * **Security & Supply Chain**: `gitleaks`, `semgrep`, `osv-scanner`, `trivy`, `syft`, `hadolint`
  * **Frontend & Accessibility**: `astryx`, `axe`, `lhci`
  * **Benchmarking & Telemetry**: `autocannon`, `hyperfine`, `k6`, `ctop`
  * **AI Context & Engineering**: `rtk`, `repomix`, `graphify`, `caveman`
* **[`bun/`](portables/bun/)**: Portable Bun v1.3.14 (LTS 2026) runtime and portable `bunx` runner.
* **[`ctop/`](portables/ctop/)**: Portable standalone `ctop` (v0.7.7) container top terminal metrics dashboard.
* **[`rtk/`](portables/rtk/)**: Portable RTK Token Optimizer.
* **[`scc/`](portables/scc/)**: Portable Sloc, Cloc & Complexity Analyzer.
* **[`hyperfine/`](portables/hyperfine/)**: Portable CLI benchmarking engine.
* **[`lizard/`](portables/lizard/)**: Portable cyclomatic code complexity scanner.
* **[`tree/`](portables/tree/)**: Portable filesystem hierarchy visualizer.
* **[`caveman/`](portables/caveman/)**: Portable token compression utility.
* **[`astryx/`](portables/astryx/)**: Portable Astryx design token validator.

---

## 🌐 Cross-Platform Engineering Invariants

1. **Zero Host Modification**: Tools run from portable wrappers without requiring global `npm`, `pip`, `apt`, or `brew` installations.
2. **Symlink-Free Design**: All CLI entries use self-resolving POSIX shell scripts to ensure error-free operation on Windows, WSL, and macOS without symlink permission failures.
3. **Line Ending & Filemode Hardening**: Locked to Unix `LF` via `.gitattributes` and protected against Windows/NTFS permission drift via `core.filemode false` (configured automatically via `./run.sh setup`).
