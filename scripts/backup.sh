#!/bin/bash
# ================================
# Database Backup Script
# ================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/focus_db_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

echo -e "${BLUE}🗄️  Creating database backup...${NC}"

# Backup PostgreSQL
docker compose exec -T postgres pg_dump \
  -U $DATABASE_USER \
  -d $DATABASE_NAME \
  | gzip > "$BACKUP_FILE"

echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"

# Keep only last 7 backups
ls -t "$BACKUP_DIR"/focus_db_*.sql.gz | tail -n +8 | xargs -r rm

echo -e "${GREEN}✅ Old backups cleaned (keeping last 7)${NC}"
