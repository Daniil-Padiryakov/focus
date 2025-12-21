#!/bin/bash
# ================================
# PostgreSQL Backup Script
# ================================
set -e
set -o pipefail

# ================================
# Parse arguments & Load environment
# ================================
ENV="${1:-development}"
ENV_FILE=".env.${ENV}"

if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
    echo "[INFO] Loaded environment: $ENV"
else
    echo "[ERROR] Environment file not found: $ENV_FILE"
    exit 1
fi

# ================================
# Configuration
# ================================
BACKUP_DIR="${BACKUP_DIR:-./backups/${ENV}}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ================================
# Functions
# ================================
log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ================================
# Pre-flight checks
# ================================
log_info "Starting database backup for environment: $ENV"

if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running"
    exit 1
fi

if ! docker compose ps postgres | grep -q "Up"; then
    log_error "PostgreSQL container is not running"
    exit 1
fi

mkdir -p "$BACKUP_DIR"

# ================================
# Get database credentials from container
# ================================
DB_USER=$(docker compose exec -T postgres printenv POSTGRES_USER | tr -d '\r\n')
DB_NAME=$(docker compose exec -T postgres printenv POSTGRES_DB | tr -d '\r\n')

if [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
    log_error "Could not get database credentials from container"
    exit 1
fi

log_info "Database: $DB_NAME (user: $DB_USER)"

# ================================
# Execute backup
# ================================
log_info "Creating backup: $BACKUP_FILE_GZ"

docker compose exec -T postgres pg_dump \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-acl \
    > "$BACKUP_FILE" || {
    log_error "pg_dump failed"
    [ -f "$BACKUP_FILE" ] && cat "$BACKUP_FILE"
    rm -f "$BACKUP_FILE"
    exit 1
}

# ================================
# Compress backup
# ================================
log_info "Compressing backup..."
gzip -9 "$BACKUP_FILE" || {
    log_error "Compression failed"
    exit 1
}

# ================================
# Verify backup
# ================================
log_info "Verifying backup integrity..."

if [ ! -f "$BACKUP_FILE_GZ" ]; then
    log_error "Backup file not found after compression"
    exit 1
fi

if ! gzip -t "$BACKUP_FILE_GZ"; then
    log_error "Backup file is corrupted"
    exit 1
fi

BACKUP_SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
BACKUP_SIZE_BYTES=$(wc -c < "$BACKUP_FILE_GZ")

if [ "$BACKUP_SIZE_BYTES" -lt 1000 ]; then
    log_warn "Backup file is suspiciously small ($BACKUP_SIZE)"
fi

# ================================
# Cleanup old backups
# ================================
log_info "Cleaning up old backups (keeping last $RETENTION_DAYS days)..."

DELETED_COUNT=0
while IFS= read -r old_backup; do
    rm -f "$old_backup"
    ((DELETED_COUNT++))
done < <(find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS)

if [ $DELETED_COUNT -gt 0 ]; then
    log_info "Deleted $DELETED_COUNT old backup(s)"
fi

# ================================
# Report
# ================================
echo ""
echo "========================================"
log_info "Backup completed successfully!"
echo "========================================"
echo ""
echo "📦 Backup file: $BACKUP_FILE_GZ"
echo "📊 Size: $BACKUP_SIZE"
echo "🗄️  Database: $DB_NAME"
echo "Environment: $ENV"
echo "📅 Date: $(date)"
echo ""

BACKUP_COUNT=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" | wc -l)
echo "📚 Total backups: $BACKUP_COUNT"
echo ""
echo "Recent backups:"
ls -lht "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | head -5 || echo "No backups yet"

echo ""
log_info "Restore with: ./docker/postgres/restore.sh $BACKUP_FILE_GZ"