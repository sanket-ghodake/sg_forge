# ==============================================================================
# SG Forge Submodule - Telemetry Microservice Container (2026 LTS)
# 100% Isolated Build: Zero dependencies or code shared from central apps
# ==============================================================================
FROM oven/bun:1.3-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8087

# 1. Standalone manifests & local TypeScript configuration
COPY package.json bun.lock* tsconfig.json ./
RUN if [ -f bun.lock ] || [ -f bun.lockb ] || grep -q '"dependencies": {' package.json; then bun install --production 2>/dev/null || true; fi

# 2. Standalone Micro-App Source Code ONLY
COPY src/ ./src/

# 3. Create writable runtime directories and enforce non-root user
RUN mkdir -p /app/data /app/logs && chown -R bun:bun /app

USER bun

EXPOSE 8087

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8087/health || exit 1

CMD ["bun", "src/server.ts"]
