# DSR Performance Testing - Task Tracker

> Simple checklist for load testing and optimization

---

## 1. Setup & Preparation

**Goal**: Set up infrastructure for performance testing

- [x] Create branch `test/load-testing` from main
- [x] Install faker library: `pnpm add -D @faker-js/faker`
- [x] Create `lib/db/seed-large.ts` file
- [x] Create `lib/db/generators/` folder for data generation utilities
- [x] Write employee generator function
- [x] Write detainee generator function
- [x] Write incident + victims generator function
- [x] Write seizure generator function
- [x] Write statement generator function
- [x] Write report generator function
- [x] Write audit log generator function
- [x] Add CLI support for configurable counts (e.g., `--employees=1000`) <!-- pnpm tsx lib/db/seed-large.ts --users=100 --employees=1000 --detainees=50000 --incidents=10000 --seizures=25000 --statements=15000 --reports=10000 --auditLogs=100000 -->

**Status**: ✅ Complete

---

## 2. Generate Test Data

**Goal**: Seed large datasets to test system performance

### Data Generation (run in order)

- [x] Seed 50 users with various roles (completed with defaults)
- [x] Seed 500 employees (completed with defaults)
- [x] Seed 5,000 detainees (completed with defaults)
- [x] Seed 1,000 incidents (with 1-3 victims each = ~2,000 victims) (completed with defaults)
- [x] Seed 2,000 seizures (completed with defaults)
- [x] Seed 1,500 statements (completed with defaults)
- [x] Seed 500 reports (completed with defaults)
- [x] Seed 10,000 audit logs (completed with defaults)

### Validation

- [ ] Verify all records inserted successfully
- [ ] Check foreign key relationships are valid
- [ ] Confirm unique constraints (emails, employeeIds) working
- [ ] Document total seeding time

**Status**: ⏳ Not Started

---

## 3. Benchmark & Measure

**Goal**: Identify performance bottlenecks

### Create Benchmarking Tools

- [ ] Create `lib/db/benchmark.ts` file
- [ ] Add function to measure query execution time
- [ ] Add function to count queries (detect N+1)
- [ ] Add function to measure memory usage

### Run Performance Tests

- [ ] Test detainees pagination (10, 50, 100 items per page)
- [ ] Test detainees search with various keywords
- [ ] Test detainees filter by status
- [ ] Test employees pagination and search
- [ ] Test incidents listing with victim counts
- [ ] Test seizures pagination and filtering
- [ ] Test dashboard stats query (slowest expected)
- [ ] Test audit logs with filters
- [ ] Simulate 10 concurrent users
- [ ] Simulate 50 concurrent users

### Document Results

- [ ] Create `docs/benchmark-results.md`
- [ ] Record query times for each operation
- [ ] Identify N+1 query problems
- [ ] List slowest queries (top 10)
- [ ] Note any timeout or memory issues

**Status**: ⏳ Not Started

---

## 4. Optimize & Merge

**Goal**: Fix performance issues and merge to main

### Database Optimization

- [ ] Add index on `employees.first_name`
- [ ] Add index on `employees.last_name`
- [ ] Add index on `employees.is_active`
- [ ] Add index on `detainees.first_name`
- [ ] Add index on `detainees.last_name`
- [ ] Add index on `detainees.status`
- [ ] Add index on `detainees.arrest_date`
- [ ] Add index on `seizures.type`
- [ ] Add index on `seizures.status`
- [ ] Add index on `seizures.seizure_date`
- [ ] Add index on `audit_logs.user_id`
- [ ] Add index on `audit_logs.entity_type`
- [ ] Add index on `audit_logs.timestamp`
- [ ] Generate and apply migration

### Query Optimization

- [ ] Fix identified N+1 queries
- [ ] Optimize dashboard stats query
- [ ] Add query timeouts if needed
- [ ] Test connection pool settings

### Validation

- [ ] Re-run all benchmarks from step 3
- [ ] Compare before/after performance
- [ ] Document improvement percentages
- [ ] Update `docs/benchmark-results.md` with final results

### Merge to Main

- [ ] Cherry-pick database index migration to main
- [ ] Cherry-pick query optimization fixes to main
- [ ] Create PR with performance improvements
- [ ] Document changes in PR description

**Status**: ⏳ Not Started

---

## Progress Summary

| Task                   | Status         | Notes |
| ---------------------- | -------------- | ----- |
| 1. Setup & Preparation | ⏳ Not Started |       |
| 2. Generate Test Data  | ⏳ Not Started |       |
| 3. Benchmark & Measure | ⏳ Not Started |       |
| 4. Optimize & Merge    | ⏳ Not Started |       |

**Overall Progress**: 0% (0/4 tasks complete)

---

## Quick Commands

```bash
# Setup
git checkout -b perf/load-testing
pnpm add -D @faker-js/faker

# Seed large dataset
pnpm tsx lib/db/seed-large.ts

# Run benchmarks
pnpm tsx lib/db/benchmark.ts

# Generate migration for indexes
pnpm drizzle-kit generate

# Apply migration
pnpm drizzle-kit migrate
```

---

## Notes

- Use separate test database (never run against production)
- Seeding 231,000+ records will take 20-40 minutes
- Keep `perf/load-testing` branch separate, cherry-pick proven fixes to main
- Don't commit large seed data files or test results to git
