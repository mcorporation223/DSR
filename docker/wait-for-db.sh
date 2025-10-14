#!/bin/bash

# Simple script to wait for database availability
# Usage: ./wait-for-db.sh [timeout_in_seconds]

TIMEOUT=${1:-30}
COUNTER=0

echo "⏳ Waiting for database to be ready (timeout: ${TIMEOUT}s)..."

# Extract database details from DATABASE_URL
DB_HOST=$(echo $DATABASE_URL | sed 's/.*@\([^:]*\):.*/\1/')
DB_PORT=$(echo $DATABASE_URL | sed 's/.*:\([0-9]*\)\/.*/\1/')
DB_USER=$(echo $DATABASE_URL | sed 's/.*\/\/\([^:]*\):.*/\1/')
DB_NAME=$(echo $DATABASE_URL | sed 's/.*\/\([^?]*\).*/\1/')

while ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; do
    COUNTER=$((COUNTER + 1))
    if [ $COUNTER -gt $TIMEOUT ]; then
        echo "❌ Database did not become ready within ${TIMEOUT} seconds"
        exit 1
    fi
    echo "⏳ Database not ready yet... (${COUNTER}/${TIMEOUT})"
    sleep 1
done

echo "✅ Database is ready!"