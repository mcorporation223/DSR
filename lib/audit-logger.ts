import { db } from "@/lib/db";
import { auditLogs, type NewAuditLog } from "@/lib/db/schema";
import type { User } from "@/lib/db/schema";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "status_change"
  | "password_reset_initiated"
  | "password_reset_completed";

export type AuditEntityType =
  | "user"
  | "employee"
  | "detainee"
  | "incident"
  | "report"
  | "statement"
  | "seizure"
  | "victim";

export interface AuditLogDetails {
  description: string;
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | Record<string, unknown>
    | Array<string | number | boolean | null>; // Allow additional context data
}

export interface CreateAuditLogParams {
  userId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  details: AuditLogDetails;
}

/**
 * Creates an audit log entry in the database
 */
export async function createAuditLog(
  params: CreateAuditLogParams
): Promise<void> {
  try {
    const auditLogData: NewAuditLog = {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details,
    };

    await db.insert(auditLogs).values(auditLogData);
  } catch (error) {
    // Log the error but don't throw to avoid breaking the main operation
    console.error("Failed to create audit log:", error);
  }
}

/**
 * Helper function to log user-related actions
 */
export async function logUserAction(
  currentUser: User,
  action: AuditAction,
  targetUserId: string,
  details: Omit<AuditLogDetails, "description"> & { description?: string }
): Promise<void> {
  const description =
    details.description || getDefaultDescription(action, "user");

  await createAuditLog({
    userId: currentUser.id,
    action,
    entityType: "user",
    entityId: targetUserId,
    details: {
      ...details,
      description,
    },
  });
}

/**
 * Helper function to log employee-related actions
 */
export async function logEmployeeAction(
  currentUser: User,
  action: AuditAction,
  employeeId: string,
  details: Omit<AuditLogDetails, "description"> & { description?: string }
): Promise<void> {
  const description =
    details.description || getDefaultDescription(action, "employee");

  await createAuditLog({
    userId: currentUser.id,
    action,
    entityType: "employee",
    entityId: employeeId,
    details: {
      ...details,
      description,
    },
  });
}

/**
 * Helper function to log detainee-related actions
 */
export async function logDetaineeAction(
  currentUser: User,
  action: AuditAction,
  detaineeId: string,
  details: Omit<AuditLogDetails, "description"> & { description?: string }
): Promise<void> {
  const description =
    details.description || getDefaultDescription(action, "detainee");

  await createAuditLog({
    userId: currentUser.id,
    action,
    entityType: "detainee",
    entityId: detaineeId,
    details: {
      ...details,
      description,
    },
  });
}

/**
 * Helper function to log incident-related actions
 */
export async function logIncidentAction(
  currentUser: User,
  action: AuditAction,
  incidentId: string,
  details: Omit<AuditLogDetails, "description"> & { description?: string }
): Promise<void> {
  const description =
    details.description || getDefaultDescription(action, "incident");

  await createAuditLog({
    userId: currentUser.id,
    action,
    entityType: "incident",
    entityId: incidentId,
    details: {
      ...details,
      description,
    },
  });
}

/**
 * Helper function to log report-related actions
 */
export async function logReportAction(
  currentUser: User,
  action: AuditAction,
  reportId: string,
  details: Omit<AuditLogDetails, "description"> & { description?: string }
): Promise<void> {
  const description =
    details.description || getDefaultDescription(action, "report");

  await createAuditLog({
    userId: currentUser.id,
    action,
    entityType: "report",
    entityId: reportId,
    details: {
      ...details,
      description,
    },
  });
}

/**
 * Helper function to log statement-related actions
 */
export async function logStatementAction(
  currentUser: User,
  action: AuditAction,
  statementId: string,
  details: Omit<AuditLogDetails, "description"> & { description?: string }
): Promise<void> {
  const description =
    details.description || getDefaultDescription(action, "statement");

  await createAuditLog({
    userId: currentUser.id,
    action,
    entityType: "statement",
    entityId: statementId,
    details: {
      ...details,
      description,
    },
  });
}

/**
 * Helper function to log seizure-related actions
 */
export async function logSeizureAction(
  currentUser: User,
  action: AuditAction,
  seizureId: string,
  details: Omit<AuditLogDetails, "description"> & { description?: string }
): Promise<void> {
  const description =
    details.description || getDefaultDescription(action, "seizure");

  await createAuditLog({
    userId: currentUser.id,
    action,
    entityType: "seizure",
    entityId: seizureId,
    details: {
      ...details,
      description,
    },
  });
}

/**
 * Helper function to log victim-related actions
 */
export async function logVictimAction(
  currentUser: User,
  action: AuditAction,
  victimId: string,
  details: Omit<AuditLogDetails, "description"> & { description?: string }
): Promise<void> {
  const description =
    details.description || getDefaultDescription(action, "victim");

  await createAuditLog({
    userId: currentUser.id,
    action,
    entityType: "victim",
    entityId: victimId,
    details: {
      ...details,
      description,
    },
  });
}

/**
 * Generates default description for audit actions
 */
function getDefaultDescription(
  action: AuditAction,
  entityType: AuditEntityType
): string {
  const actionMap = {
    create: "Création",
    update: "Modification",
    delete: "Suppression",
    status_change: "Changement de statut",
    password_reset_initiated: "Réinitialisation de mot de passe initiée",
    password_reset_completed: "Réinitialisation de mot de passe terminée",
  };

  const entityMap = {
    user: "d'un utilisateur",
    employee: "d'un employé",
    detainee: "d'un détenu",
    incident: "d'un incident",
    report: "d'un rapport",
    statement: "d'une déclaration",
    seizure: "d'une saisie",
    victim: "d'une victime",
  };

  return `${actionMap[action]} ${entityMap[entityType]}`;
}

/**
 * Utility to capture changes between old and new data
 */
export function captureChanges(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
): Record<string, { old: unknown; new: unknown }> {
  const changes: Record<string, { old: unknown; new: unknown }> = {};

  // Check for changes in existing fields
  Object.keys(newData).forEach((key) => {
    if (oldData[key] !== newData[key]) {
      changes[key] = {
        old: oldData[key],
        new: newData[key],
      };
    }
  });

  return changes;
}
