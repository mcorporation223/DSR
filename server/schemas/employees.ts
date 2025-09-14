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

// Input schema for creating a new employee
export const createEmployeeSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  sex: z.enum(["Male", "Female"], {
    message: "Veuillez sélectionner le sexe",
  }),
  placeOfBirth: z.string().min(2, "Le lieu de naissance est requis"),
  dateOfBirth: z.coerce.date({
    message: "La date de naissance est requise",
  }),
  education: z.string().min(2, "La formation est requise"),
  maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed"], {
    message: "Veuillez sélectionner l'état civil",
  }),
  function: z.string().min(2, "La fonction est requise"),
  deploymentLocation: z.string().min(2, "Le lieu de déploiement est requis"),
  residence: z.string().min(2, "La résidence est requise"),
  phone: z
    .string()
    .min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres"),
  email: z.string().email("Veuillez entrer une adresse email valide"),
  photoUrl: z.string().optional(),
});

// Input schema for updating an employee
export const updateEmployeeSchema = z.object({
  id: z.uuid(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  sex: z.enum(["Male", "Female"]).optional(),
  placeOfBirth: z.string().min(2).optional(),
  dateOfBirth: z.coerce.date().optional(),
  education: z.string().min(2).optional(),
  maritalStatus: z
    .enum(["Single", "Married", "Divorced", "Widowed"])
    .optional(),
  function: z.string().min(2).optional(),
  deploymentLocation: z.string().min(2).optional(),
  residence: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional(),
  photoUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Type exports for use in components
export type GetAllEmployeesInput = z.infer<typeof getAllEmployeesSchema>;
export type GetEmployeeByIdInput = z.infer<typeof getEmployeeByIdSchema>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
