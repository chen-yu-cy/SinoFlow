#!/usr/bin/env bash
# FILE: scripts/backup.sh
set -e

BACKUP_DIR="$(cd "$(dirname "$0")/.." && pwd)/backups"
mkdir -p "$BACKUP_DIR"

# Load database credentials from .env if present
if [ -f "$(cd "$(dirname "$0")/.." && pwd)/.env" ]; then
  set -a
  source "$(cd "$(dirname "$0")/.." && pwd)/.env"
  set +a
fi

DB_USER="${POSTGRES_USER:-devuser}"
DB_NAME="${POSTGRES_DB:-sinoflow_db}"

# Determine docker command
DOCKER_CMD="docker"
if ! docker info >/dev/null 2>&1; then
  DOCKER_CMD="sudo docker"
fi

# Mode 1: Restore from a backup file if `--restore <file>` is passed
if [ "$1" = "--restore" ]; then
  RESTORE_FILE="$2"
  if [ -z "$RESTORE_FILE" ] || [ ! -f "$RESTORE_FILE" ]; then
    echo "❌ 请指定有效的备份文件路径！用法: ./scripts/backup.sh --restore backups/xxx.sql.gz"
    exit 1
  fi
  echo "⚠️  正在从备份文件恢复数据库: $RESTORE_FILE ..."
  gunzip -c "$RESTORE_FILE" | $DOCKER_CMD compose exec -T db psql -U "$DB_USER" -d "$DB_NAME"
  echo "✅ 数据库恢复成功！"
  exit 0
fi

# Mode 2: Create a compressed timestamped backup and prune backups older than 7 days
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/sinoflow_db_${TIMESTAMP}.sql.gz"

echo "📦 [Backup] 正在导出并压缩 PostgreSQL 数据库 (${DB_NAME})..."
$DOCKER_CMD compose exec -T db pg_dump -U "$DB_USER" --clean --if-exists "$DB_NAME" | gzip > "$BACKUP_FILE"

# Remove backups older than 7 days
find "$BACKUP_DIR" -name "sinoflow_db_*.sql.gz" -type f -mtime +7 -delete

echo "✅ [Backup] 备份完成: ${BACKUP_FILE} ($(du -h "$BACKUP_FILE" | cut -f1))"
