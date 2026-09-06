# Tier 2: Integration Tests - @forge/docs

Integration tests verifying the HTTP handler in `@forge/docs`:
- Serving static HTML pages
- Handling `/health` and `/ready` probes
- ETag caching validation (304 Not Modified)
- 404 fallback for missing documents
