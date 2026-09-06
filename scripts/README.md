# 🛠️ Platform Automation Scripts (`scripts/`)

Build, verification, orchestration, and audit logging scripts.

* **[`verify-gate.ts`](scripts/verify-gate.ts)**: 2-tier pre-commit quality gate (12 deterministic checks + 4 AI semantic evaluations).
* **[`log-commit.ts`](scripts/log-commit.ts)**: Automated ground-truth Git post-commit extractor. Appends structured JSON to `logs/commits.jsonl` and formatted entries to `logs/WORKLOGS.md`.
* **[`seed-cro-org.ts`](scripts/seed-cro-org.ts)**: Populates the live Auth database with a complete 54-member organizational hierarchy rooted at the Chief Revenue Officer (CRO).
* **[`generate-proxy.ts`](scripts/generate-proxy.ts)**: Reads `.env` and generates `proxy/Caddyfile` with dynamic route ingress and `handle_errors` outage fallback.
* **[`generate-error-pages.ts`](scripts/generate-error-pages.ts)**: Pre-compiles standalone Astryx error pages (`502.html`, `503.html`, `500.html`, `404.html`) into `proxy/errors/`.
* **[`fallback-server.ts`](scripts/fallback-server.ts)**: Standalone host-level micro-daemon (Approach A) serving Astryx system-down pages when Docker/Caddy is offline.
* **[`dev-runner.ts`](scripts/dev-runner.ts)**: Dynamic native development supervisor with port collision detection, SIGINT process group cleanup, and registry-driven service discovery.
* **[`exec-watchdog.ts`](scripts/exec-watchdog.ts)**: Subprocess execution watchdog and deadlock prevention utility enforcing hard timeouts and non-blocking I/O.
* **[`brand-lock.ts`](scripts/brand-lock.ts)**: Brand asset Git lock & in-place customization engine leveraging skip-worktree to prevent Git drift.
* **[`run/`](scripts/run)**: Modular runners for `run.sh` adhering to the 500-line cap (`env.sh`, `help.sh`, `core.sh`, `docker.sh`, `quality.sh`, `ops.sh`).
* **[`test/run-sh.test.ts`](scripts/test/run-sh.test.ts)**: Comprehensive 30-assertion Tier 1 test suite validating all commands and portable wrappers.

