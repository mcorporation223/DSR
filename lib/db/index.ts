import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: parseInt(process.env.DB_POOL_MAX || "10"),
  min: parseInt(process.env.DB_POOL_MIN || "2"),
  idleTimeoutMillis: 30000,
});

// Create Drizzle instance
export const db = drizzle(pool, { schema });

// Export types
export type Database = typeof db;
export * from "./schema";
