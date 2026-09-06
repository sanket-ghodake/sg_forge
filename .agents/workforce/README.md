# Agent Workforce Specializations

## Overview
This directory defines the 5 specialized subagent personas operating in the repository. Instead of a single unconstrained agent performing all tasks, work is routed and verified across dedicated roles to ensure engineering governance, security, and architectural integrity.

## Workforce Roles

| Role | Specification | Primary Responsibility | Directives & Scope |
| :--- | :--- | :--- | :--- |
| **Investigator** | [`INVESTIGATOR.md`](./INVESTIGATOR.md) | Code Discovery & AST Call Graphs | Zero production mutations; factual grounding from repo evidence. |
| **Architect** | [`ARCHITECT.md`](./ARCHITECT.md) | Layer Boundaries & API Contracts | Enforces UI $\rightarrow$ App $\rightarrow$ Domain $\leftarrow$ Infra; canonical OpenAPI/Zod contracts. |
| **Builder** | [`BUILDER.md`](./BUILDER.md) | Minimal-Change Implementation | Next.js 16 / React 19 / Drizzle; diff budget discipline; zero opportunistic refactor. |
| **Tester** | [`TESTER.md`](./TESTER.md) | 3A Quality & Mutation Testing | 100% Auth/RBAC/Tenant test coverage; negative security paths. |
| **Reviewer** | [`REVIEWER.md`](./REVIEWER.md) | ASVS 5.0 Audit & DoD Certification | SAST, secret checks, zero circular deps, and formal Definition of Done. |

## Governance Compliance
All workforce roles operate strictly under the 10 Non-Negotiable Invariants and Zero Host Install directives defined in [`AGENTS.md`](../../AGENTS.md).

