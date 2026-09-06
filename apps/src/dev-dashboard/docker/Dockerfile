# ==============================================================================
# SG Forge 2.0 - Optimized Dev Dashboard Container (2026 LTS)
# Multi-Stage Alpine-Based Portable Image (<90MB Footprint)
# ==============================================================================

FROM oven/bun:1.3-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002
ENV DEV_DASHBOARD_PORT=3002

# 1. Monorepo manifests & TypeScript path resolution
COPY package.json bun.lock* tsconfig.json ./

# 2. Shared Core Platform Libraries & Static Assets
COPY apps/src/sdk/ apps/src/sdk/
COPY apps/src/types/ apps/src/types/
COPY apps/src/ui/ apps/src/ui/
COPY public/ public/

# 3. Dev Dashboard Service Source Code ONLY
COPY apps/src/dev-dashboard/ apps/src/dev-dashboard/

# 4. Create writable runtime directories and enforce non-root user
RUN mkdir -p /app/data /app/apps/data /app/apps/src/dev-dashboard/logs && chown -R bun:bun /app

USER bun

EXPOSE 3002

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3002/health || exit 1

CMD ["bun", "apps/src/dev-dashboard/src/server.ts"]
