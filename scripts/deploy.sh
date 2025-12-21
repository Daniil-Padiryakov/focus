#!/bin/bash
# ================================
# Manual Deployment Helper
# ================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ENVIRONMENT="${1:-staging}"

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
  echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
  echo "Usage: ./scripts/deploy.sh [staging|production]"
  exit 1
fi

# Production требует подтверждения
if [ "$ENVIRONMENT" = "production" ]; then
  echo -e "${RED}⚠️  WARNING: Deploying to PRODUCTION${NC}"
  read -p "Are you sure? (yes/no): " -r
  if [[ ! $REPLY =~ ^yes$ ]]; then
    echo "Cancelled"
    exit 0
  fi
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 Deploying to $ENVIRONMENT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Load environment-specific vars
if [ -f ".env.$ENVIRONMENT" ]; then
  source ".env.$ENVIRONMENT"
else
  echo -e "${RED}❌ .env.$ENVIRONMENT not found${NC}"
  exit 1
fi

# Pull latest images
echo -e "${YELLOW}[1/5] Pulling images...${NC}"
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull

# Backup database (production only)
if [ "$ENVIRONMENT" = "production" ]; then
  echo -e "${YELLOW}[2/5] Creating backup...${NC}"
  ./scripts/backup.sh
else
  echo -e "${YELLOW}[2/5] Skipping backup (staging)${NC}"
fi

# Deploy with zero-downtime
echo -e "${YELLOW}[3/5] Deploying...${NC}"
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --remove-orphans

# Wait for healthy
echo -e "${YELLOW}[4/5] Waiting for services...${NC}"
sleep 30

# Run migrations
echo -e "${YELLOW}[5/5] Running migrations...${NC}"
docker compose exec backend pnpm --filter @focus/backend run migration:run

# Health check
echo ""
echo -e "${YELLOW}Running health checks...${NC}"
if curl -f http://localhost:3000/health; then
  echo ""
  echo -e "${GREEN}✅ Deployment successful!${NC}"
  echo ""
  docker compose ps
else
  echo ""
  echo -e "${RED}❌ Health check failed${NC}"
  echo -e "${YELLOW}Rolling back...${NC}"
  ./scripts/rollback.sh
  exit 1
fi
