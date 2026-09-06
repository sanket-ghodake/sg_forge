# Domain-Specific Engineering Rules

## Overview
This directory contains modular domain-specific engineering rules referenced by `AGENTS.md`. Each file encapsulates rules for a specific technical domain to prevent monolithic instruction bloat and ensure fast, context-aware rule routing.

## Rule Index

| Rule File | Domain | Key Requirements |
| :--- | :--- | :--- |
| [`core.md`](./core.md) | Core & Workflows | Zero host install, RTK bash prefix, worklogs, minimal change, diff budget, DoD format. |
| [`architecture.md`](./architecture.md) | Architecture & Layering | Directional boundaries, file size thresholds (300/500), API contracts, migration discipline. |
| [`security-practices.md`](./security-practices.md) | Security & Zero-Trust | OWASP ASVS 5.0, multi-tenant isolation, `AuditEvent` domain, anti-SQLi, safe exec arrays. |
| [`testing.md`](./testing.md) | Testing & QA | Risk-tiered coverage (100% Auth/RBAC/Tenant), 3A pattern, mutation testing, hermeticity. |
| [`frontend-ui.md`](./frontend-ui.md) | UI & Theme System | Responsive SPA across ports 3001/3002/3003, `@sg-forge/ui` tokens, portal z-index. |
| [`docker-containers.md`](./docker-containers.md) | Containers & Runtime | Rootless containers, non-root user, multi-stage builds. |
| [`graphify.md`](./graphify.md) | Knowledge Graph | AST-based codebase navigation and dependency queries. |
| [`rtk.md`](./rtk.md) | Token Optimization | Mandatory `rtk` prefix for terminal command execution. |

