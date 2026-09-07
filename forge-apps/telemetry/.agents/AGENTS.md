# SG FORGE SUBMODULE DIRECTIVES

## Autonomous Microservice Invariants
1. **Zero Monorepo Bleed**: All files, libraries, dependencies, and test fixtures are self-contained within this submodule.
2. **Dedicated Database**: Dedicated Turso SQLite DB in `data/`.
3. **Outbound Security**: Responsible for its own network egress calls, rate limiting, and credentials.
4. **Zero Auto-Commits**: Never run `git commit` unless explicitly instructed.
