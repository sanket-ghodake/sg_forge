# LLR-CODE-001.1: Lock Coordinator Concurrency Algorithm

> **Low-Level Requirement (LLR)** | Status: `VERIFIED` | Traceability ID: `[LLR-CODE-001.1]`

---

## 1. Algorithmic Specification
Coordinates single-seat cloud IDE session tenancy to prevent concurrent write collisions across distributed browser windows:
1. **Acquire Session**: Check `activeUser`. If null or expired (heartbeat > 30s), assign lock to requesting user and record epoch heartbeat.
2. **Heartbeat Refresh**: Active user emits ping every 10s. If time delta < 30s, update timestamp.
3. **Takeover Request**: When a secondary user requests access, initiate a 60-second countdown and notify the active user.
4. **Resolution**: If active user explicitly allows, transfer lock immediately. If countdown expires without response, forcibly reassign seat.

## 2. Invariants
- Zero multi-writer race conditions.
- State is managed in-memory with periodic durable state flushing.

## 3. Traceability Links
- **Parent HLR**: `[HLR-CODE-001]`
- **Implementation**: `src/session-coordinator.ts`
- **Verification**: `test/unit/lock-coordinator.test.ts`
