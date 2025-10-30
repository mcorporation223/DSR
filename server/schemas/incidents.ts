import { z } from "zod";

export const incidentSchema = z.object({
  incidentDate: z.string().min(1, "Date d'incident est requise"),
  location: z
    .string()
    .min(1, "Lieu est requis")
    .max(20, "Le lieu ne peut pas dépasser 20 caractères"),
  eventType: z.string().min(1, "Type d'événement est requis"),
  numberOfVictims: z.number().int().min(0).optional().default(0),
  victims: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, "Nom de la victime est requis")
          .max(30, "Le nom de la victime ne peut pas dépasser 30 caractères"),
        sex: z.enum(["Male", "Female"], {
          message: "Sexe est requis",
        }),
        causeOfDeath: z
          .string()
          .max(100, "La cause du décès ne peut pas dépasser 100 caractères")
          .optional(),
      })
    )
    .optional()
    .default([]),
});

export const incidentUpdateSchema = incidentSchema.extend({
  id: z.string().uuid(),
});

export type IncidentFormData = z.infer<typeof incidentSchema>;
export type IncidentUpdateData = z.infer<typeof incidentUpdateSchema>;
