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
| [**Bun Runtime**](https://github.com/oven-sh/bun) | `v1.3.14` | `v1.3.14` | `portables/bun/bin/bun` | ❌ No |
| [**RTK Token Optimizer**](https://github.com/rtk-ai/rtk) | `v0.42.3` | `v0.42.3` | `portables/bin/rtk` | ❌ No |
| [**Astryx CLI**](../../ui) | `v2.0.0` | `v2.0.0` | `portables/bin/astryx` | ❌ No |
| [**Gitleaks Secret Scanner**](https://github.com/gitleaks/gitleaks) | `v8.30.1` | `v8.30.1` | `portables/bin/gitleaks` | ❌ No |
| [**Biome Fast Linter**](https://github.com/biomejs/biome) | `v2.2.0` | `v2.2.0` | `portables/bin/biome` | ❌ No |
| [**Knip Dead Code Auditor**](https://github.com/webpro-nl/knip) | `v6.32.2` | `v6.32.2` | `portables/bin/knip` | ❌ No |
| [**Hadolint Docker Linter**](https://github.com/hadolint/hadolint) | `v2.12.0` | `v2.12.0` | `portables/bin/hadolint` | ❌ No |
| [**Autocannon Benchmark**](https://github.com/mcollina/autocannon) | `v7.15.0` | `v7.15.0` | `portables/bin/autocannon` | ❌ No |
| [**Repomix Context Packager**](https://github.com/yamadashy/repomix) | `v1.10.2` | `v1.10.2` | `portables/bin/repomix` | ❌ No |
| [**SCC Complexity Counter**](https://github.com/boyter/scc) | `v3.4.0` | `v3.4.0` | `portables/bin/scc` | ❌ No |
| [**Hyperfine Benchmarker**](https://github.com/sharkdp/hyperfine) | `v1.18.0` | `v1.18.0` | `portables/bin/hyperfine` | ❌ No |
| [**ctop Container Top**](https://github.com/bcicen/ctop) | `v0.7.7` | `v0.7.7` | `portables/bin/ctop` | ❌ No |
| [**Caveman CLI**](../../../../portables/caveman) | `v1.0.0` | `v1.0.0` | `portables/bin/caveman` | ❌ No |
| [**Graphify Knowledge Graph**](https://github.com/safishamsi/graphify) | `v0.5.0` | `v0.5.0` | `portables/bin/graphify` | ❌ No |
| [**Graft Context Graph**](https://github.com/trailhq/Graft) | `v0.1.0` | `v0.1.0` | `portables/bin/graft` | ❌ No |
| [**CodeBurn Token Tracker**](https://github.com/getagentseal/codeburn) | `v0.9.24` | `v0.9.24` | `portables/bin/codeburn` | ❌ No |
| [**Headroom Compression**](https://github.com/headroomlabs-ai/headroom) | `v0.2.1` | `v0.2.1` | `portables/bin/headroom` | ❌ No |
| [**Council of AI Decision CLI**](https://medium.com/@Silotech.xyz/the-council-of-ai-a-multi-agent-prompting-framework-for-better-decision-making-8e7569c10584) | `v1.0.0` | `v1.0.0` | `portables/bin/council` | ❌ No |

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

### 💡 Activating Portable Tools on Terminal PATH

If your IDE or shell reports `rtk: command not found` or `rtk is not recognized`:

1. **Visual Studio Code / Cursor / Windsurf**:
   The workspace includes [`.vscode/settings.json`](.vscode/settings.json), which automatically injects `${workspaceFolder}/portables/bin` and `${workspaceFolder}/portables/bun/bin` into all integrated terminals on Linux, macOS, and Windows. Simply open a new terminal tab in VS Code.
2. **External Shells (Bash / Zsh)**:
   Source the environment directly in your current shell:
   ```bash
   source env.sh
   ```
   *(Or: `export PATH="$PWD/portables/bin:$PWD/portables/bun/bin:$PATH"`)*
3. **AI Coding Agents (Claude Code, Cursor, Antigravity, Copilot)**:
   If an AI agent subshell does not inherit the VS Code PATH, it can prefix commands with the repo path:
   ```bash
   ./portables/bin/rtk <command>
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
