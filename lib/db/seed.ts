import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
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
import * as bcrypt from "bcrypt";

// Load environment variables
config({ path: ".env.local" });

// Create database connection for seeding
// Note: This is only for the seed script, NOT for the main application
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const db = drizzle(pool);

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // 1. Seed Users (Admin accounts)
    console.log("👥 Seeding users...");
    const passwordHash = await bcrypt.hash("password123", 12);

    const [user1, user2, user3] = await db
      .insert(users)
      .values([
        {
          firstName: "Jean",
          lastName: "Mukamana",
          email: "admin2@dsr.gov.cd",
          passwordHash,
          role: "admin",
        },
        {
          firstName: "Marie",
          lastName: "Kabila",
          email: "marie.kabila@dsr.gov.cd",
          passwordHash,
          role: "user",
        },
        {
          firstName: "Patrick",
          lastName: "Lubumbashi",
          email: "patrick.lubumbashi@dsr.gov.cd",
          passwordHash,
          role: "admin",
        },
      ])
      .returning();

    // 2. Seed Employees
    console.log("👮 Seeding employees...");
    await db.insert(employees).values([
      {
        firstName: "Joseph",
        lastName: "Kasongo",
        sex: "Male",
        placeOfBirth: "Goma, Nord-Kivu",
        dateOfBirth: new Date("1985-03-15"),
        education: "Licence en Droit",
        maritalStatus: "Married",
        employeeId: "EMP001",
        function: "Commissaire Principal",
        deploymentLocation: "Goma Central",
        residence: "Quartier Himbi, Goma",
        phone: "+243 997 123 456",
        email: "joseph.kasongo@police.gov.cd",
        createdBy: user1.id,
        updatedBy: user1.id,
      },
      {
        firstName: "Grace",
        lastName: "Mbayo",
        sex: "Female",
        placeOfBirth: "Bukavu, Sud-Kivu",
        dateOfBirth: new Date("1990-08-22"),
        education: "Graduat en Criminologie",
        maritalStatus: "Single",
        employeeId: "EMP002",
        function: "Inspecteur",
        deploymentLocation: "Goma Nord",
        residence: "Quartier Majengo, Goma",
        phone: "+243 998 234 567",
        email: "grace.mbayo@police.gov.cd",
        createdBy: user1.id,
        updatedBy: user1.id,
      },
      {
        firstName: "Emmanuel",
        lastName: "Nzeyimana",
        sex: "Male",
        placeOfBirth: "Kinshasa",
        dateOfBirth: new Date("1988-12-10"),
        education: "Licence en Administration",
        maritalStatus: "Married",
        employeeId: "EMP003",
        function: "Commissaire Adjoint",
        deploymentLocation: "Goma Sud",
        residence: "Quartier Volcanologique, Goma",
        phone: "+243 999 345 678",
        email: "emmanuel.nzeyimana@police.gov.cd",
        createdBy: user2.id,
        updatedBy: user2.id,
      },
    ]);

    // 3. Seed Detainees
    console.log("🔒 Seeding detainees...");
    const createdDetainees = await db
      .insert(detainees)
      .values([
        {
          firstName: "Claude",
          lastName: "Muhindo",
          sex: "Male",
          placeOfBirth: "Butembo, Nord-Kivu",
          dateOfBirth: new Date("1995-06-18"),
          parentNames: "Père: Alphonse Muhindo, Mère: Christine Kavira",
          originNeighborhood: "Quartier Vulindi, Butembo",
          education: "Secondaire incomplet",
          employment: "Menuisier",
          maritalStatus: "Single",
          religion: "Catholique",
          residence: "Quartier Ndosho, Goma",
          phoneNumber: "+243 970 123 789",
          crimeReason: "Vol à main armée dans un magasin",
          arrestDate: new Date("2024-09-05"),
          arrestLocation: "Avenue de la Paix, Goma",
          arrestedBy: "Commissaire Kasongo et équipe",
          arrestTime: new Date("2024-09-05T14:30:00"),
          arrivalTime: new Date("2024-09-05T15:45:00"),
          cellNumber: "C-001",
          location: "Bloc A",
          status: "in_custody",
          createdBy: user1.id,
          updatedBy: user1.id,
        },
        {
          firstName: "Jeanne",
          lastName: "Nyirahabimana",
          sex: "Female",
          placeOfBirth: "Rutshuru, Nord-Kivu",
          dateOfBirth: new Date("1992-11-03"),
          parentNames: "Père: Pierre Nyirahabimana, Mère: Marie Uwimana",
          originNeighborhood: "Centre Rutshuru",
          education: "Université - Licence en Économie",
          employment: "Commerçante",
          maritalStatus: "Married",
          maritalDetails: "Mariée à Jean Bizimana, 2 enfants",
          religion: "Protestante",
          residence: "Quartier Kyeshero, Goma",
          phoneNumber: "+243 971 234 890",
          crimeReason: "Fraude financière et détournement",
          arrestDate: new Date("2024-09-08"),
          arrestLocation: "Marché Central, Goma",
          arrestedBy: "Inspecteur Mbayo",
          arrestTime: new Date("2024-09-08T10:15:00"),
          arrivalTime: new Date("2024-09-08T11:30:00"),
          cellNumber: "C-005",
          location: "Bloc B",
          status: "in_custody",
          createdBy: user2.id,
          updatedBy: user2.id,
        },
        {
          firstName: "Patrick",
          lastName: "Kalimba",
          sex: "Male",
          placeOfBirth: "Masisi, Nord-Kivu",
          dateOfBirth: new Date("1987-02-14"),
          parentNames: "Père: Joseph Kalimba, Mère: Agnes Nyiramana",
          originNeighborhood: "Centre Masisi",
          education: "Primaire",
          employment: "Agriculteur",
          maritalStatus: "Married",
          maritalDetails: "Marié à Rose Mukamana, 4 enfants",
          religion: "Catholique",
          residence: "Quartier Mabanga Nord, Goma",
          crimeReason: "Agression et coups et blessures",
          arrestDate: new Date("2024-09-10"),
          arrestLocation: "Quartier Mabanga Nord",
          arrestedBy: "Commissaire Nzeyimana",
          arrestTime: new Date("2024-09-10T18:20:00"),
          arrivalTime: new Date("2024-09-10T19:00:00"),
          cellNumber: "C-003",
          location: "Bloc A",
          status: "released",
          releaseDate: new Date("2024-09-11"),
          releaseReason: "Caution payée par la famille",
          createdBy: user3.id,
          updatedBy: user3.id,
        },
      ])
      .returning();

    // 4. Seed Incidents
    console.log("⚠️ Seeding incidents...");
    const [incident1, incident2] = await db
      .insert(incidents)
      .values([
        {
          incidentDate: new Date("2024-09-07"),
          location: "Quartier Himbi, près du marché",
          eventType: "Assassinats",
          numberOfVictims: 2,
          createdBy: user1.id,
          updatedBy: user1.id,
        },
        {
          incidentDate: new Date("2024-09-09"),
          location: "Route Goma-Bukavu, km 15",
          eventType: "Attaque armée",
          numberOfVictims: 1,
          createdBy: user2.id,
          updatedBy: user2.id,
        },
      ])
      .returning();

    // 5. Seed Victims
    console.log("💔 Seeding victims...");
    await db.insert(victims).values([
      {
        incidentId: incident1.id,
        name: "Antoine Bishikwabo",
        sex: "Male",
        causeOfDeath: "Balles - arme à feu",
        createdBy: user1.id,
        updatedBy: user1.id,
      },
      {
        incidentId: incident1.id,
        name: "Sarah Mukamana",
        sex: "Female",
        causeOfDeath: "Balles - arme à feu",
        createdBy: user1.id,
        updatedBy: user1.id,
      },
      {
        incidentId: incident2.id,
        name: "Jean-Baptiste Nshimiyimana",
        sex: "Male",
        causeOfDeath: "Arme blanche - machette",
        createdBy: user2.id,
        updatedBy: user2.id,
      },
    ]);

    // 6. Seed Seizures
    console.log("🚗 Seeding seizures...");
    await db.insert(seizures).values([
      {
        itemName: "Motorcycle Yamaha DT 125",
        type: "motorcycles",
        seizureLocation: "Avenue de la Paix, Goma",
        chassisNumber: "MD01E-123456",
        plateNumber: "CD-123-NK",
        ownerName: "Claude Muhindo",
        ownerResidence: "Quartier Ndosho, Goma",
        seizureDate: new Date("2024-09-05"),
        status: "in_custody",
        createdBy: user1.id,
        updatedBy: user1.id,
      },
      {
        itemName: "Toyota Hilux Pick-up",
        type: "cars",
        seizureLocation: "Marché Central, Goma",
        chassisNumber: "JTFTN3AD9D0123456",
        plateNumber: "CD-456-NK",
        ownerName: "Jeanne Nyirahabimana",
        ownerResidence: "Quartier Kyeshero, Goma",
        seizureDate: new Date("2024-09-08"),
        status: "in_custody",
        createdBy: user2.id,
        updatedBy: user2.id,
      },
      {
        itemName: "Sac d'argent liquide",
        type: "objects",
        seizureLocation: "Domicile suspect, Quartier Mabanga",
        ownerName: "Inconnu",
        seizureDate: new Date("2024-09-09"),
        status: "evidence",
        createdBy: user3.id,
        updatedBy: user3.id,
      },
    ]);

    // 7. Seed Reports
    console.log("📄 Seeding reports...");
    await db.insert(reports).values([
      {
        title: "Rapport Quotidien de Sécurité - 07 Septembre 2024",
        content: `Rapport de la situation sécuritaire à Goma pour la journée du 07 septembre 2024.

INCIDENTS MAJEURS:
- Double assassinat au Quartier Himbi vers 22h30
- 2 victimes identifiées: Antoine Bishikwabo et Sarah Mukamana
- Enquête en cours, suspects non identifiés

ARRESTS:
- 1 arrestation pour vol à main armée (Claude Muhindo)
- Saisie d'une moto Yamaha utilisée dans le crime

RECOMMANDATIONS:
- Renforcer les patrouilles nocturnes au Quartier Himbi
- Poursuivre l'enquête sur le double meurtre`,
        reportDate: new Date("2024-09-07"),
        createdBy: user1.id,
        updatedBy: user1.id,
      },
      {
        title: "Rapport Hebdomadaire - Semaine du 02-08 Septembre 2024",
        content: `Synthèse des activités de la semaine du 02 au 08 septembre 2024.

STATISTIQUES:
- 3 arrestations majeures
- 2 incidents sécuritaires graves
- 3 véhicules saisis

TENDANCES:
- Augmentation des vols à main armée dans le centre-ville
- Incidents nocturnes en hausse au Quartier Himbi

ACTIONS ENTREPRISES:
- Renforcement des patrouilles
- Coordination avec les leaders communautaires`,
        reportDate: new Date("2024-09-08"),
        createdBy: user2.id,
        updatedBy: user2.id,
      },
    ]);

    // 8. Seed Statements
    console.log("📋 Seeding statements...");
    await db.insert(statements).values([
      {
        fileUrl: "/uploads/statements/statement_muhindo_20240905.pdf",
        detaineeId: createdDetainees[0].id, // Claude Muhindo
        createdBy: user1.id,
        updatedBy: user1.id,
      },
      {
        fileUrl: "/uploads/statements/statement_nyirahabimana_20240908.pdf",
        detaineeId: createdDetainees[1].id, // Jeanne Nyirahabimana
        createdBy: user2.id,
        updatedBy: user2.id,
      },
      {
        fileUrl: "/uploads/statements/witness_statement_himbi_incident.pdf",
        detaineeId: createdDetainees[2].id, // Pacifique Nakulire
        createdBy: user1.id,
        updatedBy: user1.id,
      },
    ]);

    // 9. Seed Audit Logs
    console.log("📝 Seeding audit logs...");
    await db.insert(auditLogs).values([
      {
        userId: user1.id,
        action: "create",
        entityType: "detainee",
        entityId: "det-001",
        details: {
          description: "New detainee registered",
          detainee: "Claude Muhindo",
        },
      },
      {
        userId: user2.id,
        action: "create",
        entityType: "incident",
        entityId: "inc-001",
        details: {
          description: "Security incident reported",
          location: "Quartier Himbi",
          type: "Assassinats",
        },
      },
      {
        userId: user1.id,
        action: "update",
        entityType: "detainee",
        entityId: "det-003",
        details: {
          description: "Detainee status updated",
          changed: {
            status: { old: "in_custody", new: "released" },
          },
        },
      },
      {
        userId: user3.id,
        action: "create",
        entityType: "seizure",
        entityId: "seiz-001",
        details: {
          description: "Vehicle seized",
          item: "Motorcycle Yamaha DT 125",
          location: "Avenue de la Paix",
        },
      },
    ]);

    console.log("✅ Database seeded successfully!");
    console.log("\n📊 Seeded data summary:");
    console.log("- 3 Users (admin accounts)");
    console.log("- 3 Employees (police officers)");
    console.log("- 3 Detainees (various cases)");
    console.log("- 2 Security incidents");
    console.log("- 3 Victims");
    console.log("- 3 Seized items");
    console.log("- 2 Reports");
    console.log("- 3 Statement files");
    console.log("- 4 Audit log entries");
    console.log("\n🔐 Test login credentials:");
    console.log("Email: admin@dsr.gov.cd");
    console.log("Password: password123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log("🎉 Seed completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seed failed:", error);
    process.exit(1);
  });
