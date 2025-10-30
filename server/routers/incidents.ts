import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { db } from "@/lib/db";
import { incidents, victims, users, auditLogs } from "@/lib/db/schema";
import {
  and,
  count,
  desc,
  asc,
  eq,
  or,
  ilike,
  sql,
  inArray,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { logIncidentAction, captureChanges } from "@/lib/audit-logger";

const incidentInputSchema = z.object({
  incidentDate: z.string().datetime(),
  location: z.string().min(1, "Location is required"),
  eventType: z.string().min(1, "Event type is required"),
  numberOfVictims: z.number().int().min(0).optional().default(0),
  victims: z
    .array(
      z.object({
        name: z.string().min(1, "Victim name is required"),
        sex: z.enum(["Male", "Female"]),
        causeOfDeath: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

const incidentUpdateSchema = incidentInputSchema.partial().extend({
  id: z.string().uuid(),
});

export const incidentsRouter = router({
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        sortBy: z
          .enum(["incidentDate", "location", "eventType", "createdAt"])
          .default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        eventType: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, limit, search, sortBy, sortOrder, eventType } = input;
      const offset = (page - 1) * limit;

      const whereConditions: SQL[] = [];

      // Search functionality
      if (search) {
        whereConditions.push(
          or(
            ilike(incidents.location, `%${search}%`),
            ilike(incidents.eventType, `%${search}%`)
          )!
        );
      }

      // Filter by event type
      if (eventType) {
        whereConditions.push(eq(incidents.eventType, eventType));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Get total count
      const totalResult = await db
        .select({ count: count() })
        .from(incidents)
        .where(whereClause);

      const totalItems = totalResult[0]?.count || 0;

      // Get incidents with sorting
      const orderBy =
        sortOrder === "asc" ? asc(incidents[sortBy]) : desc(incidents[sortBy]);

      // Create aliases for users table to join twice
      const createdByUser = alias(users, "createdByUser");
      const updatedByUser = alias(users, "updatedByUser");

      const incidentsResult = await db
        .select({
          id: incidents.id,
          incidentDate: incidents.incidentDate,
          location: incidents.location,
          eventType: incidents.eventType,
          numberOfVictims: incidents.numberOfVictims,
          createdBy: incidents.createdBy,
          updatedBy: incidents.updatedBy,
          createdAt: incidents.createdAt,
          updatedAt: incidents.updatedAt,
          // Join with users table to get names
          createdByName: sql<string>`CONCAT(${createdByUser.firstName}, ' ', ${createdByUser.lastName})`,
          updatedByName: sql<string>`CONCAT(${updatedByUser.firstName}, ' ', ${updatedByUser.lastName})`,
        })
        .from(incidents)
        .leftJoin(createdByUser, eq(incidents.createdBy, createdByUser.id))
        .leftJoin(updatedByUser, eq(incidents.updatedBy, updatedByUser.id))
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      if (incidentsResult.length === 0) {
        return {
          incidents: [],
          pagination: {
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
          },
        };
      }

      // Get victims for the fetched incidents
      const incidentIds = incidentsResult.map((incident) => incident.id);

      const allVictims = await db
        .select({
          id: victims.id,
          name: victims.name,
          sex: victims.sex,
          causeOfDeath: victims.causeOfDeath,
          incidentId: victims.incidentId,
        })
        .from(victims)
        .where(inArray(victims.incidentId, incidentIds));

      const victimsMap = allVictims.reduce((acc, victim) => {
        if (!acc[victim.incidentId]) {
          acc[victim.incidentId] = [];
        }
        acc[victim.incidentId].push(victim);
        return acc;
      }, {} as Record<string, typeof allVictims>);

      const incidentsWithVictims = incidentsResult.map((incident) => ({
        ...incident,
        victims: victimsMap[incident.id] || [],
      }));

      return {
        incidents: incidentsWithVictims,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const incident = await db
        .select()
        .from(incidents)
        .where(eq(incidents.id, input.id))
        .limit(1);

      if (!incident[0]) {
        throw new Error("Incident not found");
      }

      // Get victims for this incident
      const incidentVictims = await db
        .select()
        .from(victims)
        .where(eq(victims.incidentId, input.id));

      return {
        ...incident[0],
        victims: incidentVictims,
      };
    }),

  create: protectedProcedure
    .input(incidentInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { victims: inputVictims, ...incidentData } = input;

      // Create the incident
      const newIncident = await db
        .insert(incidents)
        .values({
          ...incidentData,
          incidentDate: new Date(incidentData.incidentDate),
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id,
        })
        .returning();

      // Create victims if any
      if (inputVictims && inputVictims.length > 0) {
        await db.insert(victims).values(
          inputVictims.map((victim) => ({
            ...victim,
            incidentId: newIncident[0].id,
            createdBy: ctx.user.id,
            updatedBy: ctx.user.id,
          }))
        );
      }

      // Log the incident creation
      await logIncidentAction(ctx.user, "create", newIncident[0].id, {
        description: `Nouvel incident enregistré: ${incidentData.eventType} à ${incidentData.location}`,
        eventType: incidentData.eventType,
        location: incidentData.location,
        numberOfVictims: incidentData.numberOfVictims,
        victimNames: inputVictims?.map((v) => v.name) || [],
      });

      return newIncident[0];
    }),

  update: protectedProcedure
    .input(incidentUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, victims: inputVictims, ...incidentData } = input;

      // Get current incident for change tracking
      const currentIncident = await db
        .select()
        .from(incidents)
        .where(eq(incidents.id, id))
        .limit(1);

      if (!currentIncident || currentIncident.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Incident non trouvé",
        });
      }

      // Prepare update data with proper date conversion
      const updateData: Record<string, unknown> = {
        ...incidentData,
        updatedBy: ctx.user.id,
        updatedAt: new Date(),
      };

      // Convert incidentDate if provided
      if (incidentData.incidentDate) {
        updateData.incidentDate = new Date(incidentData.incidentDate);
      }

      // Update the incident
      const updatedIncident = await db
        .update(incidents)
        .set(updateData)
        .where(eq(incidents.id, id))
        .returning();

      // Update victims if provided
      if (inputVictims !== undefined) {
        // Delete existing victims
        await db.delete(victims).where(eq(victims.incidentId, id));

        // Insert new victims
        if (inputVictims.length > 0) {
          await db.insert(victims).values(
            inputVictims.map((victim) => ({
              ...victim,
              incidentId: id,
              createdBy: ctx.user.id,
              updatedBy: ctx.user.id,
            }))
          );
        }
      }

      // ✅ ADD: Capture changes and log
      const changes = captureChanges(currentIncident[0], updateData);
      await logIncidentAction(ctx.user, "update", id, {
        description: `Modification de l'incident: ${updatedIncident[0].eventType} à ${updatedIncident[0].location}`,
        changed: changes,
        victimsUpdated: inputVictims !== undefined,
      });

      return updatedIncident[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      // Get incident data before deletion for logging (outside transaction)
      const incidentToDelete = await db
        .select()
        .from(incidents)
        .where(eq(incidents.id, input.id))
        .limit(1);

      if (!incidentToDelete || incidentToDelete.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Incident non trouvé",
        });
      }

      const result = await db.transaction(async (tx) => {
        const deletedIncident = await tx
          .delete(incidents)
          .where(eq(incidents.id, input.id))
          .returning();

        if (!deletedIncident || deletedIncident.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Incident non trouvé",
          });
        }

        await tx.insert(auditLogs).values({
          userId: ctx.user.id,
          action: "delete",
          entityType: "incident",
          entityId: input.id,
          details: {
            description: `Suppression de l'incident: ${incidentToDelete[0].eventType} à ${incidentToDelete[0].location}`,
            eventType: incidentToDelete[0].eventType,
            location: incidentToDelete[0].location,
            numberOfVictims: incidentToDelete[0].numberOfVictims,
            incidentDate: incidentToDelete[0].incidentDate,
          },
        });

        return deletedIncident[0];
      });

      return { success: true };
    }),

  getStats: protectedProcedure.query(async () => {
    const totalIncidents = await db.select({ count: count() }).from(incidents);

    const incidentsByType = await db
      .select({
        eventType: incidents.eventType,
        count: count(),
      })
      .from(incidents)
      .groupBy(incidents.eventType);

    const totalVictims = await db.select({ count: count() }).from(victims);

    return {
      totalIncidents: totalIncidents[0]?.count || 0,
      incidentsByType,
      totalVictims: totalVictims[0]?.count || 0,
    };
  }),
});
