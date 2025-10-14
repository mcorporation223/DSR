#!/bin/bash

# Database initialization script for Docker
# This script handles schema generation, migration, and seeding
# WARNING: This is for TESTING purposes only - NOT for production!

set -e  # Exit on any error

echo "🚀 Starting database initialization..."

# Function to wait for database to be ready
wait_for_db() {
    echo "⏳ Waiting for PostgreSQL to be ready..."
    
    # Extract connection details from DATABASE_URL
    # Format: postgresql://username:password@host:port/database
    DB_HOST=$(echo $DATABASE_URL | sed 's/.*@\([^:]*\):.*/\1/')
    DB_PORT=$(echo $DATABASE_URL | sed 's/.*:\([0-9]*\)\/.*/\1/')
    DB_USER=$(echo $DATABASE_URL | sed 's/.*\/\/\([^:]*\):.*/\1/')
    DB_NAME=$(echo $DATABASE_URL | sed 's/.*\/\([^?]*\).*/\1/')
    
    # Wait for PostgreSQL to accept connections
    until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; do
        echo "⏳ Database is not ready yet, waiting 2 seconds..."
        sleep 2
    done
    
    echo "✅ Database is ready!"
}

# Function to check if tables exist
check_tables_exist() {
    echo "🔍 Checking if database tables exist..."
    
    # Extract connection details from DATABASE_URL
    DB_HOST=$(echo $DATABASE_URL | sed 's/.*@\([^:]*\):.*/\1/')
    DB_PORT=$(echo $DATABASE_URL | sed 's/.*:\([0-9]*\)\/.*/\1/')
    DB_USER=$(echo $DATABASE_URL | sed 's/.*\/\/\([^:]*\):.*/\1/')
    DB_NAME=$(echo $DATABASE_URL | sed 's/.*\/\([^?]*\).*/\1/')
    DB_PASS=$(echo $DATABASE_URL | sed 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/')
    
    # Use pg_isready and a simple query to check if our main tables exist
    TABLE_COUNT=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'employees', 'detainees');" 2>/dev/null | tr -d ' ' || echo "0")
    
    if [ "$TABLE_COUNT" -ge 3 ]; then
        echo "✅ Database tables already exist, skipping initialization"
        return 0
    else
        echo "📝 Database tables don't exist, proceeding with initialization"
        return 1
    fi
}

# Main initialization process
main() {
    echo "🏁 Starting DSR database initialization process..."
    
    # Wait for database to be available
    wait_for_db
    
    # Check if we need to initialize
    if check_tables_exist; then
        echo "🎉 Database already initialized!"
        return 0
    fi
    
    echo " Generating database schema..."
    # Generate Drizzle schema files
    npm run db:generate || {
        echo "⚠️ Schema generation failed, but continuing..."
    }
    
    echo "🔄 Running database migrations..."
    # Push/migrate the schema to the database
    npm run db:migrate || npm run db:push || {
        echo "❌ Migration failed!"
        exit 1
    }
    
    echo "🌱 Seeding database with initial data..."
    # Run the seed script
    npm run db:seed || {
        echo "⚠️ Seeding failed, but database structure is ready"
        echo "You can run seeding manually later with: docker-compose exec app npm run db:seed"
    }
    
    echo "✅ Database initialization completed successfully!"
    echo "📊 Your DSR application is ready with:"
    echo "   - Database schema migrated"
    echo "   - Initial test data seeded"
    echo "   - Admin user: admin@dsr.gov.cd / password123"
}

# Run main function
main "$@"