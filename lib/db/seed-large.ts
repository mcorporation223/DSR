import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { faker } from "@faker-js/faker";
import * as bcrypt from "bcrypt";
import {
  users,
  employees,
  detainees,
  incidents,
  victims,
  seizures,
  reports,
  statements,
  auditLogs,
} from "./schema";
import {
  LOCATIONS,
  NEIGHBORHOODS,
  // PROVINCES,
  RELIGIONS,
  MARITAL_STATUS,
  EDUCATION_LEVELS,
  POLICE_FUNCTIONS,
  CRIME_REASONS,
  SEIZURE_TYPES,
  SEIZURE_ITEMS,
  INCIDENT_TYPES,
  CAUSES_OF_DEATH,
  getRandomElement,
  // getRandomDate,
} from "./generators/constants";

// Load environment variables
config({ path: ".env.local" });

// Create database connection for seeding
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const db = drizzle(pool);

// Configuration - adjust these numbers as needed
// Optimized for faster seeding (~2-5 minutes) while still testing performance
const SEED_CONFIG = {
  users: 50,
  employees: 500,
  detainees: 5000, // Reduced from 50k - still enough to test pagination/search
  incidents: 1000, // Reduced from 10k
  victimsPer: { min: 1, max: 3 }, // victims per incident
  seizures: 2000, // Reduced from 25k
  statements: 1500, // Reduced from 15k
  reports: 500, // Reduced from 10k
  auditLogs: 10000, // Reduced from 100k - still plenty for testing
};

// Generator functions
async function generateUsers(count: number) {
  console.log(`👥 Generating ${count} users...`);
  const passwordHash = await bcrypt.hash("password123", 12);

  const usersData = [];
  for (let i = 0; i < count; i++) {
    usersData.push({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email().toLowerCase(),
      passwordHash,
      role: faker.helpers.weightedArrayElement([
        { weight: 20, value: "admin" },
        { weight: 80, value: "user" },
      ]),
      isActive: faker.datatype.boolean(0.95), // 95% active
      isPasswordSet: true,
      mustChangePassword: faker.datatype.boolean(0.1), // 10% must change
    });
  }

  return await db.insert(users).values(usersData).returning();
}

async function generateEmployees(count: number, userIds: string[]) {
  console.log(`👮 Generating ${count} employees...`);

  const employeesData = [];
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    employeesData.push({
      firstName,
      lastName,
      sex: getRandomElement(["Male", "Female"]),
      placeOfBirth: `${getRandomElement(LOCATIONS)}, ${getRandomElement([
        "Nord-Kivu",
        "Sud-Kivu",
        "Kinshasa",
        "Katanga",
      ])}`,
      dateOfBirth: faker.date.between({ from: "1960-01-01", to: "2000-01-01" }),
      education: getRandomElement(EDUCATION_LEVELS),
      maritalStatus: getRandomElement(MARITAL_STATUS),
      employeeId: `EMP${String(i + 1).padStart(6, "0")}`,
      function: getRandomElement(POLICE_FUNCTIONS),
      deploymentLocation: getRandomElement(LOCATIONS),
      residence: `${getRandomElement(NEIGHBORHOODS)}, ${getRandomElement(
        LOCATIONS
      )}`,
      phone: `+243 ${faker.string.numeric(3)} ${faker.string.numeric(
        3
      )} ${faker.string.numeric(3)}`,
      email:
        `${firstName.toLowerCase()}.${lastName.toLowerCase()}@police.gov.cd`.replace(
          /[^a-z@.]/g,
          ""
        ),
      isActive: faker.datatype.boolean(0.9), // 90% active
      createdBy: getRandomElement(userIds),
      updatedBy: getRandomElement(userIds),
    });
  }

  // Insert in batches to avoid memory issues
  const batchSize = 1000;
  const results = [];
  for (let i = 0; i < employeesData.length; i += batchSize) {
    const batch = employeesData.slice(i, i + batchSize);
    const batchResult = await db.insert(employees).values(batch).returning();
    results.push(...batchResult);
    console.log(
      `   Inserted employees batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        employeesData.length / batchSize
      )}`
    );
  }

  return results;
}

async function generateDetainees(count: number, userIds: string[]) {
  console.log(`🔒 Generating ${count} detainees...`);

  const detaineesData = [];
  const statuses = ["in_custody", "released", "transferred"];

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const arrestDate = faker.date.between({
      from: "2020-01-01",
      to: new Date(),
    });
    const status = getRandomElement(statuses);

    detaineesData.push({
      firstName,
      lastName,
      sex: getRandomElement(["Male", "Female"]),
      placeOfBirth: `${getRandomElement(LOCATIONS)}, ${getRandomElement([
        "Nord-Kivu",
        "Sud-Kivu",
        "Kinshasa",
        "Katanga",
      ])}`,
      dateOfBirth: faker.date.between({ from: "1950-01-01", to: "2005-01-01" }),
      parentNames: `Père: ${faker.person.fullName()}, Mère: ${faker.person.fullName()}`,
      originNeighborhood: getRandomElement(NEIGHBORHOODS),
      education: getRandomElement(EDUCATION_LEVELS),
      employment: faker.person.jobTitle(),
      maritalStatus: getRandomElement(MARITAL_STATUS),
      religion: getRandomElement(RELIGIONS),
      residence: `${getRandomElement(NEIGHBORHOODS)}, ${getRandomElement(
        LOCATIONS
      )}`,
      phoneNumber: `+243 ${faker.string.numeric(3)} ${faker.string.numeric(
        3
      )} ${faker.string.numeric(3)}`,
      crimeReason: getRandomElement(CRIME_REASONS),
      arrestDate,
      arrestLocation: getRandomElement(NEIGHBORHOODS),
      arrestedBy: `${getRandomElement(
        POLICE_FUNCTIONS
      )} ${faker.person.fullName()}`,
      arrestTime: arrestDate,
      arrivalDate: arrestDate,
      arrivalTime: new Date(arrestDate.getTime() + Math.random() * 3600000), // Within 1 hour
      cellNumber: `C-${String(Math.floor(Math.random() * 50) + 1).padStart(
        3,
        "0"
      )}`,
      location: getRandomElement(["Bloc A", "Bloc B", "Bloc C"]),
      status,
      releaseDate:
        status === "released"
          ? faker.date.between({ from: arrestDate, to: new Date() })
          : null,
      releaseReason: status === "released" ? "Caution payée" : null,
      createdBy: getRandomElement(userIds),
      updatedBy: getRandomElement(userIds),
    });
  }

  // Insert in batches
  const batchSize = 1000;
  const results = [];
  for (let i = 0; i < detaineesData.length; i += batchSize) {
    const batch = detaineesData.slice(i, i + batchSize);
    const batchResult = await db.insert(detainees).values(batch).returning();
    results.push(...batchResult);
    console.log(
      `   Inserted detainees batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        detaineesData.length / batchSize
      )}`
    );
  }

  return results;
}

async function generateIncidentsAndVictims(
  incidentCount: number,
  userIds: string[]
) {
  console.log(`⚠️ Generating ${incidentCount} incidents with victims...`);

  const incidentsData = [];
  for (let i = 0; i < incidentCount; i++) {
    const numberOfVictims = faker.number.int({
      min: SEED_CONFIG.victimsPer.min,
      max: SEED_CONFIG.victimsPer.max,
    });

    incidentsData.push({
      incidentDate: faker.date.between({ from: "2020-01-01", to: new Date() }),
      location: `${getRandomElement(NEIGHBORHOODS)}, ${getRandomElement(
        LOCATIONS
      )}`,
      eventType: getRandomElement(INCIDENT_TYPES),
      numberOfVictims,
      createdBy: getRandomElement(userIds),
      updatedBy: getRandomElement(userIds),
    });
  }

  // Insert incidents in batches
  const batchSize = 1000;
  const allIncidents = [];
  for (let i = 0; i < incidentsData.length; i += batchSize) {
    const batch = incidentsData.slice(i, i + batchSize);
    const batchResult = await db.insert(incidents).values(batch).returning();
    allIncidents.push(...batchResult);
    console.log(
      `   Inserted incidents batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        incidentsData.length / batchSize
      )}`
    );
  }

  // Generate victims for each incident
  console.log(`💔 Generating victims for incidents...`);
  const victimsData = [];
  for (const incident of allIncidents) {
    const victimCount = incident.numberOfVictims || 1; // Default to 1 if null
    for (let j = 0; j < victimCount; j++) {
      victimsData.push({
        incidentId: incident.id,
        name: faker.person.fullName(),
        sex: getRandomElement(["Male", "Female"]),
        causeOfDeath: getRandomElement(CAUSES_OF_DEATH),
        createdBy: getRandomElement(userIds),
        updatedBy: getRandomElement(userIds),
      });
    }
  }

  // Insert victims in batches
  for (let i = 0; i < victimsData.length; i += batchSize) {
    const batch = victimsData.slice(i, i + batchSize);
    await db.insert(victims).values(batch);
    console.log(
      `   Inserted victims batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        victimsData.length / batchSize
      )}`
    );
  }

  console.log(`   Total victims created: ${victimsData.length}`);
  return allIncidents;
}

async function generateSeizures(count: number, userIds: string[]) {
  console.log(`🚗 Generating ${count} seizures...`);

  const seizuresData = [];
  const statuses = ["in_custody", "released", "disposed", "evidence"];

  for (let i = 0; i < count; i++) {
    const type = getRandomElement(SEIZURE_TYPES);
    const itemName = getRandomElement(
      SEIZURE_ITEMS[type as keyof typeof SEIZURE_ITEMS]
    );
    const seizureDate = faker.date.between({
      from: "2020-01-01",
      to: new Date(),
    });
    const status = getRandomElement(statuses);

    seizuresData.push({
      itemName,
      type,
      seizureLocation: getRandomElement(NEIGHBORHOODS),
      chassisNumber:
        type === "cars" || type === "motorcycles" ? faker.vehicle.vin() : null,
      plateNumber:
        type === "cars" || type === "motorcycles"
          ? `CD-${faker.string.numeric(3)}-NK`
          : null,
      ownerName: faker.person.fullName(),
      ownerResidence: `${getRandomElement(NEIGHBORHOODS)}, ${getRandomElement(
        LOCATIONS
      )}`,
      seizureDate,
      status,
      releaseDate:
        status === "released"
          ? faker.date.between({ from: seizureDate, to: new Date() })
          : null,
      createdBy: getRandomElement(userIds),
      updatedBy: getRandomElement(userIds),
    });
  }

  // Insert in batches
  const batchSize = 1000;
  for (let i = 0; i < seizuresData.length; i += batchSize) {
    const batch = seizuresData.slice(i, i + batchSize);
    await db.insert(seizures).values(batch);
    console.log(
      `   Inserted seizures batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        seizuresData.length / batchSize
      )}`
    );
  }
}

async function generateStatements(
  count: number,
  detaineeIds: string[],
  userIds: string[]
) {
  console.log(`📋 Generating ${count} statements...`);

  const statementsData = [];
  for (let i = 0; i < count; i++) {
    statementsData.push({
      fileUrl: `/uploads/statements/statement_${faker.string.uuid()}.pdf`,
      detaineeId: getRandomElement(detaineeIds),
      createdBy: getRandomElement(userIds),
      updatedBy: getRandomElement(userIds),
    });
  }

  // Insert in batches
  const batchSize = 1000;
  for (let i = 0; i < statementsData.length; i += batchSize) {
    const batch = statementsData.slice(i, i + batchSize);
    await db.insert(statements).values(batch);
    console.log(
      `   Inserted statements batch ${
        Math.floor(i / batchSize) + 1
      }/${Math.ceil(statementsData.length / batchSize)}`
    );
  }
}

async function generateReports(count: number, userIds: string[]) {
  console.log(`📄 Generating ${count} reports...`);

  const reportsData = [];
  const reportTypes = [
    "Rapport Quotidien de Sécurité",
    "Rapport Hebdomadaire",
    "Rapport Mensuel",
    "Rapport d'Incident",
    "Rapport d'Enquête",
    "Rapport de Patrol",
  ];

  for (let i = 0; i < count; i++) {
    const reportType = getRandomElement(reportTypes);
    const reportDate = faker.date.between({
      from: "2020-01-01",
      to: new Date(),
    });

    reportsData.push({
      title: `${reportType} - ${reportDate.toLocaleDateString("fr-FR")}`,
      content: faker.lorem.paragraphs(5, "\n\n"),
      location: getRandomElement(LOCATIONS),
      reportDate,
      createdBy: getRandomElement(userIds),
      updatedBy: getRandomElement(userIds),
    });
  }

  // Insert in batches
  const batchSize = 1000;
  for (let i = 0; i < reportsData.length; i += batchSize) {
    const batch = reportsData.slice(i, i + batchSize);
    await db.insert(reports).values(batch);
    console.log(
      `   Inserted reports batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        reportsData.length / batchSize
      )}`
    );
  }
}

async function generateAuditLogs(count: number, userIds: string[]) {
  console.log(`📝 Generating ${count} audit logs...`);

  const auditLogsData = [];
  const actions = ["create", "update", "delete", "status_change"];
  const entityTypes = [
    "employee",
    "detainee",
    "report",
    "statement",
    "incident",
    "seizure",
  ];

  for (let i = 0; i < count; i++) {
    const action = getRandomElement(actions);
    const entityType = getRandomElement(entityTypes);

    auditLogsData.push({
      userId: getRandomElement(userIds),
      action,
      entityType,
      entityId: faker.string.uuid(),
      createdAt: faker.date.between({ from: "2020-01-01", to: new Date() }),
      details: {
        description: `${action} ${entityType}`,
        entityName: faker.person.fullName(),
        ...(action === "update" && {
          changed: {
            status: { old: "in_custody", new: "released" },
          },
        }),
      },
    });
  }

  // Insert in batches
  const batchSize = 2000;
  for (let i = 0; i < auditLogsData.length; i += batchSize) {
    const batch = auditLogsData.slice(i, i + batchSize);
    await db.insert(auditLogs).values(batch);
    console.log(
      `   Inserted audit logs batch ${
        Math.floor(i / batchSize) + 1
      }/${Math.ceil(auditLogsData.length / batchSize)}`
    );
  }
}

async function seedLarge() {
  console.log("🌱 Starting large database seed for performance testing...");
  console.log(`📊 Target numbers: ${JSON.stringify(SEED_CONFIG, null, 2)}`);

  const startTime = Date.now();

  try {
    // Generate all data
    const createdUsers = await generateUsers(SEED_CONFIG.users);
    const userIds = createdUsers.map((u) => u.id);

    await generateEmployees(SEED_CONFIG.employees, userIds);

    const createdDetainees = await generateDetainees(
      SEED_CONFIG.detainees,
      userIds
    );
    const detaineeIds = createdDetainees.map((d) => d.id);

    await generateIncidentsAndVictims(SEED_CONFIG.incidents, userIds);

    await generateSeizures(SEED_CONFIG.seizures, userIds);

    await generateStatements(SEED_CONFIG.statements, detaineeIds, userIds);

    await generateReports(SEED_CONFIG.reports, userIds);

    await generateAuditLogs(SEED_CONFIG.auditLogs, userIds);

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log("\n✅ Large database seed completed successfully!");
    console.log(
      `⏱️  Total seeding time: ${Math.floor(duration / 60)}m ${Math.floor(
        duration % 60
      )}s`
    );
    console.log("\n📈 Final data summary:");
    console.log(`- ${SEED_CONFIG.users.toLocaleString()} Users`);
    console.log(`- ${SEED_CONFIG.employees.toLocaleString()} Employees`);
    console.log(`- ${SEED_CONFIG.detainees.toLocaleString()} Detainees`);
    console.log(`- ${SEED_CONFIG.incidents.toLocaleString()} Incidents`);
    console.log(
      `- ~${(
        SEED_CONFIG.incidents * 2
      ).toLocaleString()} Victims (avg 2 per incident)`
    );
    console.log(`- ${SEED_CONFIG.seizures.toLocaleString()} Seizures`);
    console.log(`- ${SEED_CONFIG.statements.toLocaleString()} Statements`);
    console.log(`- ${SEED_CONFIG.reports.toLocaleString()} Reports`);
    console.log(`- ${SEED_CONFIG.auditLogs.toLocaleString()} Audit Logs`);

    const totalRecords =
      SEED_CONFIG.users +
      SEED_CONFIG.employees +
      SEED_CONFIG.detainees +
      SEED_CONFIG.incidents +
      SEED_CONFIG.incidents * 2 +
      SEED_CONFIG.seizures +
      SEED_CONFIG.statements +
      SEED_CONFIG.reports +
      SEED_CONFIG.auditLogs;
    console.log(
      `\n📊 Total records: ~${Math.floor(totalRecords).toLocaleString()}`
    );
    console.log(
      `📈 Records per second: ${Math.floor(
        totalRecords / duration
      ).toLocaleString()}`
    );

    console.log("\n⚠️  Remember:");
    console.log("- This was run against your test database");
    console.log("- Use a separate test environment for performance testing");
    console.log("- Never run this against production data");
  } catch (error) {
    console.error("❌ Error seeding large database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// CLI support for configurable counts
if (process.argv.length > 2) {
  process.argv.slice(2).forEach((arg) => {
    const [key, value] = arg.replace("--", "").split("=");
    if (key in SEED_CONFIG && !isNaN(Number(value)) && key !== "victimsPer") {
      (SEED_CONFIG as unknown as Record<string, number>)[key] = Number(value);
      console.log(`🔧 Set ${key} = ${Number(value)}`);
    }
  });
}

// Run the seed function
seedLarge()
  .then(() => {
    console.log("🎉 Large seed completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Large seed failed:", error);
    process.exit(1);
  });
