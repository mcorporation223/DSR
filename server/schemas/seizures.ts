import { z } from "zod";

export const seizureInputSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  type: z.enum(["vehicule", "objet"], {
    message: "Type must be either 'vehicule' or 'objet'",
  }),
  details: z.string().optional(),
  seizureLocation: z.string().optional(),
  ownerName: z.string().optional(),
  ownerResidence: z.string().optional(),
  seizureDate: z.string().datetime(),
  photoUrl: z.string().optional(),
});

export const seizureUpdateSchema = seizureInputSchema.partial().extend({
  id: z.string().uuid(),
  status: z.string().optional(),
  releaseDate: z.string().datetime().optional().nullable(),
});

export const seizureQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z
    .enum([
      "seizureDate",
      "itemName",
      "type",
      "status",
      "createdAt",
      "updatedAt",
      "ownerName",
      "seizureLocation",
    ])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  type: z.enum(["vehicule", "objet"]).optional(),
  status: z.string().optional(),
});

export const seizureByIdSchema = z.object({
  id: z.string().uuid(),
});

export const seizureDeleteSchema = z.object({
  id: z.string().uuid(),
});
