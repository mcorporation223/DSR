import {
  pgTable,
  text,
  bigserial,
  timestamp,
  boolean,
  varchar,
  integer,
  uuid,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).default("admin").notNull(), // e.g., admin, user
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const employees = pgTable("employees", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  sex: varchar("sex", { length: 10 }).notNull(),
  placeOfBirth: varchar("place_of_birth", { length: 255 }), // Lieu de naissance
  dateOfBirth: timestamp("date_of_birth"), // Date de naissance
  education: text("education"), // Etude faite / formation (Education/Training)
  maritalStatus: varchar("marital_status", { length: 50 }), // Etat civil (Single/Married/Divorced/Widowed)

  // Professional Information
  employeeId: varchar("employee_id", { length: 50 }).unique(), // Optional - can be assigned later when ID system is implemented
  function: varchar("function", { length: 100 }), // Function/role
  deploymentLocation: varchar("deployment_location", { length: 255 }), // Lieu de deployment

  // Contact Information
  residence: varchar("residence", { length: 255 }), // Residence
  phone: varchar("phone", { length: 20 }), // Tel
  email: varchar("email", { length: 255 }).unique(), // Email

  // Profile Photo
  photoUrl: varchar("photo_url", { length: 500 }), // Photo URL or path

  // Audit Fields
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const detainees = pgTable(
  "detainees",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Personal Information
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    sex: varchar("sex", { length: 10 }).notNull(), // Sex (Male/Female/Other)
    placeOfBirth: varchar("place_of_birth", { length: 255 }), // Lieu de naissance
    dateOfBirth: timestamp("date_of_birth"), // Date de naissance

    // Family Information
    parentNames: text("parent_names"), // Details of parents (nom)
    originNeighborhood: varchar("origin_neighborhood", { length: 255 }), // Quartier d'origine

    // Background Information
    education: text("education"), // Etude faites (Education completed)
    employment: varchar("employment", { length: 255 }), // Employment/Job
    maritalStatus: varchar("marital_status", { length: 50 }), // Etat civil (Single/Married/etc.)
    maritalDetails: text("marital_details"), // married to, kids details
    religion: varchar("religion", { length: 100 }), // Religion

    // Contact Information
    residence: varchar("residence", { length: 255 }), // Residence
    phoneNumber: varchar("phone_number", { length: 20 }), // Tel number

    // Crime Information
    crimeReason: text("crime_reason"), // Motif ya crime (Reason for crime)

    // Arrest Information
    arrestDate: timestamp("arrest_date"), // Date yakukamatiwa
    arrestLocation: varchar("arrest_location", { length: 255 }), // provenance (lieu/territoire)
    arrestedBy: varchar("arrested_by", { length: 255 }), // menye alimuleta (who brought them)
    arrestTime: timestamp("arrest_time"), // time taken
    arrivalDate: timestamp("arrival_date"), // date arrived at detention facility
    arrivalTime: timestamp("arrival_time"), // time arrived

    // Custody Information
    cellNumber: varchar("cell_number", { length: 50 }), // cells
    location: varchar("location", { length: 255 }), // location (facility/wing)
    status: varchar("status", { length: 50 }).default("in_custody"), // status (in_custody, released, transferred, etc.)

    // Release Information
    releaseDate: timestamp("release_date"),
    releaseReason: text("release_reason"),

    // Audit Fields
    createdBy: uuid("created_by").references(() => users.id),
    updatedBy: uuid("updated_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("detainee_first_name_idx").using("btree", table.firstName),
    index("detainee_last_name_idx").using("btree", table.lastName),
    index("detainee_status_idx").using("btree", table.status),
    index("detainee_arrest_date_idx").using("btree", table.arrestDate),
  ]
);

export const incidents = pgTable(
  "incidents",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Basic Incident Information
    incidentDate: timestamp("incident_date").notNull(), // Date
    location: varchar("location", { length: 255 }).notNull(), // Lieu

    // Event Information
    eventType: varchar("event_type", { length: 100 }).notNull(), // Evenement category (assassinats, fusiades, etc.)

    // For Assassinats - number of victims (the dynamic form will create individual victim records)
    numberOfVictims: integer("number_of_victims").default(0), // Nombre de victimes

    // Audit Fields
    createdBy: uuid("created_by").references(() => users.id),
    updatedBy: uuid("updated_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("incident_date_idx").using("btree", table.incidentDate),
    index("incident_type_idx").using("btree", table.eventType),
    index("incident_location_idx").using("btree", table.location),
  ]
);

// Separate table for victims in assassination incidents
export const victims = pgTable(
  "victims",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Link to incident
    incidentId: uuid("incident_id")
      .notNull()
      .references(() => incidents.id, { onDelete: "cascade" }),

    // Victim Information (as shown in the screenshot)
    name: varchar("name", { length: 255 }).notNull(), // Nom de la Victime
    sex: varchar("sex", { length: 10 }).notNull(), // Sexe (Male/Female)
    causeOfDeath: text("cause_of_death"), // Cause du Décès (Ex: Balles, Arme blanche...)

    // Audit Fields
    createdBy: uuid("created_by").references(() => users.id),
    updatedBy: uuid("updated_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("victim_incident_idx").using("btree", table.incidentId)]
);

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  location: varchar("location", { length: 255 }),
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
  reportDate: timestamp("report_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const seizures = pgTable(
  "seizures",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Basic Item Information
    itemName: varchar("item_name", { length: 255 }).notNull(), // Name/description of seized item
    type: varchar("type", { length: 100 }).notNull(), // Type (cars, motorcycles, objects, etc.)

    // Location Information
    seizureLocation: varchar("seizure_location", { length: 255 }), // Provenance (lieu ya saisie) - where it was seized

    // Vehicle-specific Information (for cars, motorcycles, etc.)
    chassisNumber: varchar("chassis_number", { length: 100 }), // No chassie
    plateNumber: varchar("plate_number", { length: 50 }), // Plaque (license plate)

    // Owner Information
    ownerName: varchar("owner_name", { length: 255 }), // Proprietaire names
    ownerResidence: varchar("owner_residence", { length: 255 }), // Proprietaire residence

    // Seizure Details
    seizureDate: timestamp("seizure_date").notNull(), // When it was seized

    // Status and Legal
    status: varchar("status", { length: 50 }).default("in_custody"), // in_custody, released, disposed, etc.
    releaseDate: timestamp("release_date"), // If released back to owner

    // Audit Fields
    createdBy: uuid("created_by").references(() => users.id),
    updatedBy: uuid("updated_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("seizure_type_idx").using("btree", table.type),
    index("seizure_date_idx").using("btree", table.seizureDate),
    index("seizure_status_idx").using("btree", table.status),
  ]
);

export const statements = pgTable("statements", {
  id: uuid("id").defaultRandom().primaryKey(),
  fileUrl: varchar("file_url", { length: 500 }).notNull(), // URL or path to the statement file
  detaineeId: uuid("detainee_id")
    .notNull()
    .references(() => detainees.id), // Foreign key to detainees
  // Audit Fields
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id), // Fixed: Changed from varchar to uuid
    action: varchar("action", { length: 32 }).notNull(), // e.g. create, update, delete, status_change
    entityType: varchar("entity_type", { length: 32 }).notNull(), // e.g. employee, detainee, report, statement, incident, seizure
    entityId: varchar("entity_id", { length: 50 }).notNull(), // ID of the record in the entity table (keeping as varchar for flexibility)
    createdAt: timestamp("created_at").defaultNow().notNull(),
    details: jsonb("details"), // Flexible JSONB field for context { "changed": { "residence": { "old": "Goma", "new": "Masisi" } } }
  },
  (table) => [
    index("audit_user_idx").using("btree", table.userId),
    index("audit_action_idx").using("btree", table.action),
    index("audit_entity_type_idx").using("btree", table.entityType),
    index("audit_entity_id_idx").using("btree", table.entityId),
    index("audit_created_at_idx").using("btree", table.createdAt),
  ]
);

// Export types for use in the application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;

export type Detainee = typeof detainees.$inferSelect;
export type NewDetainee = typeof detainees.$inferInsert;

export type Incident = typeof incidents.$inferSelect;
export type NewIncident = typeof incidents.$inferInsert;

export type Victim = typeof victims.$inferSelect;
export type NewVictim = typeof victims.$inferInsert;

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;

export type Statement = typeof statements.$inferSelect;
export type NewStatement = typeof statements.$inferInsert;

export type Seizure = typeof seizures.$inferSelect;
export type NewSeizure = typeof seizures.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
