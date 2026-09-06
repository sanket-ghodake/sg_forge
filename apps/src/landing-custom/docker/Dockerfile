# ==============================================================================
# Custom Landing Service - Production Dockerfile (2026 LTS Baseline)
# Multi-Stage Alpine-Based Portable Image (<90MB Footprint)
# ==============================================================================
FROM oven/bun:1.3-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV LANDING_PORT=3000

# 1. Monorepo manifests & TypeScript path resolution
COPY package.json bun.lock* tsconfig.json ./

# 2. Custom Landing Service Source Code
COPY apps/src/landing-custom/ apps/src/landing-custom/

# 3. Create writable runtime directories and enforce non-root user
RUN mkdir -p /app/apps/src/landing-custom/logs && chown -R bun:bun /app

USER bun

EXPOSE 3000

# Non-destructive operational healthcheck
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["bun", "apps/src/landing-custom/src/server.ts"]
