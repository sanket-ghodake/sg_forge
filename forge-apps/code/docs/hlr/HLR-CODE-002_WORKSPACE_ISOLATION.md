# HLR-CODE-002: Sandboxed Workspace & Concurrency Lock

> **High-Level Requirement (HLR)** | Status: `VERIFIED` | Traceability ID: `[HLR-CODE-002]`

---

## 1. Overview & Capability
The Code microservice coordinates remote cloud editor sessions and file traversal operations within strictly isolated workspace containers, preventing lateral movement or sensitive host information leakage.

## 2. Invariants & Security
1. **Path Clamping**: Absolute file paths must be validated to ensure zero traversal outside the allocated workspace boundary (`/workspace`).
2. **Token Scrubbing**: Command strings containing git clone credentials or authentication tokens must be redacted before logging or executing.
3. **Managed Egress**: Managed outbound connections for dependency fetching must pass through verified proxies without unrestricted access.

## 3. Downstream Traceability
- **Low-Level Requirements**:
  - `[LLR-CODE-002.1]`: Workspace Sandbox Path Defense
  - `[LLR-CODE-003.1]`: Git Remote & Secret Token Sanitizer
- **Verification Suites**:
  - `forge-apps/code/test/security/git-sanitizer.test.ts`
  - `forge-apps/code/test/integration/code-server.test.ts`
