# Tier 5: E2E Tests - @forge/docs

End-to-End tests validating real network execution for `@forge/docs`:
- Starting live Bun server on an ephemeral TCP port
- Fetching HTML pages and static assets over real socket
- Gracefully terminating server process without leaking sockets
