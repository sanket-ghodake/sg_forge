---
title: "Forge Code App Documentation (`docs/`)"
---

# Forge Code App Documentation (`docs/`)

> **Autonomous Micro-App: Code Editor & Snippet Manager**

---

## 🧭 Overview & Architecture

The **Forge Code App** (`forge-apps/code`) provides code editing, syntax highlighting, and snippet management within the SG Forge portal.

- **Isolation**: Runs in its own Docker container on `forge-apps-net`.
- **Database**: Dedicated Turso libSQL database (`data/code.db`) with zero cross-app database queries.
- **UI**: Rendered with Astryx design tokens and components.
- **Documentation Standard**: Follows SG Forge bidirectional traceability (`docs/hlr/` and `docs/llr/`).

---

## 📁 Subdirectories

- `hlr/`: High-Level Requirements for the Code App (snippet storage, workspace management).
- `llr/`: Low-Level Requirements for specific algorithmic functions and database handlers.
