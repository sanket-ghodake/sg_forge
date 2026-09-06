# ==============================================================================
# SG Forge 2.0 - Landing Hub Container (2026 LTS)
# Multi-Stage Alpine-Based Portable Image (<90MB Footprint)
# ==============================================================================

FROM oven/bun:1.3-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV LANDING_PORT=3000

# 1. Monorepo manifests & TypeScript path resolution
COPY package.json bun.lock* tsconfig.json ./

# 2. Shared Core Platform Libraries & Static Assets
COPY apps/src/sdk/ apps/src/sdk/
COPY apps/src/types/ apps/src/types/
COPY apps/src/ui/ apps/src/ui/
COPY public/ public/

# 3. Landing Service Source Code ONLY
COPY apps/src/landing/ apps/src/landing/

# 4. Create writable runtime directories and enforce non-root user
RUN mkdir -p /app/apps/src/landing/logs && chown -R bun:bun /app

USER bun

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["bun", "apps/src/landing/src/server.ts"]
