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
    .max(new Date(), "La date de naissance ne peut pas être dans le futur")
    .min(
      new Date("1940-01-01"),
      "La date de naissance ne peut pas être avant 1940"
    ),
  photoUrl: z.string().optional(),
  parentNames: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .max(100, "Les noms des parents ne peuvent pas dépasser 100 caractères")
    )
    .optional(),
  originNeighborhood: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .max(25, "Le quartier d'origine ne peut pas dépasser 25 caractères")
    )
    .optional(),
  education: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().max(30, "L'éducation ne peut pas dépasser 30 caractères"))
    .optional(),
  employment: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z.string().max(25, "La profession ne peut pas dépasser 25 caractères")
    )
    .optional(),
  maritalStatus: z
    .enum(["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf(ve)"])
    .optional(),
  numberOfChildren: z.number().min(0).max(20).optional(),
  spouseName: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .max(100, "Le nom du conjoint ne peut pas dépasser 100 caractères")
    )
    .optional(),
  religion: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().max(25, "La religion ne peut pas dépasser 25 caractères"))
    .optional(),
  residence: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, "La résidence est requise")
        .max(25, "La résidence ne peut pas dépasser 25 caractères")
    ),
  phoneNumber: z
    .string()
    .regex(
      /^\+[1-9]\d{1,3}[0-9]{6,12}$/,
      "Format invalide. Le numéro doit être au format international (+XXX suivi de 6-12 chiffres)"
    )
    .optional()
    .or(z.literal("")),
  crimeReason: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, "Le motif du crime est requis")
        .max(200, "Le motif du crime ne peut pas dépasser 200 caractères")
    ),
  arrestDate: z.coerce.date({
    message: "La date d'arrestation est requise",
  }),
  arrestLocation: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(2, "Le lieu d'arrestation est requis")
        .max(100, "Le lieu d'arrestation ne peut pas dépasser 100 caractères")
    ),
  arrestedBy: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .max(100, "Le nom de l'agent ne peut pas dépasser 100 caractères")
    )
    .optional(),
  arrivalDate: z.coerce.date().optional(),
  location: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z.string().max(50, "L'emplacement ne peut pas dépasser 50 caractères")
    )
    .optional(),
});

// Input schema for updating a detainee
export const updateDetaineeSchema = z.object({
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
    .max(new Date())
    .min(new Date("1940-01-01"))
    .optional(),
  photoUrl: z.string().optional(),
  parentNames: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().max(100))
    .optional(),
  originNeighborhood: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().max(25))
    .optional(),
  education: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().max(30))
    .optional(),
  employment: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().max(25))
    .optional(),
  maritalStatus: z
    .enum(["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf(ve)"])
    .optional(),
  numberOfChildren: z.number().min(0).max(20).optional(),
  spouseName: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().max(100))
    .optional(),
  religion: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().max(25))
    .optional(),
  residence: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().min(2).max(25))
    .optional(),
  phoneNumber: z
    .string()
    .regex(
      /^\+[1-9]\d{1,3}[0-9]{6,12}$/,
      "Format invalide. Le numéro doit être au format international (+XXX suivi de 6-12 chiffres)"
    )
    .optional()
    .or(z.literal("")),
  crimeReason: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().min(2).max(200))
    .optional(),
  arrestDate: z.coerce.date().optional(),
  arrestLocation: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().min(2).max(100))
    .optional(),
  arrestedBy: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().max(100))
    .optional(),
  arrivalDate: z.coerce.date().optional(),
  location: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().max(50))
    .optional(),
  status: z.string().optional(),
  releaseDate: z.coerce.date().optional(),
  releaseReason: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().max(200))
    .optional(),
  transferDestination: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().max(255))
    .optional(),
});

// Type exports for use in components
export type GetAllDetaineesInput = z.infer<typeof getAllDetaineesSchema>;
export type GetDetaineeByIdInput = z.infer<typeof getDetaineeByIdSchema>;
export type CreateDetaineeInput = z.infer<typeof createDetaineeSchema>;
export type UpdateDetaineeInput = z.infer<typeof updateDetaineeSchema>;
