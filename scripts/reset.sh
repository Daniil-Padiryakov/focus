#!/bin/bash
# ================================
# Reset Development Environment
# ================================

set -e

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}⚠️  This will:"
echo "   - Stop all containers"
echo "   - Remove all containers"
echo "   - Remove all volumes (DATABASE DATA WILL BE LOST!)"
echo "   - Rebuild images"
echo -e "${NC}"

read -p "Are you sure? (yes/no): " -r
if [[ ! $REPLY =~ ^yes$ ]]; then
  echo "Cancelled"
  exit 0
fi

echo ""
echo "🔄 Resetting development environment..."

# Stop и remove everything
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v

# Remove old images
docker compose -f docker-compose.yml -f docker-compose.dev.yml rm -f

echo ""
echo "🔨 Rebuilding images..."

# Rebuild
docker compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache

echo ""
echo "✅ Reset complete!"
echo ""
echo "Run: pnpm dev"
