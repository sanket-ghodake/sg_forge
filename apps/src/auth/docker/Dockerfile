# ==============================================================================
# SG Forge 2.0 - Auth Server Container (2026 LTS)
# Multi-Stage Alpine-Based Portable Image (<90MB Footprint)
# ==============================================================================

FROM oven/bun:1.3-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3004
ENV AUTH_PORT=3004

# 1. Monorepo manifests & TypeScript path resolution
COPY package.json bun.lock* tsconfig.json ./

# 2. Shared Core Platform Libraries & Static Assets
COPY apps/src/sdk/ apps/src/sdk/
COPY apps/src/types/ apps/src/types/
COPY apps/src/ui/ apps/src/ui/
COPY public/ public/

# 3. Auth Service Source Code ONLY
COPY apps/src/auth/ apps/src/auth/

# 4. Create writable runtime directories and enforce non-root user
RUN mkdir -p /app/data /app/apps/data /app/apps/src/auth/logs && chown -R bun:bun /app

USER bun

EXPOSE 3004

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3004/health || exit 1

CMD ["bun", "apps/src/auth/src/server.ts"]
