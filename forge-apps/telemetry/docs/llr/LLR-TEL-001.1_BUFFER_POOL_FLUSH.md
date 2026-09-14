# LLR-TEL-001.1: Circular Buffer Pool Flush Algorithm

> **Low-Level Requirement (LLR)** | Status: `VERIFIED` | Traceability ID: `[LLR-TEL-001.1]`

---

## 1. Specification
Implements an asynchronous in-memory event buffer that batches high-volume incoming telemetry items and flushes them to SQLite in a single transaction.

## 2. Algorithm
1. Incoming `logEvent(entry)` pushes payload into in-memory array `eventBuffer`.
2. Check buffer length: if `eventBuffer.length >= 100`, trigger immediate `flushBuffer()`.
3. Background timer fires every 5000ms: if `eventBuffer.length > 0`, trigger `flushBuffer()`.
4. `flushBuffer()` swaps the buffer pointer, opens an SQLite transaction, executes batch inserts, and clears the swapped array.

## 3. Traceability Links
- **Parent HLR**: `[HLR-TEL-001]`
- **Implementation**: `src/server.ts`
- **Verification**: `test/unit/telemetry.test.ts`
