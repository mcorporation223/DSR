import { router, protectedProcedure, publicProcedure } from "../trpc";
import { db } from "@/lib/db";
import { seizures, users } from "@/lib/db/schema";
import { and, count, desc, asc, eq, or, ilike, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import {
  seizureInputSchema,
  seizureUpdateSchema,
  seizureQuerySchema,
  seizureByIdSchema,
  seizureDeleteSchema,
} from "../schemas/seizures";

// Create aliases for the users table to handle both createdBy and updatedBy
const createdByUser = alias(users, "createdByUser");
const updatedByUser = alias(users, "updatedByUser");

export const seizuresRouter = router({
  getAll: publicProcedure
    .input(seizureQuerySchema)
    .query(async ({ input, ctx }) => {
      const { page, limit, search, sortBy, sortOrder, type, status } = input;
      const offset = (page - 1) * limit;

      let whereConditions: SQL[] = [];

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
      const orderBy =
        sortOrder === "asc" ? asc(seizures[sortBy]) : desc(seizures[sortBy]);

      const seizuresResult = await db
        .select({
          id: seizures.id,
          itemName: seizures.itemName,
          type: seizures.type,
          seizureLocation: seizures.seizureLocation,
          chassisNumber: seizures.chassisNumber,
          plateNumber: seizures.plateNumber,
          ownerName: seizures.ownerName,
          ownerResidence: seizures.ownerResidence,
          seizureDate: seizures.seizureDate,
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
          seizureLocation: seizures.seizureLocation,
          chassisNumber: seizures.chassisNumber,
          plateNumber: seizures.plateNumber,
          ownerName: seizures.ownerName,
          ownerResidence: seizures.ownerResidence,
          seizureDate: seizures.seizureDate,
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
        throw new Error("Seizure not found");
      }

      return seizure[0];
    }),

  create: protectedProcedure
    .input(seizureInputSchema)
    .mutation(async ({ input, ctx }) => {
      const seizureData = {
        ...input,
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

      return newSeizure[0];
    }),

  update: protectedProcedure
    .input(seizureUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...seizureData } = input;

      // Prepare update data with proper date conversion
      const updateData: any = {
        ...seizureData,
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

      return updatedSeizure[0];
    }),

  delete: protectedProcedure
    .input(seizureDeleteSchema)
    .mutation(async ({ input }) => {
      await db.delete(seizures).where(eq(seizures.id, input.id));
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
