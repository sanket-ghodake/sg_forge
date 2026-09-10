# 🧰 Headroom - Context & Prompt Compression Layer

> **Zero Host Modification Architecture (2026 LTS Baseline)**: Headroom is an open-source, local-first context compression engine that compresses everything an AI agent reads — tool outputs, logs, RAG chunks, files, and conversation history — before it reaches the LLM. Same answers, fraction of the tokens (21%–57% token reduction).

---

## 📦 Upstream Architecture & Provenance

- **Upstream Repository**: [github.com/headroomlabs-ai/headroom](https://github.com/headroomlabs-ai/headroom)
- **License**: Apache-2.0
- **Version**: `v0.2.1` (LTS 2026)
- **Executable Wrapper**: [`portables/bin/headroom`](../bin/headroom)
- **Host Modifications**: ZERO (POSIX self-resolving wrapper with portable runner fallback).

---

## 🧠 Core Architecture in SG Forge

1. **ContentRouter & Compressors**:
   - **SmartCrusher**: Compresses repetitive JSON structures and API responses.
   - **CodeCompressor**: AST-based code reduction while preserving declarations and function boundaries.
   - **Kompress**: Prose and text reduction preserving key entities, errors, and fatal lines.
2. **Reversible Retrieval (CCR)**:
   - Caches original full-text locally; models can retrieve full snippets when necessary.
3. **Local Compression Proxy**:
   - Runs a local proxy on port 8787 for drop-in LLM gateway integration.
4. **Standalone Runner**:
   - Includes `scripts/headroom-runner.ts` so compression benchmarks and tests execute cleanly even without a system Python virtual environment.

---

## ⚡ CLI Usage & Commands

```bash
# 1. Inspect Headroom status and health
./run.sh headroom status

# 2. Test compression on a file or payload
./run.sh headroom compress <path/to/file>

# 3. Start the local compression proxy
./run.sh headroom proxy --port 8787

# 4. View compression statistics and savings
./run.sh headroom stats
```
