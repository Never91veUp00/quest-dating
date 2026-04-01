#!/bin/bash
BACKUP_DIR="/home/questdating/backups"
DATE=$(date +%Y-%m-%d_%H-%M)
mkdir -p $BACKUP_DIR

docker exec quest-dating-db pg_dump -U quest_user quest_dating --encoding=UTF8 | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Оставляем только последние 7 бэкапов
ls -t $BACKUP_DIR/db_*.sql.gz | tail -n +8 | xargs rm -f 2>/dev/null

echo "Backup done: db_$DATE.sql.gz"
