import { z } from "zod";

// Base statement schema for validation
export const statementInputSchema = z.object({
  fileUrl: z.string().min(1, "L'URL du fichier est requise"),
  detaineeId: z.string().uuid("ID détenu invalide"),
});

export const statementUpdateSchema = z.object({
  id: z.string().uuid(),
  fileUrl: z.string().min(1, "L'URL du fichier est requise").optional(),
  detaineeId: z.string().uuid("ID détenu invalide").optional(),
});

export const statementQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "fileUrl"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const statementByIdSchema = z.object({
  id: z.string().uuid(),
});

export const statementDeleteSchema = z.object({
  id: z.string().uuid(),
});

export type StatementInput = z.infer<typeof statementInputSchema>;
export type StatementUpdate = z.infer<typeof statementUpdateSchema>;
export type StatementQuery = z.infer<typeof statementQuerySchema>;
export type StatementById = z.infer<typeof statementByIdSchema>;
export type StatementDelete = z.infer<typeof statementDeleteSchema>;
