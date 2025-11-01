import { router, publicProcedure, protectedProcedure } from "../trpc";
import { db } from "@/lib/db";
import { detainees, users, auditLogs } from "@/lib/db/schema";
import { desc, asc, and, eq, or, count, sql, ilike } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import {
  getAllDetaineesSchema,
  getDetaineeByIdSchema,
  createDetaineeSchema,
  updateDetaineeSchema,
} from "../schemas/detainees";
import { z } from "zod";
import { captureChanges } from "@/lib/audit-logger";
import { TRPCError } from "@trpc/server";

// Create aliases for the users table to handle both createdBy and updatedBy
const createdByUser = alias(users, "createdByUser");
const updatedByUser = alias(users, "updatedByUser");

export const detaineesRouter = router({
  // Fetch all detainees with optional filters
  getAll: protectedProcedure
    .input(getAllDetaineesSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, sortBy, sortOrder, status } = input;

      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (search) {
        whereConditions.push(
          or(
            ilike(detainees.firstName, `%${search}%`),
            ilike(detainees.lastName, `%${search}%`),
            ilike(detainees.residence, `%${search}%`),
            ilike(detainees.arrestLocation, `%${search}%`)
          )
        );
      }

      if (status) {
        whereConditions.push(eq(detainees.status, status));
      }

      // Build order clause
      const orderBy = (() => {
        switch (sortBy) {
          case "firstName":
            return sortOrder === "desc"
              ? desc(detainees.firstName)
              : asc(detainees.firstName);
          case "lastName":
            return sortOrder === "desc"
              ? desc(detainees.lastName)
              : asc(detainees.lastName);
          case "arrestDate":
            return sortOrder === "desc"
              ? desc(detainees.arrestDate)
              : asc(detainees.arrestDate);
          case "createdAt":
          default:
            return sortOrder === "desc"
              ? desc(detainees.createdAt)
              : asc(detainees.createdAt);
        }
      })();

      // Get total count
      const [totalCount] = await ctx.db
        .select({ count: count() })
        .from(detainees)
        .where(
          whereConditions.length > 0 ? and(...whereConditions) : undefined
        );

      // Get detainees with user names
      const detaineesList = await ctx.db
        .select({
          // All detainee fields
          id: detainees.id,
          firstName: detainees.firstName,
          lastName: detainees.lastName,
          sex: detainees.sex,
          placeOfBirth: detainees.placeOfBirth,
          dateOfBirth: detainees.dateOfBirth,
          parentNames: detainees.parentNames,
          originNeighborhood: detainees.originNeighborhood,
          education: detainees.education,
          employment: detainees.employment,
          maritalStatus: detainees.maritalStatus,
          maritalDetails: detainees.maritalDetails,
          religion: detainees.religion,
          residence: detainees.residence,
          phoneNumber: detainees.phoneNumber,
          crimeReason: detainees.crimeReason,
          arrestDate: detainees.arrestDate,
          arrestLocation: detainees.arrestLocation,
          arrestedBy: detainees.arrestedBy,
          arrestTime: detainees.arrestTime,
          arrivalDate: detainees.arrivalDate,
          arrivalTime: detainees.arrivalTime,
          cellNumber: detainees.cellNumber,
          location: detainees.location,
          status: detainees.status,
          releaseDate: detainees.releaseDate,
          releaseReason: detainees.releaseReason,
          createdBy: detainees.createdBy,
          updatedBy: detainees.updatedBy,
          createdAt: detainees.createdAt,
          updatedAt: detainees.updatedAt,
          // User names
          createdByName: sql<string>`CONCAT(${createdByUser.firstName}, ' ', ${createdByUser.lastName})`,
          updatedByName: sql<string>`CONCAT(${updatedByUser.firstName}, ' ', ${updatedByUser.lastName})`,
        })
        .from(detainees)
        .leftJoin(createdByUser, eq(detainees.createdBy, createdByUser.id))
        .leftJoin(updatedByUser, eq(detainees.updatedBy, updatedByUser.id))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      const totalPages = Math.ceil(totalCount.count / limit);

      return {
        detainees: detaineesList,
        pagination: {
          page,
          limit,
          totalItems: totalCount.count,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    }),

  // Fetch a single detainee by ID with user names
  getById: protectedProcedure
    .input(getDetaineeByIdSchema)
    .query(async ({ ctx, input }) => {
      const detainee = await ctx.db
        .select({
          // All detainee fields
          id: detainees.id,
          firstName: detainees.firstName,
          lastName: detainees.lastName,
          sex: detainees.sex,
          placeOfBirth: detainees.placeOfBirth,
          dateOfBirth: detainees.dateOfBirth,
          parentNames: detainees.parentNames,
          originNeighborhood: detainees.originNeighborhood,
          education: detainees.education,
          employment: detainees.employment,
          maritalStatus: detainees.maritalStatus,
          maritalDetails: detainees.maritalDetails,
          religion: detainees.religion,
          residence: detainees.residence,
          phoneNumber: detainees.phoneNumber,
          crimeReason: detainees.crimeReason,
          arrestDate: detainees.arrestDate,
          arrestLocation: detainees.arrestLocation,
          arrestedBy: detainees.arrestedBy,
          arrestTime: detainees.arrestTime,
          arrivalDate: detainees.arrivalDate,
          arrivalTime: detainees.arrivalTime,
          cellNumber: detainees.cellNumber,
          location: detainees.location,
          status: detainees.status,
          releaseDate: detainees.releaseDate,
          releaseReason: detainees.releaseReason,
          createdBy: detainees.createdBy,
          updatedBy: detainees.updatedBy,
          createdAt: detainees.createdAt,
          updatedAt: detainees.updatedAt,
          // User names
          createdByName: sql<string>`CONCAT(${createdByUser.firstName}, ' ', ${createdByUser.lastName})`,
          updatedByName: sql<string>`CONCAT(${updatedByUser.firstName}, ' ', ${updatedByUser.lastName})`,
        })
        .from(detainees)
        .leftJoin(createdByUser, eq(detainees.createdBy, createdByUser.id))
        .leftJoin(updatedByUser, eq(detainees.updatedBy, updatedByUser.id))
        .where(eq(detainees.id, input.id))
        .limit(1);

      if (!detainee || detainee.length === 0) {
        throw new Error("Detainee not found");
      }

      return detainee[0];
    }),

  // Create a new detainee
  create: protectedProcedure
    .input(createDetaineeSchema)
    .mutation(async ({ ctx, input }) => {
      // Helper function to convert time string (HH:mm) to timestamp
      const timeStringToTimestamp = (
        timeStr: string | undefined
      ): Date | undefined => {
        if (!timeStr) return undefined;
        const today = new Date();
        const [hours, minutes] = timeStr.split(":").map(Number);
        const timestamp = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          hours,
          minutes
        );
        return timestamp;
      };

      // Wrap detainee creation and audit log in a transaction
      const result = await ctx.db.transaction(async (tx) => {
        // 1. Insert detainee
        const newDetainee = await tx
          .insert(detainees)
          .values({
            firstName: input.firstName,
            lastName: input.lastName,
            sex: input.sex,
            placeOfBirth: input.placeOfBirth,
            dateOfBirth: input.dateOfBirth,
            parentNames: input.parentNames,
            originNeighborhood: input.originNeighborhood,
            education: input.education,
            employment: input.employment,
            maritalStatus: input.maritalStatus,
            maritalDetails: input.maritalDetails,
            religion: input.religion,
            residence: input.residence,
            phoneNumber: input.phoneNumber?.replace(/\s/g, ""), // Strip spaces from phone
            crimeReason: input.crimeReason,
            arrestDate: input.arrestDate,
            arrestLocation: input.arrestLocation,
            arrestedBy: input.arrestedBy,
            arrestTime: timeStringToTimestamp(input.arrestTime),
            arrivalDate: input.arrivalDate,
            arrivalTime: timeStringToTimestamp(input.arrivalTime),
            cellNumber: input.cellNumber,
            location: input.location,
            status: "in_custody",
            createdBy: ctx.user.id,
            updatedBy: ctx.user.id,
          })
          .returning();

        // 2. Insert audit log within the same transaction
        await tx.insert(auditLogs).values({
          userId: ctx.user.id,
          action: "create",
          entityType: "detainee",
          entityId: newDetainee[0].id,
          details: {
            description: `Nouveau détenu enregistré: ${input.firstName} ${input.lastName}`,
            crimeReason: input.crimeReason,
            arrestLocation: input.arrestLocation,
            arrestedBy: input.arrestedBy,
          },
        });

        return newDetainee[0];
      });

      return result;
    }),

  // Update a detainee
  update: protectedProcedure
    .input(updateDetaineeSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Check if detainee exists
      const currentDetainee = await ctx.db
        .select()
        .from(detainees)
        .where(eq(detainees.id, id))
        .limit(1);

      if (!currentDetainee || currentDetainee.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Détenu non trouvé",
        });
      }

      // Helper function to convert time string (HH:mm) to timestamp
      const timeStringToTimestamp = (
        timeStr: string | undefined
      ): Date | undefined => {
        if (!timeStr) return undefined;
        const today = new Date();
        const [hours, minutes] = timeStr.split(":").map(Number);
        const timestamp = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          hours,
          minutes
        );
        return timestamp;
      };

      // Process time fields and phone number
      const processedUpdateData = {
        ...updateData,
        phoneNumber: updateData.phoneNumber?.replace(/\s/g, ""), // Strip spaces from phone
        arrestTime: updateData.arrestTime
          ? timeStringToTimestamp(updateData.arrestTime)
          : undefined,
        arrivalTime: updateData.arrivalTime
          ? timeStringToTimestamp(updateData.arrivalTime)
          : undefined,
      };

      // Wrap detainee update and audit log in a transaction
      const result = await ctx.db.transaction(async (tx) => {
        // 1. Update detainee
        const updatedDetainee = await tx
          .update(detainees)
          .set({
            ...processedUpdateData,
            updatedBy: ctx.user.id,
            updatedAt: new Date(),
          })
          .where(eq(detainees.id, id))
          .returning();

        if (!updatedDetainee || updatedDetainee.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Détenu non trouvé",
          });
        }

        // 2. Capture changes and insert audit log within the same transaction
        const changes = captureChanges(currentDetainee[0], processedUpdateData);
        await tx.insert(auditLogs).values({
          userId: ctx.user.id,
          action: "update",
          entityType: "detainee",
          entityId: id,
          details: {
            description: `Modification du détenu: ${updatedDetainee[0].firstName} ${updatedDetainee[0].lastName}`,
            changed: changes,
          },
        });

        return updatedDetainee[0];
      });

      return result;
    }),

  // Delete a detainee (hard delete since there's no isActive field)
  delete: protectedProcedure
    .input(getDetaineeByIdSchema)
    .mutation(async ({ ctx, input }) => {
      // Get detainee data before deletion for logging (outside transaction)
      const detaineeToDelete = await ctx.db
        .select()
        .from(detainees)
        .where(eq(detainees.id, input.id))
        .limit(1);

      if (!detaineeToDelete || detaineeToDelete.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Détenu non trouvé",
        });
      }

      // Wrap detainee deletion and audit log in a transaction
      const result = await ctx.db.transaction(async (tx) => {
        // 1. Delete detainee
        const deletedDetainee = await tx
          .delete(detainees)
          .where(eq(detainees.id, input.id))
          .returning();

        if (!deletedDetainee || deletedDetainee.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Détenu non trouvé",
          });
        }

        // 2. Insert audit log within the same transaction
        await tx.insert(auditLogs).values({
          userId: ctx.user.id,
          action: "delete",
          entityType: "detainee",
          entityId: input.id,
          details: {
            description: `Suppression du détenu: ${detaineeToDelete[0].firstName} ${detaineeToDelete[0].lastName}`,
            crimeReason: detaineeToDelete[0].crimeReason,
            arrestLocation: detaineeToDelete[0].arrestLocation,
          },
        });

        return deletedDetainee[0];
      });

      return result;
    }),

  // Search detainees for autocomplete (used in statement forms)
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1, "Search query is required"),
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ input }) => {
      const { query, limit } = input;

      const searchResults = await db
        .select({
          id: detainees.id,
          firstName: detainees.firstName,
          lastName: detainees.lastName,
          fullName: sql<string>`CONCAT(${detainees.firstName}, ' ', ${detainees.lastName})`,
        })
        .from(detainees)
        .where(
          or(
            ilike(detainees.firstName, `%${query}%`),
            ilike(detainees.lastName, `%${query}%`),
            ilike(
              sql`CONCAT(${detainees.firstName}, ' ', ${detainees.lastName})`,
              `%${query}%`
            )
          )
        )
        .limit(limit)
        .orderBy(asc(detainees.firstName));

      return searchResults;
    }),
});
