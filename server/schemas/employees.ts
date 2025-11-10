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
  firstName: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, "Le prénom doit contenir au moins 2 caractères")
        .max(20, "Le prénom ne peut pas dépasser 20 caractères")
    ),
  lastName: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(20, "Le nom ne peut pas dépasser 20 caractères")
    ),
  sex: z.enum(["M", "F"], {
    message: "Veuillez sélectionner le sexe",
  }),
  placeOfBirth: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, "Le lieu de naissance est requis")
        .max(20, "Le lieu de naissance ne peut pas dépasser 20 caractères")
    ),
  dateOfBirth: z.coerce
    .date({
      message: "La date de naissance est requise",
    })
    .max(
      new Date("2005-12-31"),
      "La date de naissance ne peut pas être après 2005"
    )
    .min(
      new Date("1940-01-01"),
      "La date de naissance ne peut pas être avant 1940"
    ),
  education: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, "La formation est requise")
        .max(30, "La formation ne peut pas dépasser 30 caractères")
    ),
  maritalStatus: z.enum(["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf(ve)"], {
    message: "Veuillez sélectionner l'état civil",
  }),
  function: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, "La fonction est requise")
        .max(25, "La fonction ne peut pas dépasser 25 caractères")
    ),
  deploymentLocation: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, "Le lieu de déploiement est requis")
        .max(30, "Le lieu de déploiement ne peut pas dépasser 30 caractères")
    ),
  residence: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, "La résidence est requise")
        .max(25, "La résidence ne peut pas dépasser 25 caractères")
    ),
  phone: z
    .string()
    .regex(
      /^\+243[0-9]{8,10}$/,
      "Format invalide. Le numéro doit être au format +243XXXXXXXX (8-10 chiffres)"
    ),
  email: z
    .string()
    .transform((val) => val.toLowerCase().trim())
    .refine(
      (val) => val === "" || z.string().email().safeParse(val).success,
      "Veuillez entrer une adresse email valide"
    )
    .refine(
      (val) => val.length <= 30,
      "L'adresse email ne peut pas dépasser 30 caractères"
    )
    .optional()
    .or(z.literal("")),
  photoUrl: z.string().optional(),
});

// Input schema for updating an employee
export const updateEmployeeSchema = z.object({
  id: z.uuid(),
  firstName: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().min(2).max(20))
    .optional(),
  lastName: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().min(2).max(20))
    .optional(),
  sex: z.enum(["M", "F"]).optional(),
  placeOfBirth: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().min(2).max(20))
    .optional(),
  dateOfBirth: z.coerce
    .date()
    .max(
      new Date("2005-12-31"),
      "La date de naissance ne peut pas être après 2005"
    )
    .min(
      new Date("1940-01-01"),
      "La date de naissance ne peut pas être avant 1940"
    )
    .optional(),
  education: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().min(2).max(30))
    .optional(),
  maritalStatus: z
    .enum(["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf(ve)"])
    .optional(),
  function: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().min(2).max(25))
    .optional(),
  deploymentLocation: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().min(2).max(30))
    .optional(),
  residence: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().min(2).max(25))
    .optional(),
  phone: z
    .string()
    .regex(
      /^\+243[0-9]{8,10}$/,
      "Format invalide. Le numéro doit être au format +243XXXXXXXX (8-10 chiffres)"
    )
    .optional(),
  email: z
    .string()
    .transform((val) => val.toLowerCase().trim())
    .refine(
      (val) => val === "" || z.string().email().safeParse(val).success,
      "Veuillez entrer une adresse email valide"
    )
    .refine(
      (val) => val.length <= 30,
      "L'adresse email ne peut pas dépasser 30 caractères"
    )
    .optional(),
  photoUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Type exports for use in components
export type GetAllEmployeesInput = z.infer<typeof getAllEmployeesSchema>;
export type GetEmployeeByIdInput = z.infer<typeof getEmployeeByIdSchema>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
