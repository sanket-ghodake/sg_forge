# ==============================================================================
# SG Forge 2.0 - Optimized Dev Dashboard Container (2026 LTS)
# Multi-Stage Alpine-Based Portable Image with AOT Minification & Obfuscation
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build, Compile & Minify
# ------------------------------------------------------------------------------
FROM oven/bun:1.3-alpine AS builder

WORKDIR /build

COPY package.json bun.lock* tsconfig.json ./
RUN if [ -f bun.lock ] || [ -f bun.lockb ]; then bun install --frozen-lockfile 2>/dev/null || true; fi

COPY apps/src/sdk/ apps/src/sdk/
COPY apps/src/types/ apps/src/types/
COPY apps/src/ui/ apps/src/ui/
COPY apps/src/dev-dashboard/ apps/src/dev-dashboard/

# AOT bundle & minify into /build/dist (strips comments, mangles identifiers, dead-code elimination)
RUN bun build apps/src/dev-dashboard/src/server.ts --target=bun --minify --sourcemap=none --outdir /build/dist

# ------------------------------------------------------------------------------
# Stage 2: Minimal Hardened Runtime Runner (Zero Source Code Leak)
# ------------------------------------------------------------------------------
FROM oven/bun:1.3-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002
ENV DEV_DASHBOARD_PORT=3002

# Copy ONLY compiled minified bundle and static assets (Zero .ts files)
COPY --from=builder /build/dist/server.js /app/dist/server.js
COPY public/ public/

# Create runtime directories & enforce non-root user
RUN mkdir -p /app/data /app/apps/data /app/apps/src/dev-dashboard/logs /app/dist && chown -R bun:bun /app

USER bun

EXPOSE 3002

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3002/health || exit 1

CMD ["bun", "dist/server.js"]
