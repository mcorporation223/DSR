import { z } from "zod";

// Input schema for getting all detainees with filters and pagination
export const getAllDetaineesSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z
    .enum(["firstName", "lastName", "arrestDate", "createdAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  status: z.string().optional(), // Filter by custody status (in_custody, released, transferred)
});

// Input schema for getting detainee by ID
export const getDetaineeByIdSchema = z.object({
  id: z.uuid(),
});

// Input schema for creating a new detainee
export const createDetaineeSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  sex: z.enum(["Male", "Female"], {
    message: "Veuillez sélectionner le sexe",
  }),
  placeOfBirth: z.string().min(2, "Le lieu de naissance est requis"),
  dateOfBirth: z.coerce.date({
    message: "La date de naissance est requise",
  }),
  parentNames: z.string().optional(),
  originNeighborhood: z.string().optional(),
  education: z.string().optional(),
  employment: z.string().optional(),
  maritalStatus: z
    .enum(["Single", "Married", "Divorced", "Widowed"])
    .optional(),
  maritalDetails: z.string().optional(),
  religion: z.string().optional(),
  residence: z.string().min(2, "La résidence est requise"),
  phoneNumber: z.string().optional(),
  crimeReason: z.string().min(2, "Le motif du crime est requis"),
  arrestDate: z.coerce.date({
    message: "La date d'arrestation est requise",
  }),
  arrestLocation: z.string().min(2, "Le lieu d'arrestation est requis"),
  arrestedBy: z.string().optional(),
  arrestTime: z.string().optional(), // Changed from z.coerce.date() to z.string() for HH:mm format
  arrivalDate: z.coerce.date().optional(), // Added missing arrivalDate field
  arrivalTime: z.string().optional(), // Changed from z.coerce.date() to z.string() for HH:mm format
  cellNumber: z.string().optional(),
  location: z.string().optional(),
});

// Input schema for updating a detainee
export const updateDetaineeSchema = z.object({
  id: z.uuid(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  sex: z.enum(["Male", "Female"]).optional(),
  placeOfBirth: z.string().min(2).optional(),
  dateOfBirth: z.coerce.date().optional(),
  parentNames: z.string().optional(),
  originNeighborhood: z.string().optional(),
  education: z.string().optional(),
  employment: z.string().optional(),
  maritalStatus: z
    .enum(["Single", "Married", "Divorced", "Widowed"])
    .optional(),
  maritalDetails: z.string().optional(),
  religion: z.string().optional(),
  residence: z.string().min(2).optional(),
  phoneNumber: z.string().optional(),
  crimeReason: z.string().min(2).optional(),
  arrestDate: z.coerce.date().optional(),
  arrestLocation: z.string().min(2).optional(),
  arrestedBy: z.string().optional(),
  arrestTime: z.string().optional(), // Changed from z.coerce.date() to z.string() for HH:mm format
  arrivalDate: z.coerce.date().optional(), // Added missing arrivalDate field
  arrivalTime: z.string().optional(), // Changed from z.coerce.date() to z.string() for HH:mm format
  cellNumber: z.string().optional(),
  location: z.string().optional(),
  status: z.string().optional(),
  releaseDate: z.coerce.date().optional(),
  releaseReason: z.string().optional(),
});

// Type exports for use in components
export type GetAllDetaineesInput = z.infer<typeof getAllDetaineesSchema>;
export type GetDetaineeByIdInput = z.infer<typeof getDetaineeByIdSchema>;
export type CreateDetaineeInput = z.infer<typeof createDetaineeSchema>;
export type UpdateDetaineeInput = z.infer<typeof updateDetaineeSchema>;
