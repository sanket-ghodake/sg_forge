# 🐳 Production Docker Stack (`docker/prod/`)

Production-hardened, multi-stage compiled container stack.

## Architecture Highlights
- **True Multi-Stage Builds**: Stage 1 (`builder`) compiles and minifies source code; Stage 2 (`runner`) copies solely `/app/dist/server.js`.
- **Zero Source Code Leak**: No `.ts` source files, package manifests, or node_modules trees exist in shipping runner images.
- **Ahead-of-Time (AOT) Minification**: Tree-shaking, dead-code elimination, and identifier mangling executed at build time.
- **Air-Gapped Core Platform**: Core containers reside on `core-airgap-net` (`internal: true`) with ZERO outbound egress.
- **Unprivileged Non-Root Execution**: Runs under `USER bun` (UID 1000) with write permissions restricted to isolated volume mounts.
- **Resource Constraints**: Capped at 256MB RAM and 1.0 CPU per container with `restart: always`.

## Commands
```bash
# Start production containers (forces fresh builds)
rtk ./run.sh docker prod

# Build all production images
rtk ./run.sh docker build

# Check container health and metrics
rtk ./run.sh docker status

# Graceful shutdown
rtk ./run.sh docker down
```
