#!/bin/bash
# ================================
# Migration Verification Script
# ================================
# Проверяет что все миграции могут быть применены и откачены
# Использует отдельную тестовую базу данных

set -e

echo "🔍 Verifying database migrations..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database config
export NODE_ENV=test
export DATABASE_HOST=${DATABASE_HOST:-localhost}
export DATABASE_PORT=${DATABASE_PORT:-5432}
export DATABASE_NAME="migration_test_$(date +%s)"
export DATABASE_USER=${DATABASE_USER:-postgres}
export DATABASE_PASSWORD=${DATABASE_PASSWORD:-postgres}

echo "📝 Configuration:"
echo "  Host: $DATABASE_HOST:$DATABASE_PORT"
echo "  Database: $DATABASE_NAME"
echo "  User: $DATABASE_USER"
echo ""

# Create test database
echo "🔧 Creating test database..."
PGPASSWORD=$DATABASE_PASSWORD createdb -h $DATABASE_HOST -p $DATABASE_PORT -U $DATABASE_USER $DATABASE_NAME || {
  echo -e "${RED}❌ Failed to create test database${NC}"
  exit 1
}
echo -e "${GREEN}✅ Test database created${NC}"
echo ""

# Function to cleanup
cleanup() {
  echo ""
  echo "🧹 Cleaning up..."
  PGPASSWORD=$DATABASE_PASSWORD dropdb -h $DATABASE_HOST -p $DATABASE_PORT -U $DATABASE_USER $DATABASE_NAME --if-exists
  echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Trap cleanup on exit
trap cleanup EXIT

# Run migrations up
echo "⬆️  Running migrations (up)..."
pnpm --filter @focus/backend migration:run || {
  echo -e "${RED}❌ Migration up failed${NC}"
  exit 1
}
echo -e "${GREEN}✅ All migrations applied successfully${NC}"
echo ""

# Check migration status
echo "📊 Migration status:"
pnpm --filter @focus/backend exec knex migrate:status --knexfile src/database/knexfile.ts
echo ""

# Run migrations down
echo "⬇️  Rolling back migrations (down)..."
pnpm --filter @focus/backend migration:rollback --all || {
  echo -e "${RED}❌ Migration rollback failed${NC}"
  exit 1
}
echo -e "${GREEN}✅ All migrations rolled back successfully${NC}"
echo ""

# Run migrations up again to verify idempotency
echo "⬆️  Re-running migrations (testing idempotency)..."
pnpm --filter @focus/backend migration:run || {
  echo -e "${RED}❌ Second migration run failed${NC}"
  exit 1
}
echo -e "${GREEN}✅ Migrations are idempotent${NC}"
echo ""

echo -e "${GREEN}🎉 All migration verification checks passed!${NC}"
