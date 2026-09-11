# 🐳 Docker Container Topography (`docker/`)

Standardized container orchestration topologies for the SG Forge enterprise monorepo platform.

## Architecture & Stacks

| Subdirectory | Target Environment | Execution Strategy | Security Posture |
| :--- | :--- | :--- | :--- |
| **[`dev/`](./dev/)** | Local Development | Host bind mounts + `bun --watch` inotify hot-reloading | Direct host mirror, 128MB RAM caps, named DB volumes |
| **[`prod/`](./prod/)** | Production Deployment | True multi-stage AOT compilation + minification + obfuscation | Non-root `USER bun`, zero `.ts` source leak, 256MB RAM caps |

## Operational Commands via `run.sh`

```bash
# Launch development environment with sub-5ms hot reload
rtk ./run.sh docker up

# Launch production-hardened environment
rtk ./run.sh docker prod

# Build all production images
rtk ./run.sh docker build

# Monitor real-time status and health
rtk ./run.sh docker status

# Graceful stop
rtk ./run.sh docker down
```

For full documentation and diagrams, see the [Docker Orchestration Guide](file:///home/sanket/Desktop/Sanket/org_website_clone/apps/src/docs/src/content/docs/operations/docker-orchestration.mdx).
