import { z } from "zod";

// Query schema for fetching audit logs
export const auditLogQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "action", "entityType", "userId"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  action: z.enum(["create", "update", "delete", "status_change"]).optional(),
  entityType: z
    .enum([
      "employee",
      "detainee",
      "report",
      "statement",
      "incident",
      "seizure",
      "user",
    ])
    .optional(),
  userId: z.string().uuid().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

// Schema for getting a single audit log by ID
export const auditLogByIdSchema = z.object({
  id: z.number().int().positive(),
});

export type AuditLogQueryInput = z.infer<typeof auditLogQuerySchema>;
export type AuditLogByIdInput = z.infer<typeof auditLogByIdSchema>;
