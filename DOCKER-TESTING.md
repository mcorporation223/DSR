# Docker Setup for Testing

Simple Docker configuration for testing the DSR application with large datasets.

## Quick Start

```bash
# Start everything (drops DB, seeds large data automatically)
docker compose up -d

# View logs
docker compose logs -f app

# Access app
http://localhost:3000
```

## What Happens Automatically

When you run `docker compose up`:

1. ✅ PostgreSQL starts
2. ✅ **Drops all existing tables** (clean slate)
3. ✅ Runs migrations
4. ✅ Seeds admin user
5. ✅ Seeds large dataset (5000 detainees, 500 employees, 1000 incidents, etc.)
6. ✅ Starts the app

## Configuration

Edit `docker-compose.yml` to change behavior:

```yaml
# Disable auto-initialization
AUTO_INIT_DB: "false"

# Use small test data instead of large dataset
SEED_LARGE_DATA: "false"

# Skip initialization on restart
SKIP_DB_INIT: "true"
```

## Custom Data Counts

Uncomment and modify in `docker-compose.yml`:

```yaml
SEED_DETAINEES: 10000
SEED_EMPLOYEES: 1000
# etc...
```

## Common Commands

```bash
# Stop and remove everything (including data)
docker compose down -v

# Rebuild after changes
docker compose up -d --build

# View only app logs
docker compose logs app

# Access database
docker compose exec db psql -U postgres -d dsr
```

## Testing Fresh Start

```bash
# Complete reset
docker compose down -v
docker compose up -d

# Check logs to see seeding progress
docker compose logs -f app
```
