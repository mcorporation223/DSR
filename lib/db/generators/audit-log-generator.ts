import { faker } from "@faker-js/faker";
import { NewAuditLog } from "../schema";
import { getRandomElement, getRandomDate } from "./constants";

export interface AuditLogGeneratorOptions {
  userIds: string[]; // Required for userId
  entityIds?: {
    detainees?: string[];
    employees?: string[];
    incidents?: string[];
    reports?: string[];
    statements?: string[];
    seizures?: string[];
    users?: string[];
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// System actions that can be audited
const AUDIT_ACTIONS = [
  "create",
  "update",
  "delete",
  "status_change",
  "login",
  "logout",
  "password_change",
  "bulk_update",
  "export",
  "import",
] as const;

// Entity types that can be audited
const ENTITY_TYPES = [
  "user",
  "employee",
  "detainee",
  "incident",
  "victim",
  "report",
  "statement",
  "seizure",
  "system",
] as const;

// Common field changes for different entity types
const ENTITY_FIELD_CHANGES = {
  detainee: [
    { field: "status", oldValue: "in_custody", newValue: "released" },
    { field: "status", oldValue: "released", newValue: "in_custody" },
    { field: "status", oldValue: "in_custody", newValue: "transferred" },
    { field: "residence", oldValue: "Goma", newValue: "Bukavu" },
    {
      field: "phoneNumber",
      oldValue: "+243 999 123 456",
      newValue: "+243 999 654 321",
    },
    { field: "crimeReason", oldValue: "Vol", newValue: "Vol à main armée" },
    { field: "arrestDate", oldValue: "2024-01-15", newValue: "2024-01-16" },
    { field: "releaseDate", oldValue: "null", newValue: "2024-02-15" },
  ],
  employee: [
    { field: "isActive", oldValue: "true", newValue: "false" },
    { field: "isActive", oldValue: "false", newValue: "true" },
    { field: "function", oldValue: "Agent de Police", newValue: "Inspecteur" },
    { field: "deploymentLocation", oldValue: "Goma", newValue: "Masisi" },
    {
      field: "phone",
      oldValue: "+243 999 111 222",
      newValue: "+243 999 333 444",
    },
    { field: "email", oldValue: "old@police.cd", newValue: "new@police.cd" },
    {
      field: "residence",
      oldValue: "Quartier Himbi",
      newValue: "Quartier Mugunga",
    },
  ],
  incident: [
    { field: "status", oldValue: "investigating", newValue: "closed" },
    { field: "status", oldValue: "reported", newValue: "investigating" },
    {
      field: "location",
      oldValue: "Avenue de la Paix",
      newValue: "Quartier Himbi",
    },
    {
      field: "description",
      oldValue: "Brief description",
      newValue: "Detailed investigation report",
    },
    { field: "priority", oldValue: "medium", newValue: "high" },
  ],
  report: [
    {
      field: "title",
      oldValue: "Rapport Préliminaire",
      newValue: "Rapport Final",
    },
    {
      field: "content",
      oldValue: "Contenu provisoire",
      newValue: "Contenu finalisé",
    },
    { field: "location", oldValue: "Goma", newValue: "Bukavu" },
  ],
  statement: [
    { field: "status", oldValue: "pending", newValue: "completed" },
    {
      field: "fileUrl",
      oldValue: "temp-statement.pdf",
      newValue: "final-statement.pdf",
    },
  ],
  seizure: [
    { field: "status", oldValue: "held", newValue: "released" },
    { field: "status", oldValue: "released", newValue: "held" },
    { field: "location", oldValue: "Entrepôt A", newValue: "Entrepôt B" },
    { field: "condition", oldValue: "good", newValue: "damaged" },
    { field: "estimatedValue", oldValue: "1000 USD", newValue: "1200 USD" },
  ],
  user: [
    { field: "isActive", oldValue: "true", newValue: "false" },
    { field: "isActive", oldValue: "false", newValue: "true" },
    { field: "role", oldValue: "user", newValue: "admin" },
    { field: "mustChangePassword", oldValue: "false", newValue: "true" },
    {
      field: "email",
      oldValue: "old@example.com",
      newValue: "new@example.com",
    },
  ],
};

// Action descriptions in French for different operations
const ACTION_DESCRIPTIONS = {
  create: {
    detainee: "Nouveau détenu enregistré",
    employee: "Nouvel employé créé",
    incident: "Incident signalé",
    report: "Rapport créé",
    statement: "Déclaration enregistrée",
    seizure: "Saisie effectuée",
    user: "Nouvel utilisateur créé",
    victim: "Victime ajoutée",
    system: "Configuration système créée",
  },
  update: {
    detainee: "Informations du détenu mises à jour",
    employee: "Profil employé modifié",
    incident: "Détails de l'incident mis à jour",
    report: "Rapport modifié",
    statement: "Déclaration mise à jour",
    seizure: "Informations de saisie modifiées",
    user: "Compte utilisateur mis à jour",
    victim: "Informations de la victime mises à jour",
    system: "Configuration système modifiée",
  },
  delete: {
    detainee: "Dossier détenu supprimé",
    employee: "Employé supprimé",
    incident: "Incident supprimé",
    report: "Rapport supprimé",
    statement: "Déclaration supprimée",
    seizure: "Saisie supprimée",
    user: "Utilisateur supprimé",
    victim: "Victime supprimée",
    system: "Configuration système supprimée",
  },
  status_change: {
    detainee: "Statut du détenu modifié",
    employee: "Statut employé changé",
    incident: "Statut de l'incident mis à jour",
    seizure: "Statut de la saisie modifié",
    user: "Statut utilisateur changé",
    system: "Statut système modifié",
  },
  login: {
    system: "Connexion utilisateur",
  },
  logout: {
    system: "Déconnexion utilisateur",
  },
  password_change: {
    user: "Mot de passe modifié",
  },
  bulk_update: {
    detainee: "Mise à jour groupée de détenus",
    employee: "Mise à jour groupée d'employés",
    incident: "Mise à jour groupée d'incidents",
    seizure: "Mise à jour groupée de saisies",
  },
  export: {
    detainee: "Export des données de détenus",
    employee: "Export des données d'employés",
    incident: "Export des incidents",
    report: "Export des rapports",
    system: "Export de données système",
  },
  import: {
    detainee: "Import de détenus",
    employee: "Import d'employés",
    system: "Import de données système",
  },
};

// System entity descriptions (for non-CRUD operations)
const SYSTEM_ENTITIES = [
  "system_backup",
  "database_maintenance",
  "user_session",
  "security_scan",
  "data_export",
  "configuration_change",
  "audit_cleanup",
];

/**
 * Generates realistic audit log details based on action and entity type
 */
function generateAuditDetails(
  action: string,
  entityType: string,
  entityId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options: AuditLogGeneratorOptions
): Record<string, unknown> {
  const baseDetails: Record<string, unknown> = {
    description: getActionDescription(action, entityType),
    entityId: entityId,
    timestamp: new Date().toISOString(),
  };

  switch (action) {
    case "create":
      return {
        ...baseDetails,
        ...generateCreateDetails(entityType),
      };

    case "update":
      return {
        ...baseDetails,
        ...generateUpdateDetails(entityType),
      };

    case "delete":
      return {
        ...baseDetails,
        reason: getRandomElement([
          "Données erronées",
          "Doublon détecté",
          "Demande utilisateur",
          "Nettoyage administratif",
          "Migration de données",
        ]),
        backup_created: faker.datatype.boolean(),
      };

    case "status_change":
      return {
        ...baseDetails,
        ...generateStatusChangeDetails(entityType),
      };

    case "login":
      return {
        ...baseDetails,
        ip_address: faker.internet.ip(),
        user_agent: faker.internet.userAgent(),
        success: faker.datatype.boolean({ probability: 0.95 }),
      };

    case "logout":
      return {
        ...baseDetails,
        session_duration: `${faker.number.int({ min: 5, max: 480 })} minutes`,
      };

    case "password_change":
      return {
        ...baseDetails,
        method: getRandomElement([
          "user_initiated",
          "admin_reset",
          "expired_forced",
        ]),
        strong_password: faker.datatype.boolean({ probability: 0.8 }),
      };

    case "bulk_update":
      return {
        ...baseDetails,
        records_affected: faker.number.int({ min: 5, max: 100 }),
        operation_time: `${faker.number.int({ min: 1, max: 30 })} seconds`,
        ...generateBulkUpdateDetails(entityType),
      };

    case "export":
      return {
        ...baseDetails,
        format: getRandomElement(["PDF", "Excel", "CSV"]),
        records_count: faker.number.int({ min: 1, max: 1000 }),
        file_size: `${faker.number.float({
          min: 0.1,
          max: 50.0,
          fractionDigits: 1,
        })} MB`,
      };

    case "import":
      return {
        ...baseDetails,
        source_file: faker.system.fileName({ extensionCount: 1 }),
        records_imported: faker.number.int({ min: 1, max: 500 }),
        validation_errors: faker.number.int({ min: 0, max: 5 }),
      };

    default:
      return baseDetails;
  }
}

/**
 * Get action description in French
 */
function getActionDescription(action: string, entityType: string): string {
  const descriptions =
    ACTION_DESCRIPTIONS[action as keyof typeof ACTION_DESCRIPTIONS];
  if (!descriptions) return `Action: ${action}`;

  const description = descriptions[entityType as keyof typeof descriptions];
  return description || `${action} - ${entityType}`;
}

/**
 * Generate create-specific details
 */
function generateCreateDetails(entityType: string): Record<string, unknown> {
  const details: Record<string, unknown> = {
    created_via: getRandomElement(["web_interface", "api", "import", "system"]),
  };

  switch (entityType) {
    case "detainee":
      details.arrest_reason = getRandomElement([
        "Vol",
        "Agression",
        "Trafic",
        "Trouble public",
        "Enquête",
      ]);
      details.arresting_officer = faker.person.fullName();
      break;

    case "employee":
      details.department = getRandomElement([
        "Police Judiciaire",
        "Sécurité Publique",
        "Administration",
      ]);
      details.initial_role = getRandomElement([
        "Agent de Police",
        "Inspecteur",
        "Commissaire",
      ]);
      break;

    case "incident":
      details.severity = getRandomElement([
        "low",
        "medium",
        "high",
        "critical",
      ]);
      details.reported_by = getRandomElement([
        "citizen",
        "patrol",
        "emergency_call",
      ]);
      break;
  }

  return details;
}

/**
 * Generate update-specific details
 */
function generateUpdateDetails(entityType: string): Record<string, unknown> {
  const fieldChanges =
    ENTITY_FIELD_CHANGES[entityType as keyof typeof ENTITY_FIELD_CHANGES];
  if (!fieldChanges || fieldChanges.length === 0) {
    return {
      fields_updated: faker.number.int({ min: 1, max: 3 }),
      update_reason: "Correction des informations",
    };
  }

  const change = getRandomElement(fieldChanges);
  return {
    changed: {
      [change.field]: {
        old: change.oldValue,
        new: change.newValue,
      },
    },
    update_reason: getRandomElement([
      "Correction d'erreur",
      "Nouvelle information",
      "Mise à jour administrative",
      "Demande utilisateur",
      "Procédure légale",
    ]),
  };
}

/**
 * Generate status change specific details
 */
function generateStatusChangeDetails(
  entityType: string
): Record<string, unknown> {
  const details: Record<string, unknown> = {
    status_change_reason: getRandomElement([
      "Procédure légale",
      "Décision administrative",
      "Fin d'enquête",
      "Transfert",
      "Libération conditionnelle",
    ]),
  };

  switch (entityType) {
    case "detainee":
      details.legal_authority = getRandomElement([
        "Procureur de la République",
        "Juge d'instruction",
        "Commissaire de Police",
      ]);
      break;

    case "incident":
      details.investigation_outcome = getRandomElement([
        "Résolu",
        "Non résolu",
        "Transféré",
        "Classé",
      ]);
      break;

    case "seizure":
      details.release_authorized_by = faker.person.fullName();
      details.release_document = `DOC-${faker.string.numeric(6)}`;
      break;
  }

  return details;
}

/**
 * Generate bulk update specific details
 */
function generateBulkUpdateDetails(
  entityType: string
): Record<string, unknown> {
  const details: Record<string, unknown> = {
    update_criteria: getRandomElement([
      "Status update",
      "Location change",
      "Administrative correction",
    ]),
  };

  switch (entityType) {
    case "detainee":
      details.status_updated_to = getRandomElement([
        "released",
        "transferred",
        "in_custody",
      ]);
      break;

    case "employee":
      details.field_updated = getRandomElement([
        "deployment_location",
        "function",
        "is_active",
      ]);
      break;
  }

  return details;
}

/**
 * Generate a realistic entity ID based on type
 */
function generateEntityId(
  entityType: string,
  options: AuditLogGeneratorOptions
): string {
  // Use provided entity IDs if available
  const entityIds = options.entityIds;
  if (entityIds) {
    const typeKey = `${entityType}s` as keyof typeof entityIds;
    const availableIds = entityIds[typeKey];
    if (availableIds && availableIds.length > 0) {
      return getRandomElement(availableIds);
    }
  }

  // Generate realistic entity IDs based on type
  switch (entityType) {
    case "detainee":
      return `det-${faker.string.numeric(4)}`;
    case "employee":
      return `emp-${faker.string.numeric(4)}`;
    case "incident":
      return `inc-${faker.string.numeric(4)}`;
    case "report":
      return `rpt-${faker.string.numeric(4)}`;
    case "statement":
      return `stmt-${faker.string.numeric(4)}`;
    case "seizure":
      return `seiz-${faker.string.numeric(4)}`;
    case "user":
      return faker.string.uuid();
    case "victim":
      return `vict-${faker.string.numeric(4)}`;
    case "system":
      return getRandomElement(SYSTEM_ENTITIES);
    default:
      return `${entityType}-${faker.string.numeric(4)}`;
  }
}

/**
 * Determines realistic action-entity combinations
 */
function getRealisticActionEntityCombinations(): Array<{
  action: string;
  entityType: string;
  weight: number;
}> {
  return [
    // High frequency operations
    { action: "create", entityType: "detainee", weight: 15 },
    { action: "update", entityType: "detainee", weight: 20 },
    { action: "status_change", entityType: "detainee", weight: 12 },

    { action: "create", entityType: "incident", weight: 10 },
    { action: "update", entityType: "incident", weight: 8 },

    { action: "create", entityType: "seizure", weight: 8 },
    { action: "update", entityType: "seizure", weight: 6 },
    { action: "status_change", entityType: "seizure", weight: 5 },

    // Medium frequency operations
    { action: "create", entityType: "employee", weight: 3 },
    { action: "update", entityType: "employee", weight: 5 },
    { action: "status_change", entityType: "employee", weight: 2 },

    { action: "create", entityType: "report", weight: 6 },
    { action: "update", entityType: "report", weight: 4 },

    { action: "create", entityType: "statement", weight: 5 },
    { action: "update", entityType: "statement", weight: 3 },

    // System operations
    { action: "login", entityType: "system", weight: 25 },
    { action: "logout", entityType: "system", weight: 20 },
    { action: "password_change", entityType: "user", weight: 2 },

    // Lower frequency operations
    { action: "delete", entityType: "detainee", weight: 1 },
    { action: "delete", entityType: "incident", weight: 1 },
    { action: "delete", entityType: "employee", weight: 1 },

    { action: "bulk_update", entityType: "detainee", weight: 2 },
    { action: "bulk_update", entityType: "employee", weight: 1 },

    { action: "export", entityType: "detainee", weight: 3 },
    { action: "export", entityType: "report", weight: 2 },
    { action: "export", entityType: "incident", weight: 2 },

    { action: "import", entityType: "detainee", weight: 1 },
    { action: "import", entityType: "employee", weight: 1 },
  ];
}

/**
 * Selects a realistic action-entity combination based on weights
 */
function selectActionEntityCombination(): {
  action: string;
  entityType: string;
} {
  const combinations = getRealisticActionEntityCombinations();
  const totalWeight = combinations.reduce(
    (sum, combo) => sum + combo.weight,
    0
  );
  const random = faker.number.float({ min: 0, max: totalWeight });

  let currentWeight = 0;
  for (const combo of combinations) {
    currentWeight += combo.weight;
    if (random <= currentWeight) {
      return { action: combo.action, entityType: combo.entityType };
    }
  }

  // Fallback
  return { action: "update", entityType: "detainee" };
}

/**
 * Generates a single audit log record
 */
export function generateAuditLog(
  options: AuditLogGeneratorOptions
): NewAuditLog {
  const { userIds, dateRange } = options;

  // Select realistic action and entity type
  const { action, entityType } = selectActionEntityCombination();

  // Generate entity ID
  const entityId = generateEntityId(entityType, options);

  // Generate audit date within range or default to last 6 months
  const auditDateStart =
    dateRange?.start || new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
  const auditDateEnd = dateRange?.end || new Date();
  const auditDate = faker.date.between({
    from: auditDateStart,
    to: auditDateEnd,
  });

  // Generate realistic details
  const details = generateAuditDetails(action, entityType, entityId, options);

  return {
    userId: getRandomElement(userIds),
    action,
    entityType,
    entityId,
    createdAt: auditDate,
    details,
  };
}

/**
 * Generates multiple audit log records
 */
export function generateAuditLogs(
  count: number,
  options: AuditLogGeneratorOptions
): NewAuditLog[] {
  const auditLogs: NewAuditLog[] = [];

  for (let i = 0; i < count; i++) {
    const auditLog = generateAuditLog(options);
    auditLogs.push(auditLog);
  }

  // Sort by created date for realistic chronological order
  return auditLogs.sort(
    (a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
  );
}

/**
 * Generates audit logs in batches for memory efficiency
 */
export function* generateAuditLogBatches(
  totalCount: number,
  batchSize: number,
  options: AuditLogGeneratorOptions
): Generator<NewAuditLog[], void, unknown> {
  let processed = 0;

  while (processed < totalCount) {
    const currentBatchSize = Math.min(batchSize, totalCount - processed);
    const batch = generateAuditLogs(currentBatchSize, options);

    processed += currentBatchSize;
    yield batch;
  }
}

/**
 * Generates audit logs with specific action distribution
 */
export function generateAuditLogsByAction(
  actionDistribution: Record<string, number>,
  options: AuditLogGeneratorOptions
): NewAuditLog[] {
  const auditLogs: NewAuditLog[] = [];

  for (const [action, count] of Object.entries(actionDistribution)) {
    if (!AUDIT_ACTIONS.includes(action as (typeof AUDIT_ACTIONS)[number])) {
      console.warn(`Unknown audit action: ${action}`);
      continue;
    }

    for (let i = 0; i < count; i++) {
      // Force specific action, let entity type be selected realistically
      const entityType = selectRealisticEntityForAction(action);
      const entityId = generateEntityId(entityType, options);

      const auditLog: NewAuditLog = {
        userId: getRandomElement(options.userIds),
        action,
        entityType,
        entityId,
        createdAt: getRandomDate(
          options.dateRange?.start ||
            new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
          options.dateRange?.end || new Date()
        ),
        details: generateAuditDetails(action, entityType, entityId, options),
      };

      auditLogs.push(auditLog);
    }
  }

  // Sort by created date
  return auditLogs.sort(
    (a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
  );
}

/**
 * Select realistic entity type for a given action
 */
function selectRealisticEntityForAction(action: string): string {
  const actionEntityMap: Record<string, string[]> = {
    create: [
      "detainee",
      "employee",
      "incident",
      "seizure",
      "report",
      "statement",
    ],
    update: [
      "detainee",
      "employee",
      "incident",
      "seizure",
      "report",
      "statement",
    ],
    delete: [
      "detainee",
      "employee",
      "incident",
      "seizure",
      "report",
      "statement",
    ],
    status_change: ["detainee", "employee", "incident", "seizure"],
    login: ["system"],
    logout: ["system"],
    password_change: ["user"],
    bulk_update: ["detainee", "employee", "incident", "seizure"],
    export: ["detainee", "employee", "incident", "report", "system"],
    import: ["detainee", "employee", "system"],
  };

  const possibleEntities = actionEntityMap[action] || ENTITY_TYPES;
  return getRandomElement(possibleEntities);
}

/**
 * Generate audit logs for specific time periods (useful for time-series analysis)
 */
export function generateAuditLogsByPeriod(
  periods: Array<{
    start: Date;
    end: Date;
    count: number;
    actionsFilter?: string[];
  }>,
  options: AuditLogGeneratorOptions
): NewAuditLog[] {
  const allAuditLogs: NewAuditLog[] = [];

  for (const period of periods) {
    const periodOptions = {
      ...options,
      dateRange: { start: period.start, end: period.end },
    };

    if (period.actionsFilter) {
      // Generate specific actions for this period
      const actionDistribution: Record<string, number> = {};
      const countPerAction = Math.ceil(
        period.count / period.actionsFilter.length
      );

      period.actionsFilter.forEach((action) => {
        actionDistribution[action] = countPerAction;
      });

      const periodAuditLogs = generateAuditLogsByAction(
        actionDistribution,
        periodOptions
      );
      allAuditLogs.push(...periodAuditLogs.slice(0, period.count));
    } else {
      // Generate mixed actions for this period
      const periodAuditLogs = generateAuditLogs(period.count, periodOptions);
      allAuditLogs.push(...periodAuditLogs);
    }
  }

  return allAuditLogs.sort(
    (a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
  );
}

/**
 * Helper function to get statistics about generated audit logs
 */
export function getAuditLogStatistics(auditLogs: NewAuditLog[]) {
  const stats = {
    totalLogs: auditLogs.length,
    actionDistribution: {} as Record<string, number>,
    entityTypeDistribution: {} as Record<string, number>,
    userDistribution: {} as Record<string, number>,
    logsPerDay: {} as Record<string, number>,
    oldestLog: null as Date | null,
    newestLog: null as Date | null,
    averageLogsPerUser: 0,
    systemLogsPercentage: 0,
  };

  let systemLogsCount = 0;

  for (const log of auditLogs) {
    // Count actions
    stats.actionDistribution[log.action] =
      (stats.actionDistribution[log.action] || 0) + 1;

    // Count entity types
    stats.entityTypeDistribution[log.entityType] =
      (stats.entityTypeDistribution[log.entityType] || 0) + 1;

    // Count users
    stats.userDistribution[log.userId] =
      (stats.userDistribution[log.userId] || 0) + 1;

    // Count system logs
    if (log.entityType === "system") {
      systemLogsCount++;
    }

    // Track date range
    const logDate = log.createdAt;
    if (logDate) {
      if (!stats.oldestLog || logDate < stats.oldestLog) {
        stats.oldestLog = logDate;
      }
      if (!stats.newestLog || logDate > stats.newestLog) {
        stats.newestLog = logDate;
      }

      // Count logs per day
      const dayKey = logDate.toISOString().split("T")[0];
      stats.logsPerDay[dayKey] = (stats.logsPerDay[dayKey] || 0) + 1;
    }
  }

  // Calculate averages and percentages
  const uniqueUsers = Object.keys(stats.userDistribution).length;
  stats.averageLogsPerUser =
    uniqueUsers > 0 ? Math.round(auditLogs.length / uniqueUsers) : 0;
  stats.systemLogsPercentage = Math.round(
    (systemLogsCount / auditLogs.length) * 100
  );

  return stats;
}

/**
 * Helper function to validate audit log data
 */
export function validateAuditLogs(auditLogs: NewAuditLog[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const [index, log] of auditLogs.entries()) {
    // Check required fields
    if (!log.userId || log.userId.trim().length === 0) {
      errors.push(`Audit log ${index}: Missing or empty userId`);
    }

    if (!log.action || log.action.trim().length === 0) {
      errors.push(`Audit log ${index}: Missing or empty action`);
    }

    if (!log.entityType || log.entityType.trim().length === 0) {
      errors.push(`Audit log ${index}: Missing or empty entityType`);
    }

    if (!log.entityId || log.entityId.trim().length === 0) {
      errors.push(`Audit log ${index}: Missing or empty entityId`);
    }

    // Validate action values
    if (
      log.action &&
      !AUDIT_ACTIONS.includes(log.action as (typeof AUDIT_ACTIONS)[number])
    ) {
      errors.push(`Audit log ${index}: Invalid action '${log.action}'`);
    }

    // Validate entity type values
    if (
      log.entityType &&
      !ENTITY_TYPES.includes(log.entityType as (typeof ENTITY_TYPES)[number])
    ) {
      errors.push(`Audit log ${index}: Invalid entityType '${log.entityType}'`);
    }

    // Check date validity
    if (log.createdAt && log.createdAt > new Date()) {
      errors.push(`Audit log ${index}: Created date is in the future`);
    }

    // Validate details structure
    if (log.details && typeof log.details !== "object") {
      errors.push(`Audit log ${index}: Details should be an object`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
