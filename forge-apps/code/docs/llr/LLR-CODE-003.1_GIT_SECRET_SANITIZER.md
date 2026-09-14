# LLR-CODE-003.1: Git Remote & Secret Token Sanitizer

> **Low-Level Requirement (LLR)** | Status: `VERIFIED` | Traceability ID: `[LLR-CODE-003.1]`

---

## 1. Specification
Scrubs embedded credentials, personal access tokens (PATs), and private repository secrets from Git URLs and command arguments before telemetry logging or process invocation.

## 2. Invariants
- Regex replacement of `https://user:token@github.com` patterns with `https://***:***@github.com`.
- Zero credentials leak to browser console or rolling logs.

## 3. Traceability Links
- **Parent HLR**: `[HLR-CODE-002]`
- **Implementation**: `src/git-sanitizer.ts`
- **Verification**: `test/security/git-sanitizer.test.ts`
