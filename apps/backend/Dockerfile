# ================================
# Multi-Stage Dockerfile: Backend (NestJS)
# ================================
# Optimized for: caching, security, size, build speed
# Stages: base → dependencies → builder → development → production
# ================================

# ================================
# Stage 1: BASE
# Base image с общими зависимостями
# ================================
FROM node:22-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    curl \
    dumb-init

# Install pnpm globally
RUN npm install -g pnpm@10.18.3

# Metadata
LABEL maintainer="your-email@example.com"
LABEL description="Backend API (NestJS + PostgreSQL)"

WORKDIR /app

# ================================
# Stage 2: DEPENDENCIES
# Установка зависимостей с кешированием
# ================================
FROM base AS dependencies

# Copy workspace configuration first (для лучшего кеширования)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy root TypeScript config
COPY tsconfig.base.json ./

# Copy package.json files (только метаданные, не код)
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# ✅ OPTIMIZATION: pnpm fetch с кешированием store
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm fetch --frozen-lockfile

# ✅ OPTIMIZATION: install использует кешированный store
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --offline --prefer-offline

# ================================
# Stage 3: BUILDER
# Build production artifacts
# ================================
FROM dependencies AS builder

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm build

# Build backend
WORKDIR /app/apps/backend
RUN pnpm build

# ✅ OPTIMIZATION: Deploy production dependencies to /app/pruned
# Это создаёт чистую структуру только с prod deps
WORKDIR /app
RUN pnpm --filter @focus/backend --prod --legacy deploy pruned

# ================================
# Stage 4: DEVELOPMENT
# Hot reload, debugging, dev dependencies
# ================================
FROM dependencies AS development

ENV NODE_ENV=development
ENV PORT=3000

# Copy source code (в dev будет override bind mount)
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm build

# Switch to backend
WORKDIR /app/apps/backend

# Expose ports
EXPOSE 3000 9229

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD curl -f http://localhost:3000/health || exit 1

# Start with hot reload
CMD ["pnpm", "run", "start:debug"]

# ================================
# Stage 5: PRODUCTION
# Minimal production image
# ================================
FROM node:22-alpine AS production

# Install only runtime dependencies
RUN apk add --no-cache \
    dumb-init \
    curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# ✅ OPTIMIZATION: Copy only pruned production dependencies
# Это уже готовая структура с prod deps из builder stage
COPY --from=builder --chown=nodejs:nodejs /app/pruned ./

# Copy built artifacts
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared/package.json ./packages/shared/

COPY --from=builder --chown=nodejs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/backend/package.json ./apps/backend/

# Copy database files (migrations, seeds) для runtime
COPY --from=builder --chown=nodejs:nodejs /app/apps/backend/src/database ./apps/backend/src/database

# Switch to non-root user
USER nodejs

WORKDIR /app/apps/backend

# Environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# ✅ SECURITY: Use dumb-init для proper signal handling
CMD ["dumb-init", "node", "dist/main.js"]