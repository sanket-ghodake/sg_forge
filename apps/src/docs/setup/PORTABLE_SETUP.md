# 🧰 SG Forge 2.0 - Portable Developer Setup Guide

This repository is engineered with a **Zero-Host-Modification Policy**. All development runtimes, testing frameworks, linters, analyzers, and benchmarking tools run from pre-bundled portable repo binaries or isolated Docker containers.

---

## ⚡ Prerequisites

* **Linux (x86_64 / ARM64), macOS (Apple Silicon / Intel), or Windows (WSL2 / Native CMD)**.
* **Git** installed on host.
* **Docker** (Optional, for running full containerized stack).

---

## 📦 Bundled Portable Tool Matrix (Latest Stable 2026 LTS Releases)

| Component | Active Version | Upstream Latest | Path / Binary | Host Install Needed? |
| :--- | :---: | :---: | :--- | :---: |
| **Bun Runtime** | `v1.3.14` | `v1.3.14` | `portables/bun/bin/bun` | ❌ No |
| **RTK Token Optimizer** | `v0.42.3` | `v0.42.3` | `portables/bin/rtk` | ❌ No |
| **Astryx CLI** | `v2.0.0` | `v2.0.0` | `portables/bin/astryx` | ❌ No |
| **Gitleaks Secret Scanner** | `v8.30.1` | `v8.30.1` | `portables/bin/gitleaks` | ❌ No |
| **Biome Fast Linter** | `v2.2.0` | `v2.2.0` | `portables/bin/biome` | ❌ No |
| **Knip Dead Code Auditor** | `v6.32.2` | `v6.32.2` | `portables/bin/knip` | ❌ No |
| **Hadolint Docker Linter** | `v2.12.0` | `v2.12.0` | `portables/bin/hadolint` | ❌ No |
| **Autocannon Benchmark** | `v7.15.0` | `v7.15.0` | `portables/bin/autocannon` | ❌ No |
| **Repomix Context Packager** | `v1.10.2` | `v1.10.2` | `portables/bin/repomix` | ❌ No |
| **SCC Complexity Counter** | `v3.4.0` | `v3.4.0` | `portables/bin/scc` | ❌ No |
| **Hyperfine Benchmarker** | `v1.18.0` | `v1.18.0` | `portables/bin/hyperfine` | ❌ No |
| **ctop Container Top** | `v0.7.7` | `v0.7.7` | `portables/bin/ctop` | ❌ No |
| **Caveman CLI** | `v1.0.0` | `v1.0.0` | `portables/bin/caveman` | ❌ No |
| **Graphify Knowledge Graph** | `v0.5.0` | `v0.5.0` | `portables/bin/graphify` | ❌ No |

---

## 🚀 1-Command Bootstrap

### Linux, macOS & WSL2:
```bash
./run.sh setup
./run.sh dev
```

### Windows Native (CMD / PowerShell):
```cmd
run.bat setup
run.bat dev
```

---

## 🌐 Cross-Platform & Zero-Drift Git Standards (WSL, Windows, macOS, Linux)

To guarantee that portable tools and script files never show unexpected file modifications (`filemode changed` or CRLF line ending drift) across operating systems:

1. **Automatic Git Hardening (`setup` command)**:
   Running `./run.sh setup` (or `run.bat setup`) automatically configures your local clone:
   * `git config core.filemode false`: Prevents Windows/NTFS permission bit discrepancies from dirtying Git status.
   * `git config core.autocrlf false`: Ensures script wrappers retain Unix `LF` line endings.

2. **Canonical `.gitattributes` Protection**:
   All shell scripts, extensionless tool wrappers (`portables/bin/*`), and environment templates are locked to `eol=lf` via `.gitattributes` to prevent Windows CRLF conversions.

3. **Symlink-Free Portable Wrappers**:
   All portable runners (`bunx`, `rtk`, `biome`, etc.) use self-resolving POSIX shell wrappers instead of OS symlinks, ensuring 100% compatibility across Windows, WSL, and macOS.

4. **WSL Best Practice**:
   When working in WSL, clone the repository into the native Linux filesystem (e.g. `~/workspace/` or `/home/<user>/...`) rather than Windows mounts (`/mnt/c/...`) for optimal I/O speed and filesystem fidelity.

---

## 🩺 System Diagnostics & Health Check

Run the built-in diagnostic tool to verify all runtimes, wrappers, and Git configurations:

```bash
./run.sh doctor
```
*(On Windows Native: `run.bat doctor`)*
