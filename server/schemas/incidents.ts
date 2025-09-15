import { z } from "zod";

export const incidentSchema = z.object({
  incidentDate: z.string().min(1, "Date d'incident est requise"),
  location: z.string().min(1, "Lieu est requis"),
  eventType: z.string().min(1, "Type d'événement est requis"),
  numberOfVictims: z.number().int().min(0).optional().default(0),
  victims: z
    .array(
      z.object({
        name: z.string().min(1, "Nom de la victime est requis"),
        sex: z.enum(["Male", "Female"], {
          message: "Sexe est requis",
        }),
        causeOfDeath: z.string().optional(),
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
