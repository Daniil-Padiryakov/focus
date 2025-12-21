#!/bin/bash
# ================================
# Rollback Deployment
# ================================

set -e

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${RED}⚠️  Rolling back deployment...${NC}"

# Stop current containers
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Pull previous version (tagged with :previous)
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull

# Start with previous version
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

echo ""
echo -e "${GREEN}✅ Rollback completed${NC}"

# Health check
sleep 30

if curl -f http://localhost:3000/health; then
  echo -e "${GREEN}✅ Services are healthy after rollback${NC}"
else
  echo -e "${RED}❌ Services unhealthy after rollback${NC}"
  exit 1
fi
