#!/bin/bash
# ================================
# Check Service Health
# ================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🏥 Checking service health..."
echo ""

# Check PostgreSQL
echo -n "PostgreSQL: "
if docker compose exec -T postgres pg_isready > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Healthy${NC}"
else
  echo -e "${RED}❌ Unhealthy${NC}"
fi

# Check Backend
echo -n "Backend:    "
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Healthy${NC}"
  curl -s http://localhost:3000/health | jq '.'
else
  echo -e "${RED}❌ Unhealthy${NC}"
fi

echo ""

# Check Frontend
echo -n "Frontend:   "
if curl -f http://localhost:5173 > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Healthy${NC}"
else
  echo -e "${RED}❌ Unhealthy${NC}"
fi

echo ""

# Docker stats
echo "📊 Resource Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
