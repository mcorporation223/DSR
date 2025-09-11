import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

export default defineConfig({
  // Database configuration
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",

  // Database connection
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  // Migration configuration
  migrations: {
    table: "drizzle_migrations",
    schema: "public",
  },

  // Development settings
  verbose: true,
  strict: true,

  // Optional: Introspection settings for existing databases
  introspect: {
    casing: "camel",
  },
});
