# LLR-TEL-003.1: SSE Subscriber Dispatcher & Lifecycle

> **Low-Level Requirement (LLR)** | Status: `VERIFIED` | Traceability ID: `[LLR-TEL-003.1]`

---

## 1. Specification
Maintains persistent HTTP Server-Sent Events (SSE) connections to browser clients, broadcasting real-time CPU, memory, and error count metrics.

## 2. Invariants
- Sets headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`.
- Dispatches periodic heartbeat comment `:ping\n\n` every 15 seconds.
- Automatically removes closed subscriber connections on client abort or socket error.

## 3. Traceability Links
- **Parent HLR**: `[HLR-TEL-003]`
- **Implementation**: `src/server.ts`
- **Verification**: `test/e2e/telemetry-server.test.ts`
