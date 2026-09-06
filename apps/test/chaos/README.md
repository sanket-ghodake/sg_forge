# 🌪️ Platform Chaos & Concurrency Test Suite (`apps/test/chaos/`)

High-concurrency load, stress, and chaos fault injection testing across platform services, rate limiters, and Turso SQLite database instances.

## 🎯 Coverage Scope
- **Rate Limit Saturation**: High-speed parallel requests verifying HTTP 429 and Retry-After behavior.
- **Concurrent WAL Writes**: Heavy simultaneous write transactions to ensure zero corruption or lockups.
- **Fault Injection**: Injected network disconnects and malformed requests verifying RFC 7807 problem details responses.
