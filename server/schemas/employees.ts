import { z } from "zod";

// Input schema for getting all employees with filters and pagination
export const getAllEmployeesSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z
    .enum(["firstName", "lastName", "email", "createdAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  isActive: z.boolean().optional(),
});

// Input schema for getting employee by ID
export const getEmployeeByIdSchema = z.object({
  id: z.uuid(),
});


// Type exports for use in components
export type GetAllEmployeesInput = z.infer<typeof getAllEmployeesSchema>;
export type GetEmployeeByIdInput = z.infer<typeof getEmployeeByIdSchema>;
