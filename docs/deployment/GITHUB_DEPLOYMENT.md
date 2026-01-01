# Deployment Guide

## GitHub Secrets Setup

Настрой эти secrets в repository settings:

### Для Staging

`Settings → Secrets and variables → Actions → New repository secret`

```
STAGING_SSH_KEY       - Private SSH key для staging сервера
STAGING_HOST          - staging.yourdomain.com
STAGING_USER          - deploy
DATABASE_PASSWORD     - Staging database password
JWT_SECRET            - Staging JWT secret (min 32 chars)
REFRESH_SECRET        - Staging refresh token secret
```

### Для Production

```
PRODUCTION_SSH_KEY    - Private SSH key для production сервера
PRODUCTION_HOST       - yourdomain.com
PRODUCTION_USER       - deploy
DATABASE_PASSWORD     - Production database password
JWT_SECRET            - Production JWT secret (min 32 chars)
REFRESH_SECRET        - Production refresh token secret
```

## SSH Key Generation

```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions@deploy" -f ~/.ssh/github_deploy

# Add public key к серверу
ssh-copy-id -i ~/.ssh/github_deploy.pub deploy@staging.yourdomain.com

# Copy private key для GitHub Secret
cat ~/.ssh/github_deploy
# → Copy output to STAGING_SSH_KEY secret
```

## Deployment Workflow

### Staging

```bash
# Автоматически при push в develop
git push origin develop

# Или manually:
# GitHub → Actions → "Deploy to Staging" → Run workflow
```

### Production

```bash
# Merge develop → main (через PR)
# Deployment начнётся автоматически

# Требует approval:
# GitHub → Actions → Deployment → Review → Approve

# Или manually:
# GitHub → Actions → "Deploy to Production" → Run workflow
```

## Environment Protection Rules

### Setup Branch Protection

`Settings → Environments`

**Staging:**

- Deployment branches: `develop`
- No approval required (auto-deploy)

**Production:**

- Deployment branches: `main`
- Required reviewers: 1+ (manual approval)
- Wait timer: 5 minutes (cooling period)

## Rollback Procedure

### Automatic Rollback

Deployment автоматически откатится если:

- Health check fails
- Container exits
- Мониторинг обнаружил проблемы

### Manual Rollback

```bash
# SSH к серверу
ssh deploy@yourdomain.com

cd ~/focus

# Rollback к предыдущей версии
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Мониторинг Deployment

### Проверка статуса

```bash
# View logs
docker compose logs -f backend frontend

# Check container health
docker compose ps

# View resource usage
docker stats

# Health endpoint
curl https://api.yourdomain.com/health
```

## Troubleshooting

### Deployment Stuck

```bash
# Check container status
docker compose ps

# Check logs
docker compose logs backend

# Force recreate
docker compose up -d --force-recreate
```

### Health Check Failing

```bash
# Проверь health endpoint напрямую
docker compose exec backend curl http://localhost:3000/health

# Проверь database connection
docker compose exec backend env | grep DATABASE

# Проверь migrations
docker compose exec backend pnpm --filter @focus/backend run migration:status
```

### Rollback Failed

```bash
# Manual recovery:

# 1. Stop all containers
docker compose down

# 2. Pull previous version
docker pull ghcr.io/username/focus/backend:previous-tag

# 3. Start с конкретной версией
export BACKEND_IMAGE=ghcr.io/username/focus/backend:previous-tag
docker compose up -d
```
