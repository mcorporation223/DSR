# Docker Database Setup (Testing Only)

⚠️ **WARNING: This setup is for DEVELOPMENT and TESTING purposes only. Do NOT use in production!**

## Overview

This Docker setup includes automated database initialization that:

- Generates and migrates database schemas using Drizzle
- Seeds the database with test data
- Provides a complete testing environment

## Quick Start

1. **Start the application:**

   ```bash
   docker-compose up --build
   ```

2. **Access the application:**

   - App: http://localhost:3000
   - Database: localhost:5432

3. **Test login credentials:**
   - Email: `admin@dsr.gov.cd`
   - Password: `password123`

## What Happens During Startup

1. PostgreSQL database starts and becomes healthy
2. Application container builds with database tools
3. Database initialization script runs:
   - Waits for database to be ready
   - Checks if tables already exist
   - Generates Drizzle schema files
   - Runs database migrations
   - Seeds database with test data
4. Next.js application starts

## Manual Database Operations

If you need to run database operations manually:

```bash
# Generate schema
docker-compose exec app npm run db:generate

# Run migrations
docker-compose exec app npm run db:migrate

# Seed database
docker-compose exec app npm run db:seed

# Open Drizzle Studio
docker-compose exec app npm run db:studio

# Access database directly
docker-compose exec db psql -U postgres -d dsr
```

## Resetting the Database

To completely reset and re-seed the database:

```bash
# Stop containers
docker-compose down

# Remove database volume
docker volume rm dsr_postgres_data

# Restart (will reinitialize everything)
docker-compose up --build
```

## Environment Variables

The following variables control database initialization:

- `INIT_DATABASE=true` - Enable automatic database initialization
- `SEED_DATABASE=true` - Enable automatic seeding
- `DATABASE_URL` - PostgreSQL connection string

## Test Data Included

The seed script creates:

- 3 Admin users
- 3 Police employees
- 3 Detainees with different statuses
- 2 Security incidents
- 3 Victims
- 3 Seized items (vehicles/objects)
- 2 Reports
- 3 Statement files
- 4 Audit log entries

## Troubleshooting

**Database connection issues:**

```bash
# Check database status
docker-compose exec db pg_isready -U postgres -d dsr

# View app logs
docker-compose logs app

# View database logs
docker-compose logs db
```

**Migration failures:**

```bash
# Reset and try again
docker-compose down
docker volume rm dsr_postgres_data
docker-compose up --build
```

**Seeding failures:**

```bash
# Run seeding manually
docker-compose exec app npm run db:seed
```

## Production Considerations

**Before deploying to production:**

1. Remove the database initialization from Dockerfile:

   - Remove database-related COPY commands
   - Remove PostgreSQL client installation
   - Remove init-db.sh from CMD
   - Revert to simple `CMD ["node", "server.js"]`

2. Update docker-compose.yml:

   - Remove `INIT_DATABASE` and `SEED_DATABASE` variables
   - Set up proper secrets management
   - Configure production database connection

3. Run migrations separately:
   ```bash
   # In production environment
   npm run db:generate
   npm run db:migrate
   # DO NOT run db:seed in production
   ```

## Files Added for Testing

- `docker/init-db.sh` - Main database initialization script
- `docker/wait-for-db.sh` - Database readiness checker
- Modified `Dockerfile` - Includes database tools and scripts
- Modified `docker-compose.yml` - Adds initialization environment variables

Remember to remove these modifications before production deployment!
