# SG Forge Systems Traceability & Verification Data

This directory houses automated traceability reports and verification logs linking requirements to source code and tests across the SG Forge platform.

## Overview

Following **SG Forge Living Engineering Standards** (High-Reliability Systems, Modular C4, and Systems Engineering Standards), the SG Forge platform mandates bidirectional traceability:


$$\text{System Requirements (SR)} \longleftrightarrow \text{High-Level Requirements (HLR)} \longleftrightarrow \text{Low-Level Requirements (LLR)} \longleftrightarrow \text{Code Implementation} \longleftrightarrow \text{5-Tier Test Suites}$$

## Directory Contents

| File | Description | Source Generator |
| :--- | :--- | :--- |
| [`coverage-report.json`](./coverage-report.json) | JSON report of exported TypeScript symbols, declared requirements, code links, and test links. | `scripts/verify-doc-coverage.ts` |
| `README.md` | Directory documentation and systems traceability guidelines. | Manual / Agent |

## Verification Commands

- **Run AST Traceability Audit**:
  ```bash
  rtk ./run.sh docs:coverage
  ```
- **Pre-Commit Verification Gate**:
  Traceability parity is automatically enforced by **Check 29** in the pre-commit gate:
  ```bash
  rtk ./run.sh verify
  ```

## Tagging Syntax

Source functions, classes, and types must include TSDoc annotations linking them to corresponding LLR specifications:

```typescript
/**
 * Handles multi-tenant authentication token rotation.
 * @requirements [LLR-AUTH-001]
 */
export async function rotateSessionToken(...) { ... }
```
