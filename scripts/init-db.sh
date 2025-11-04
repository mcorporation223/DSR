#!/bin/sh
# init-db.sh - Initialize database with migrations and seed data

set -e

echo "🚀 Starting database initialization..."

# Check if SKIP_DB_INIT is set
if [ "$SKIP_DB_INIT" = "true" ]; then
  echo "⏭️  Skipping database initialization (SKIP_DB_INIT=true)"
  exit 0
fi

# Wait a bit for database to be fully ready
sleep 2

echo "📊 Database connection: $DATABASE_URL"

# Drop all tables (clean slate)
echo "🗑️  Dropping existing database schema..."
pnpm drizzle-kit drop --force || echo "⚠️  No existing schema to drop"

# Run migrations
echo "⬆️  Running database migrations..."
pnpm drizzle-kit push

# Seed admin user
echo "👤 Seeding admin user..."
pnpm db:seed-admin

# Check if we should seed large data
if [ "$SEED_LARGE_DATA" = "true" ]; then
  echo "📦 Seeding large dataset for load testing..."

  # Parse custom seed parameters if provided
  SEED_PARAMS=""
  [ -n "$SEED_USERS" ] && SEED_PARAMS="$SEED_PARAMS --users=$SEED_USERS"
  [ -n "$SEED_EMPLOYEES" ] && SEED_PARAMS="$SEED_PARAMS --employees=$SEED_EMPLOYEES"
  [ -n "$SEED_DETAINEES" ] && SEED_PARAMS="$SEED_PARAMS --detainees=$SEED_DETAINEES"
  [ -n "$SEED_INCIDENTS" ] && SEED_PARAMS="$SEED_PARAMS --incidents=$SEED_INCIDENTS"
  [ -n "$SEED_SEIZURES" ] && SEED_PARAMS="$SEED_PARAMS --seizures=$SEED_SEIZURES"
  [ -n "$SEED_STATEMENTS" ] && SEED_PARAMS="$SEED_PARAMS --statements=$SEED_STATEMENTS"
  [ -n "$SEED_REPORTS" ] && SEED_PARAMS="$SEED_PARAMS --reports=$SEED_REPORTS"
  [ -n "$SEED_AUDIT_LOGS" ] && SEED_PARAMS="$SEED_PARAMS --auditLogs=$SEED_AUDIT_LOGS"

  pnpm db:seed-large $SEED_PARAMS
else
  echo "📦 Seeding default test data..."
  pnpm db:seed
fi

echo "✅ Database initialization completed successfully!"
