#!/bin/bash
# ================================
# Development Environment Start
# ================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 Starting Development Environment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check Docker
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker is not running${NC}"
  echo -e "${YELLOW}Please start Docker Desktop and try again${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Check .env.development
if [ ! -f ".env.development" ]; then
  echo -e "${YELLOW}⚠️  .env.development not found${NC}"
  echo -e "${YELLOW}Creating from .env.example...${NC}"
  cp .env.example .env.development
  echo -e "${GREEN}✅ Created .env.development${NC}"
  echo -e "${YELLOW}⚠️  Please update .env.development with your settings${NC}"
fi

echo ""
echo -e "${BLUE}Starting services...${NC}"
echo ""

# Start Docker Compose
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Cleanup на exit
trap "docker compose -f docker-compose.yml -f docker-compose.dev.yml down" EXIT
