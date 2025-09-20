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

// Input schema for creating a new user (without password - uses setup token)
export const createUserSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Veuillez entrer une adresse email valide"),
  role: z
    .enum(["admin", "user"], {
      message: "Veuillez sélectionner un rôle valide",
    })
    .default("user"),
});

// Input schema for creating the first admin user (with password)
export const createFirstAdminSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Veuillez entrer une adresse email valide"),
  password: z.string().min(1, "Le mot de passe est requis"),
  role: z
    .enum(["admin", "user"], {
      message: "Veuillez sélectionner un rôle valide",
    })
    .default("admin"),
});

// Input schema for password setup
export const setupPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Input schema for validating setup token
export const validateSetupTokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
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

// Input schema for initiating password reset (admin action)
export const initiatePasswordResetSchema = z.object({
  userId: z.uuid(),
});

// Input schema for password reset
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Input schema for validating reset token
export const validateResetTokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// Type exports for use in components
export type GetAllUsersInput = z.infer<typeof getAllUsersSchema>;
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateFirstAdminInput = z.infer<typeof createFirstAdminSchema>;
export type SetupPasswordInput = z.infer<typeof setupPasswordSchema>;
export type ValidateSetupTokenInput = z.infer<typeof validateSetupTokenSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserPasswordInput = z.infer<typeof updateUserPasswordSchema>;
export type InitiatePasswordResetInput = z.infer<
  typeof initiatePasswordResetSchema
>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ValidateResetTokenInput = z.infer<typeof validateResetTokenSchema>;
