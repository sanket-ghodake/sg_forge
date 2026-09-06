# Source - @forge/docs

This directory contains the source code for the `@forge/docs` core documentation service.

- `config.ts`: Environment configuration, port resolution, static asset root paths, and MIME type resolution map.
- `server.ts`: Bun HTTP server, static file router with path normalization, `/health` and `/ready` probes, and RFC 7807 problem handlers.
- `index.ts`: Module export and service registration entrypoint.
