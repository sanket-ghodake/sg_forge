# 🐳 Development Docker Stack (`docker/dev/`)

Hot-reloading local Docker development environment driven dynamically by `.env`.

## Architecture Highlights
- **Direct Image Runner**: Powered directly by `oven/bun:1.3-alpine`, eliminating image rebuild delays.
- **Inotify Hot Reload**: Executes `bun --watch` on each service entrypoint (`server.ts`).
- **Read-Only Dependencies**: Monorepo configuration, source libraries (`apps/src/sdk`, `apps/src/ui`), and `node_modules` are mounted `:ro`.
- **Persistent Data**: Database state is preserved in named volumes (`ag_dev_db_auth`, `ag_dev_db_portal`, `ag_dev_db_dev_dashboard`).
- **Resource Constraints**: Capped at 128MB RAM and 0.5 CPU per container.

## Commands
```bash
# Start all dev containers
rtk ./run.sh docker up

# Start single service or Forge App
rtk ./run.sh docker up code

# Inspect logs
rtk ./run.sh docker logs

# Graceful shutdown
rtk ./run.sh docker down
```
