import { z } from "zod";

// Input schema for getting all users with filters and pagination
export const getAllUsersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z
    .enum(["firstName", "lastName", "email", "createdAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Input schema for getting user by ID
export const getUserByIdSchema = z.object({
  id: z.uuid(),
});

// Input schema for creating a new user
export const createUserSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Veuillez entrer une adresse email valide"),
  password: z.string().min(1, "Le mot de passe est requis"),
  role: z
    .enum(["admin", "user"], {
      message: "Veuillez sélectionner un rôle valide",
    })
    .default("user"),
});

// Input schema for updating a user
export const updateUserSchema = z.object({
  id: z.uuid(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "user"]).optional(),
  isActive: z.boolean().optional(),
});

// Input schema for updating user password
export const updateUserPasswordSchema = z.object({
  id: z.uuid(),
  currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
  newPassword: z
    .string()
    .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
});

// Type exports for use in components
export type GetAllUsersInput = z.infer<typeof getAllUsersSchema>;
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserPasswordInput = z.infer<typeof updateUserPasswordSchema>;
