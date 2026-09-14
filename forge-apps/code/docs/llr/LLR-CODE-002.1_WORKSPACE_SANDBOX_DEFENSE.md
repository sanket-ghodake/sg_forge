# LLR-CODE-002.1: Workspace Sandbox Path Defense

> **Low-Level Requirement (LLR)** | Status: `VERIFIED` | Traceability ID: `[LLR-CODE-002.1]`

---

## 1. Specification
Ensures that all file creation, read, and write operations requested via cloud editor APIs resolve strictly within the designated workspace root directory.

## 2. Algorithm
1. Receive target file relative path from request.
2. Canonicalize path via `path.resolve(WORKSPACE_ROOT, targetPath)`.
3. Verify that the canonical path begins with `WORKSPACE_ROOT`.
4. Reject paths containing directory traversal primitives (`../`, `..\\`) or null bytes with HTTP 403 Forbidden.

## 3. Traceability Links
- **Parent HLR**: `[HLR-CODE-002]`
- **Implementation**: `src/git-sanitizer.ts`
- **Verification**: `test/integration/code-server.test.ts`
