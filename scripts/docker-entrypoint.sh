#!/bin/sh
# docker-entrypoint.sh - Docker container entrypoint script

set -e

echo "🐳 Docker entrypoint started"

# Run database initialization if enabled
if [ "$AUTO_INIT_DB" = "true" ]; then
  echo "🔧 Running database initialization..."
  /app/scripts/init-db.sh
else
  echo "⏭️  Auto database initialization disabled (set AUTO_INIT_DB=true to enable)"
fi

echo "🚀 Starting Next.js application..."

# Execute the main command (start the app)
exec "$@"
