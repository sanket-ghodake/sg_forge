# Test Suites - @forge/docs

This directory houses the 5-tier automated testing pyramid for the `@forge/docs` core microservice:

- `unit/`: MIME resolution, safe path normalization, and environment configuration loaders.
- `integration/`: In-memory HTTP request handling, ETag conditional headers, and static file streaming.
- `security/`: Directory traversal defense (`..` escapes, null-byte injections, encoded path separators).
- `contracts/`: JSON schema contracts for `/health` and `/ready` operational endpoints.
- `e2e/`: Full socket lifecycle, real HTTP requests, and server shutdown verification on live port.
