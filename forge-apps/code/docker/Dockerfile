# ==============================================================================
# SG Forge Submodule - Cloud VS Code Microservice Container (2026 LTS)
# ==============================================================================
FROM oven/bun:1.3-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8088

# Install Git for workspace sanitization & checkout operations
RUN apk add --no-cache git

COPY package.json bun.lock* tsconfig.json ./
RUN if [ -f bun.lock ] || [ -f bun.lockb ] || grep -q '"dependencies": {' package.json; then bun install --production 2>/dev/null || true; fi

COPY src/ ./src/

RUN mkdir -p /app/data /app/logs && chown -R bun:bun /app

USER bun

EXPOSE 8088

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8088/health || exit 1

CMD ["bun", "src/server.ts"]
