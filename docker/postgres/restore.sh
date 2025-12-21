#!/bin/bash
# ================================
# PostgreSQL Restore Script
# ================================
set -e
set -o pipefail

# ================================
# Validation
# ================================
BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
  echo "[ERROR] Usage: ./restore.sh <backup_file.sql.gz>"
  echo ""
  echo "Available backups:"
  find ./backups -name "backup_*.sql.gz" -exec ls -lh {} \; 2>/dev/null | tail -10
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "[ERROR] Backup file not found: $BACKUP_FILE"
  exit 1
fi

# ================================
# Load environment from backup path
# ================================
if [[ "$BACKUP_FILE" == *"/production/"* ]]; then
    ENV="production"
elif [[ "$BACKUP_FILE" == *"/test/"* ]]; then
    ENV="test"
else
    ENV="development"
fi

ENV_FILE=".env.${ENV}"
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
    echo "[INFO] Environment: $ENV"
fi

# ================================
# Get credentials from container
# ================================
DB_USER=$(docker compose exec -T postgres printenv POSTGRES_USER | tr -d '\r\n')
DB_NAME=$(docker compose exec -T postgres printenv POSTGRES_DB | tr -d '\r\n')

if [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
    echo "[ERROR] Could not get database credentials"
    exit 1
fi

# ================================
# Confirmation
# ================================
echo ""
echo "[WARN] This will REPLACE database: $DB_NAME"
echo "[INFO] Backup: $BACKUP_FILE"
echo ""
read -p "Continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  echo "[INFO] Cancelled"
  exit 0
fi

# ================================
# Stop backend & terminate connections
# ================================
echo "[INFO] Stopping backend..."
docker compose stop backend 2>/dev/null || true
sleep 2

echo "[INFO] Terminating active connections..."
docker compose exec -T postgres psql -U "$DB_USER" -d postgres -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
" 2>/dev/null || true

# ================================
# Drop & recreate database
# ================================
echo "[INFO] Dropping database: $DB_NAME"
docker compose exec -T postgres psql -U "$DB_USER" -d postgres -c \
  "DROP DATABASE IF EXISTS $DB_NAME;" || {
    echo "[ERROR] Failed to drop database"
    docker compose start backend
    exit 1
}

echo "[INFO] Creating database: $DB_NAME"
docker compose exec -T postgres psql -U "$DB_USER" -d postgres -c \
  "CREATE DATABASE $DB_NAME;" || {
    echo "[ERROR] Failed to create database"
    docker compose start backend
    exit 1
}

# ================================
# Restore data
# ================================
echo "[INFO] Restoring from: $BACKUP_FILE"

gunzip -c "$BACKUP_FILE" | \
  docker compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" || {
    echo "[ERROR] Restore failed"
    docker compose start backend
    exit 1
}

# ================================
# Verify & restart
# ================================
TABLE_COUNT=$(docker compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -t -c \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" \
  | tr -d ' \r\n')

echo "[INFO] Restored $TABLE_COUNT tables"

echo "[INFO] Starting backend..."
docker compose start backend

echo ""
echo "[SUCCESS] Database restored successfully!"
echo "[INFO] Database: $DB_NAME ($TABLE_COUNT tables)"
echo ""