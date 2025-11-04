import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "./schema";
import * as bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

// Load environment variables
config({ path: ".env.local" });

// Create database connection for seeding
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const db = drizzle(pool);

async function seedAdmin() {
  console.log("👑 Starting admin user seed...");

  try {
    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin@dsr.gov.cd"))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("⚠️ Admin user already exists with email: admin@dsr.gov.cd");
      console.log("🔐 Default login credentials:");
      console.log("Email: admin@dsr.gov.cd");
      console.log("Password: admin123");
      return;
    }

    // Hash the default password
    const passwordHash = await bcrypt.hash("admin123", 12);

    // Create default admin user
    const [adminUser] = await db
      .insert(users)
      .values({
        firstName: "System",
        lastName: "Administrator",
        email: "admin@dsr.gov.cd",
        passwordHash,
        role: "admin",
        isActive: true,
        isPasswordSet: true,
        mustChangePassword: false,
      })
      .returning();

    console.log("✅ Default admin user created successfully!");
    console.log("\n📋 Admin user details:");
    console.log(`- ID: ${adminUser.id}`);
    console.log(`- Name: ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`- Email: ${adminUser.email}`);
    console.log(`- Role: ${adminUser.role}`);
    console.log("\n🔐 Default login credentials:");
    console.log("Email: admin@dsr.gov.cd");
    console.log("Password: admin123");
    console.log(
      "\n⚠️ Important: Please change the default password after first login!"
    );
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seed admin function
seedAdmin()
  .then(() => {
    console.log("🎉 Admin seed completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Admin seed failed:", error);
    process.exit(1);
  });
