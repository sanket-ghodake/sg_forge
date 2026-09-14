# LLR-TEL-002.1: RFC 7807 Error Sanitization & PII Redaction

> **Low-Level Requirement (LLR)** | Status: `VERIFIED` | Traceability ID: `[LLR-TEL-002.1]`

---

## 1. Specification
Ensures all error responses produced by the Telemetry API emit RFC 7807 `application/problem+json` envelopes with sensitive credentials (passwords, JWT tokens, API keys) redacted.

## 2. Invariants
- RFC 7807 response schema includes `type`, `title`, `status`, `detail`, `instance`, and `traceId`.
- Internal stack traces and raw database errors are suppressed in client responses.

## 3. Traceability Links
- **Parent HLR**: `[HLR-TEL-003]`
- **Implementation**: `src/server.ts`
- **Verification**: `test/contracts/problem-json.test.ts`
