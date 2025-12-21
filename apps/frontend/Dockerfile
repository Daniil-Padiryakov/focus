# ================================
# Multi-Stage Dockerfile: Frontend (React + Vite)
# ================================
# Optimized for: caching, build speed, production size
# Stages: base → dependencies → builder → development → production
# ================================

# ================================
# Stage 1: BASE
# ================================
FROM node:22-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm@10.18.3

# Metadata
LABEL maintainer="your-email@example.com"
LABEL description="Frontend (React + Vite)"

WORKDIR /app

# ================================
# Stage 2: DEPENDENCIES
# Установка зависимостей с кешированием
# ================================
FROM base AS dependencies

# Copy workspace configuration (для кеширования)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy package.json files
COPY packages/shared/package.json ./packages/shared/
COPY apps/frontend/package.json ./apps/frontend/

# ✅ OPTIMIZATION: pnpm fetch с BuildKit cache
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm fetch --frozen-lockfile

# ✅ OPTIMIZATION: install использует кешированный store
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --offline --prefer-offline

# ================================
# Stage 3: BUILDER
# Build production static files
# ================================
FROM dependencies AS builder

# Build args (можно override в docker-compose или при сборке)
ARG VITE_API_URL=http://localhost:3000
ARG VITE_APP_NAME=Focus
ARG VITE_APP_VERSION=1.0.0

# Передаём в environment для Vite
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm build

# Build frontend (Vite creates optimized production bundle)
WORKDIR /app/apps/frontend
RUN pnpm run build

# Output: /app/apps/frontend/dist/
# ✅ Vite automatically:
# - Minifies JS/CSS
# - Tree-shakes unused code
# - Generates hashed filenames for cache busting
# - Creates source maps (если настроено)

# ================================
# Stage 4: DEVELOPMENT
# Vite dev server с HMR
# ================================
FROM dependencies AS development

ENV NODE_ENV=development

# Copy source code (в dev будет override bind mount)
COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm build

# Switch to frontend
WORKDIR /app/apps/frontend

# Expose Vite dev server port
EXPOSE 5173

# ✅ Vite HMR с правильными настройками
# --host 0.0.0.0 - доступ из Docker host
# --port 5173 - явно указываем порт
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0", "--port", "5173"]

# ================================
# Stage 5: PRODUCTION
# Nginx serving static files
# ================================
FROM nginx:1.27-alpine AS production

# ✅ Install curl for healthcheck
RUN apk add --no-cache curl

# Copy custom nginx config
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# ✅ SECURITY: Configure nginx permissions for non-root
# Note: nginx user уже существует в nginx:alpine, НЕ создаём заново!
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

EXPOSE 80

# ✅ Health check с curl (более надёжно чем wget)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx в foreground
CMD ["nginx", "-g", "daemon off;"]