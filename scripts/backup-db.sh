#!/bin/bash

################################################################################
# Database Backup Script
# Quest Dating Platform
#
# Usage:
#   ./scripts/backup-db.sh [options]
#
# Options:
#   -e, --env      Environment (development, production) [default: development]
#   -o, --output   Output directory [default: ./backups]
#   -c, --compress Compress backup with gzip
#   -h, --help     Show this help message
#
# Examples:
#   ./scripts/backup-db.sh
#   ./scripts/backup-db.sh -e production -c
#   ./scripts/backup-db.sh --output /mnt/backups --compress
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="development"
OUTPUT_DIR="./backups"
COMPRESS=false
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -e|--env)
      ENVIRONMENT="$2"
      shift 2
      ;;
    -o|--output)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    -c|--compress)
      COMPRESS=true
      shift
      ;;
    -h|--help)
      grep '^#' "$0" | tail -n +3 | head -n -1 | cut -c 3-
      exit 0
      ;;
    *)
      echo -e "${RED}Error: Unknown option $1${NC}"
      exit 1
      ;;
  esac
done

# Function to print colored messages
print_message() {
  local color=$1
  local message=$2
  echo -e "${color}${message}${NC}"
}

print_message "$BLUE" "======================================"
print_message "$BLUE" "Quest Dating - Database Backup"
print_message "$BLUE" "======================================"
echo ""

# Load environment variables
ENV_FILE="server/.env"
if [ "$ENVIRONMENT" = "production" ]; then
  ENV_FILE="server/.env.production"
fi

if [ ! -f "$ENV_FILE" ]; then
  print_message "$RED" "Error: Environment file $ENV_FILE not found!"
  exit 1
fi

print_message "$GREEN" "Loading environment from: $ENV_FILE"

# Export variables from .env file
set -a
source "$ENV_FILE"
set +a

# Check if required variables are set
if [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ]; then
  print_message "$RED" "Error: Required database variables not set in $ENV_FILE"
  print_message "$YELLOW" "Required: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD"
  exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Generate backup filename
BACKUP_FILENAME="quest_dating_${ENVIRONMENT}_${TIMESTAMP}.sql"
BACKUP_PATH="$OUTPUT_DIR/$BACKUP_FILENAME"

print_message "$YELLOW" "Environment: $ENVIRONMENT"
print_message "$YELLOW" "Database: $DB_NAME"
print_message "$YELLOW" "Host: $DB_HOST"
print_message "$YELLOW" "Output: $BACKUP_PATH"
echo ""

# Perform backup
print_message "$BLUE" "Starting backup..."

# Set password for pg_dump
export PGPASSWORD="$DB_PASSWORD"

# Create backup with pg_dump
if pg_dump -h "$DB_HOST" \
           -p "${DB_PORT:-5432}" \
           -U "$DB_USER" \
           -d "$DB_NAME" \
           --format=plain \
           --no-owner \
           --no-acl \
           --verbose \
           --file="$BACKUP_PATH" 2>&1 | grep -v "^pg_dump:"; then
  
  # Get file size
  BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
  
  print_message "$GREEN" "✓ Backup created successfully!"
  print_message "$GREEN" "  File: $BACKUP_PATH"
  print_message "$GREEN" "  Size: $BACKUP_SIZE"
  
  # Compress if requested
  if [ "$COMPRESS" = true ]; then
    print_message "$BLUE" "Compressing backup..."
    
    if gzip -f "$BACKUP_PATH"; then
      COMPRESSED_PATH="${BACKUP_PATH}.gz"
      COMPRESSED_SIZE=$(du -h "$COMPRESSED_PATH" | cut -f1)
      
      print_message "$GREEN" "✓ Backup compressed successfully!"
      print_message "$GREEN" "  File: $COMPRESSED_PATH"
      print_message "$GREEN" "  Size: $COMPRESSED_SIZE"
    else
      print_message "$RED" "✗ Compression failed"
    fi
  fi
  
  echo ""
  print_message "$BLUE" "Backup completed at: $(date)"
  
  # Show backup files in directory
  echo ""
  print_message "$YELLOW" "Recent backups in $OUTPUT_DIR:"
  ls -lht "$OUTPUT_DIR" | head -n 6
  
  # Cleanup old backups (keep last 10)
  print_message "$BLUE" "Cleaning up old backups (keeping last 10)..."
  
  if [ "$COMPRESS" = true ]; then
    ls -t "$OUTPUT_DIR"/*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm -f
  else
    ls -t "$OUTPUT_DIR"/*.sql 2>/dev/null | tail -n +11 | xargs -r rm -f
  fi
  
  print_message "$GREEN" "✓ Cleanup completed"
  
else
  print_message "$RED" "✗ Backup failed!"
  exit 1
fi

# Unset password
unset PGPASSWORD

echo ""
print_message "$GREEN" "======================================"
print_message "$GREEN" "Backup process completed successfully!"
print_message "$GREEN" "======================================"

exit 0