import { router, publicProcedure, protectedProcedure } from "../trpc";
import { db } from "@/lib/db";
import { detainees } from "@/lib/db/schema";
import { desc, asc, like, and, eq, or, count, sql, ilike } from "drizzle-orm";
import {
  getAllDetaineesSchema,
  getDetaineeByIdSchema,
  createDetaineeSchema,
  updateDetaineeSchema,
} from "../schemas/detainees";
import { z } from "zod";

export const detaineesRouter = router({
  // Fetch all detainees with optional filters
  getAll: publicProcedure
    .input(getAllDetaineesSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, sortBy, sortOrder, status } = input;

      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (search) {
        whereConditions.push(
          or(
            like(detainees.firstName, `%${search}%`),
            like(detainees.lastName, `%${search}%`),
            like(detainees.residence, `%${search}%`),
            like(detainees.arrestLocation, `%${search}%`)
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

      // Get detainees
      const detaineesList = await ctx.db
        .select()
        .from(detainees)
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

  // Fetch a single detainee by ID
  getById: publicProcedure
    .input(getDetaineeByIdSchema)
    .query(async ({ ctx, input }) => {
      const detainee = await ctx.db
        .select()
        .from(detainees)
        .where(eq(detainees.id, input.id))
        .limit(1);

      if (!detainee || detainee.length === 0) {
        throw new Error("Detainee not found");
      }

      return detainee[0];
    }),

  // Create a new detainee
  create: publicProcedure
    .input(createDetaineeSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Get current user ID from session - for now use null
      // const currentUserId = ctx.session?.user?.id;

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

      const newDetainee = await ctx.db
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
          phoneNumber: input.phoneNumber,
          crimeReason: input.crimeReason,
          arrestDate: input.arrestDate,
          arrestLocation: input.arrestLocation,
          arrestedBy: input.arrestedBy,
          arrestTime: timeStringToTimestamp(input.arrestTime), // Convert string to timestamp
          arrivalDate: input.arrivalDate, // Added missing arrivalDate
          arrivalTime: timeStringToTimestamp(input.arrivalTime), // Convert string to timestamp
          cellNumber: input.cellNumber,
          location: input.location,
          status: "in_custody", // Automatically set status for new detainees
          // Removed releaseDate and releaseReason from create operation
          // createdBy: currentUserId,
          // updatedBy: currentUserId,
        })
        .returning();

      return newDetainee[0];
    }),

  // Update a detainee
  update: publicProcedure
    .input(updateDetaineeSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // TODO: Get current user ID from session - for now use null
      // const currentUserId = ctx.session?.user?.id;

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

      // Process time fields if they exist
      const processedUpdateData = {
        ...updateData,
        arrestTime: updateData.arrestTime
          ? timeStringToTimestamp(updateData.arrestTime)
          : undefined,
        arrivalTime: updateData.arrivalTime
          ? timeStringToTimestamp(updateData.arrivalTime)
          : undefined,
      };

      const updatedDetainee = await ctx.db
        .update(detainees)
        .set({
          ...processedUpdateData,
          // updatedBy: currentUserId,
          updatedAt: new Date(),
        })
        .where(eq(detainees.id, id))
        .returning();

      if (!updatedDetainee || updatedDetainee.length === 0) {
        throw new Error("Detainee not found");
      }

      return updatedDetainee[0];
    }),

  // Delete a detainee (hard delete since there's no isActive field)
  delete: publicProcedure
    .input(getDetaineeByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const deletedDetainee = await ctx.db
        .delete(detainees)
        .where(eq(detainees.id, input.id))
        .returning();

      if (!deletedDetainee || deletedDetainee.length === 0) {
        throw new Error("Detainee not found");
      }

      return deletedDetainee[0];
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
