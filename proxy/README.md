# 🔀 Unified Reverse Proxy Gateway (`proxy/`)

High-performance reverse proxy routing gateway (Caddy v2.11.4 LTS).

* **Auto-Generated File**: [`Caddyfile`](proxy/Caddyfile) is dynamically generated from `.env` via `scripts/generate-proxy.ts`.
* **Static Error Pages**: Mounted from `proxy/errors/` to `/etc/caddy/errors` for all 10 standard HTTP status codes (`400`, `401`, `403`, `404`, `405`, `429`, `500`, `502`, `503`, `504`). Zero-dependency Astryx error screens served at the edge with zero upstream Bun runtime overhead.
* **Direct Error Access**: Static error pages accessible via `/errors/*` (e.g. `/errors/404.html`, `/errors/502.html`).
* **Unregistered App Catch-All**: Nonexistent `/apps/*` paths are intercepted directly at the proxy layer, returning RFC 7807 JSON for API clients and Astryx 404 HTML for browsers.
* **Sync Command**: `./run.sh sync-proxy` (automatically compiles all 10 error pages, updates Caddyfile, triggers zero-downtime hot-reload on the running Caddy daemon in <5ms, and audits `forge_apps_net` for decommissioned/orphaned containers).

---

## 🔒 Production TLS & Ingress Configuration

* **Independent Ingress Protocol Controls (`.env`)**:
  - `ENABLE_HTTP=true` (default): Serves HTTP on port `:80` (prod) or `:8080` (dev). Set to `false` to run in HTTPS-only mode and block unencrypted traffic.
  - `ENABLE_HTTPS=true` (default): Serves TLS/HTTPS on port `:443` (prod) or `:8443` (dev). Set to `false` to run in HTTP-only mode.
  - Dual-Stack (default): Both `ENABLE_HTTP=true` and `ENABLE_HTTPS=true` run simultaneously with zero port conflict.
* **Air-Gapped Local Internal PKI (Default)**:
  Set `ENABLE_HTTPS=true` and `HTTPS_PORT=443` (or `PROD_HTTPS_PORT=443`) in `.env`. Running `./run.sh sync-proxy` adds `tls internal` to generate self-signed enterprise certificates offline without external ACME lookups.
* **Custom Enterprise CA Certificates**:
  Set `TLS_CERT_PATH=/path/to/cert.pem` and `TLS_KEY_PATH=/path/to/key.pem` in `.env`. Caddy will mount and serve your organization's verified certificates.
* **Ports**: In development, HTTP uses `:8080` and HTTPS uses `:8443`. In production Docker stacks, ports `:80` and `:443` are bound.
