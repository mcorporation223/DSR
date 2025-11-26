import { router, protectedProcedure, publicProcedure } from "../trpc";
import { db } from "@/lib/db";
import { seizures, users, auditLogs } from "@/lib/db/schema";
import { and, count, desc, asc, eq, or, ilike, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  seizureInputSchema,
  seizureUpdateSchema,
  seizureQuerySchema,
  seizureByIdSchema,
  seizureDeleteSchema,
} from "../schemas/seizures";
import { logSeizureAction, captureChanges } from "@/lib/audit-logger";

// Create aliases for the users table to handle both createdBy and updatedBy
const createdByUser = alias(users, "createdByUser");
const updatedByUser = alias(users, "updatedByUser");

export const seizuresRouter = router({
  getAll: protectedProcedure
    .input(seizureQuerySchema)
    .query(async ({ input }) => {
      const { page, limit, search, sortBy, sortOrder, type, status } = input;
      const offset = (page - 1) * limit;

      const whereConditions: SQL[] = [];

      // Search functionality
      if (search) {
        whereConditions.push(
          or(
            ilike(seizures.itemName, `%${search}%`),
            ilike(seizures.type, `%${search}%`),
            ilike(seizures.ownerName, `%${search}%`),
            ilike(seizures.seizureLocation, `%${search}%`)
          )!
        );
      }

      // Filter by type
      if (type) {
        whereConditions.push(eq(seizures.type, type));
      }

      // Filter by status
      if (status) {
        whereConditions.push(eq(seizures.status, status));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Get total count
      const totalResult = await db
        .select({ count: count() })
        .from(seizures)
        .where(whereClause);

      const totalItems = totalResult[0]?.count || 0;

      // Get seizures with sorting and user names
      // Note: sortBy is validated by seizureQuerySchema enum, ensuring type safety
      const orderBy =
        sortOrder === "asc" ? asc(seizures[sortBy]) : desc(seizures[sortBy]);

      const seizuresResult = await db
        .select({
          id: seizures.id,
          itemName: seizures.itemName,
          type: seizures.type,
          details: seizures.seizureDetails,
          seizureLocation: seizures.seizureLocation,
          ownerName: seizures.ownerName,
          ownerResidence: seizures.ownerResidence,
          seizureDate: seizures.seizureDate,
          photoUrl: seizures.photoUrl,
          status: seizures.status,
          releaseDate: seizures.releaseDate,
          createdBy: seizures.createdBy,
          updatedBy: seizures.updatedBy,
          createdAt: seizures.createdAt,
          updatedAt: seizures.updatedAt,
          // User names
          createdByName: sql<string>`CONCAT(${createdByUser.firstName}, ' ', ${createdByUser.lastName})`,
          updatedByName: sql<string>`CONCAT(${updatedByUser.firstName}, ' ', ${updatedByUser.lastName})`,
        })
        .from(seizures)
        .leftJoin(createdByUser, eq(seizures.createdBy, createdByUser.id))
        .leftJoin(updatedByUser, eq(seizures.updatedBy, updatedByUser.id))
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      return {
        seizures: seizuresResult,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
      };
    }),

  getById: protectedProcedure
    .input(seizureByIdSchema)
    .query(async ({ input }) => {
      const seizure = await db
        .select({
          id: seizures.id,
          itemName: seizures.itemName,
          type: seizures.type,
          details: seizures.seizureDetails,
          seizureLocation: seizures.seizureLocation,
          ownerName: seizures.ownerName,
          ownerResidence: seizures.ownerResidence,
          seizureDate: seizures.seizureDate,
          photoUrl: seizures.photoUrl,
          status: seizures.status,
          releaseDate: seizures.releaseDate,
          createdBy: seizures.createdBy,
          updatedBy: seizures.updatedBy,
          createdAt: seizures.createdAt,
          updatedAt: seizures.updatedAt,
          // User names
          createdByName: sql<string>`CONCAT(${createdByUser.firstName}, ' ', ${createdByUser.lastName})`,
          updatedByName: sql<string>`CONCAT(${updatedByUser.firstName}, ' ', ${updatedByUser.lastName})`,
        })
        .from(seizures)
        .leftJoin(createdByUser, eq(seizures.createdBy, createdByUser.id))
        .leftJoin(updatedByUser, eq(seizures.updatedBy, updatedByUser.id))
        .where(eq(seizures.id, input.id))
        .limit(1);

      if (!seizure[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Saisie non trouvée",
        });
      }

      return seizure[0];
    }),

  create: protectedProcedure
    .input(seizureInputSchema)
    .mutation(async ({ input, ctx }) => {
      const seizureData = {
        itemName: input.itemName,
        type: input.type,
        seizureDetails: input.details, // Map details to seizureDetails column
        seizureLocation: input.seizureLocation,
        ownerName: input.ownerName,
        ownerResidence: input.ownerResidence,
        photoUrl: input.photoUrl,
        seizureDate: new Date(input.seizureDate),
        status: "in_custody", // Automatically set status to in_custody
        releaseDate: null, // Always null when creating new seizure
        createdBy: ctx.user.id,
        updatedBy: ctx.user.id,
      };

      const newSeizure = await db
        .insert(seizures)
        .values(seizureData)
        .returning();

      await logSeizureAction(ctx.user, "create", newSeizure[0].id, {
        description: `Nouvelle saisie enregistrée: ${input.itemName}`,
        itemName: input.itemName,
        type: input.type,
        details: input.details,
        seizureLocation: input.seizureLocation,
        ownerName: input.ownerName,
      });

      return newSeizure[0];
    }),

  update: protectedProcedure
    .input(seizureUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...seizureData } = input;

      // Get current seizure data for change tracking
      const currentSeizure = await db
        .select()
        .from(seizures)
        .where(eq(seizures.id, id))
        .limit(1);

      if (!currentSeizure || currentSeizure.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Saisie non trouvée",
        });
      }

      // Prepare update data with proper date conversion and field mapping
      const updateData: Record<string, unknown> = {
        itemName: seizureData.itemName,
        type: seizureData.type,
        seizureDetails: seizureData.details, // Map details to seizureDetails column
        seizureLocation: seizureData.seizureLocation,
        ownerName: seizureData.ownerName,
        ownerResidence: seizureData.ownerResidence,
        photoUrl: seizureData.photoUrl,
        status: seizureData.status,
        updatedBy: ctx.user.id,
        updatedAt: new Date(),
      };

      // Convert dates if provided
      if (seizureData.seizureDate) {
        updateData.seizureDate = new Date(seizureData.seizureDate);
      }
      if (seizureData.releaseDate) {
        updateData.releaseDate = new Date(seizureData.releaseDate);
      }

      const updatedSeizure = await db
        .update(seizures)
        .set(updateData)
        .where(eq(seizures.id, id))
        .returning();

      // Capture and log changes (detect status changes)
      const changes = captureChanges(currentSeizure[0], updateData);
      const isStatusChange = changes.status !== undefined;

      await logSeizureAction(
        ctx.user,
        isStatusChange ? "status_change" : "update",
        id,
        {
          description: isStatusChange
            ? `Changement de statut de la saisie: ${updatedSeizure[0].itemName} (${changes.status.old} → ${changes.status.new})`
            : `Modification de la saisie: ${updatedSeizure[0].itemName}`,
          changed: changes,
        }
      );

      return updatedSeizure[0];
    }),

  delete: protectedProcedure
    .input(seizureDeleteSchema)
    .mutation(async ({ input, ctx }) => {
      // Get seizure data before deletion for logging (outside transaction)
      const seizureToDelete = await db
        .select()
        .from(seizures)
        .where(eq(seizures.id, input.id))
        .limit(1);

      if (!seizureToDelete || seizureToDelete.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Saisie non trouvée",
        });
      }

      // Wrap seizure deletion and audit log in a transaction
      const result = await db.transaction(async (tx) => {
        // 1. Delete the seizure
        const deletedSeizure = await tx
          .delete(seizures)
          .where(eq(seizures.id, input.id))
          .returning();

        if (!deletedSeizure || deletedSeizure.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Saisie non trouvée",
          });
        }

        await tx.insert(auditLogs).values({
          userId: ctx.user.id,
          action: "delete",
          entityType: "seizure",
          entityId: input.id,
          details: {
            description: `Suppression de la saisie: ${seizureToDelete[0].itemName}`,
            itemName: seizureToDelete[0].itemName,
            type: seizureToDelete[0].type,
            details: seizureToDelete[0].seizureDetails,
            seizureLocation: seizureToDelete[0].seizureLocation,
            ownerName: seizureToDelete[0].ownerName,
          },
        });

        return deletedSeizure[0];
      });

      return { success: true };
    }),

  getStats: protectedProcedure.query(async () => {
    const totalSeizures = await db.select({ count: count() }).from(seizures);

    const seizuresByType = await db
      .select({
        type: seizures.type,
        count: count(),
      })
      .from(seizures)
      .groupBy(seizures.type);

    const seizuresByStatus = await db
      .select({
        status: seizures.status,
        count: count(),
      })
      .from(seizures)
      .groupBy(seizures.status);

    return {
      totalSeizures: totalSeizures[0]?.count || 0,
      seizuresByType,
      seizuresByStatus,
    };
  }),
});
