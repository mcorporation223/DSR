import { z } from "zod";

// Base report schema for validation
export const reportInputSchema = z.object({
  title: z.string().min(1, "Le titre du rapport est requis"),
  content: z.string().optional(),
  location: z.string().optional(),
  reportDate: z.string(), // Will be converted to Date in the router
});

export const reportUpdateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Le titre du rapport est requis").optional(),
  content: z.string().optional(),
  location: z.string().optional(),
  reportDate: z.string().optional(), // Will be converted to Date in the router
});

export const reportQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  searchDate: z.string().optional(), // For specific date search (YYYY-MM-DD format)
  sortBy: z
    .enum(["reportDate", "title", "createdAt", "updatedAt"])
    .default("reportDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const reportByIdSchema = z.object({
  id: z.string().uuid(),
});

export const reportDeleteSchema = z.object({
  id: z.string().uuid(),
});

export type ReportInput = z.infer<typeof reportInputSchema>;
export type ReportUpdate = z.infer<typeof reportUpdateSchema>;
export type ReportQuery = z.infer<typeof reportQuerySchema>;
export type ReportById = z.infer<typeof reportByIdSchema>;
export type ReportDelete = z.infer<typeof reportDeleteSchema>;
