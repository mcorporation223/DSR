import { router, protectedProcedure, publicProcedure } from "../trpc";
import { db } from "@/lib/db";
import { reports, users } from "@/lib/db/schema";
import { and, count, desc, asc, eq, or, ilike, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import {
  reportInputSchema,
  reportUpdateSchema,
  reportQuerySchema,
  reportByIdSchema,
  reportDeleteSchema,
} from "../schemas/reports";

export const reportsRouter = router({
  getAll: protectedProcedure
    .input(reportQuerySchema)
    .query(async ({ input, ctx }) => {
      const { page, limit, search, sortBy, sortOrder } = input;
      const offset = (page - 1) * limit;

      let whereConditions: SQL[] = [];

      // Search functionality
      if (search) {
        whereConditions.push(
          or(
            ilike(reports.title, `%${search}%`),
            ilike(reports.content, `%${search}%`),
            ilike(reports.location, `%${search}%`)
          )!
        );
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Get total count
      const totalResult = await db
        .select({ count: count() })
        .from(reports)
        .where(whereClause);

      const totalItems = totalResult[0]?.count || 0;

      // Create aliases for users table to join twice
      const createdByUser = alias(users, "createdByUser");
      const updatedByUser = alias(users, "updatedByUser");

      // Get reports with sorting and user names
      const orderBy =
        sortOrder === "asc" ? asc(reports[sortBy]) : desc(reports[sortBy]);

      const reportsResult = await db
        .select({
          id: reports.id,
          title: reports.title,
          content: reports.content,
          location: reports.location,
          reportDate: reports.reportDate,
          createdBy: reports.createdBy,
          updatedBy: reports.updatedBy,
          createdAt: reports.createdAt,
          updatedAt: reports.updatedAt,
          // Join with users table to get names
          createdByName: sql<string>`CONCAT(${createdByUser.firstName}, ' ', ${createdByUser.lastName})`,
          updatedByName: sql<string>`CONCAT(${updatedByUser.firstName}, ' ', ${updatedByUser.lastName})`,
        })
        .from(reports)
        .leftJoin(createdByUser, eq(reports.createdBy, createdByUser.id))
        .leftJoin(updatedByUser, eq(reports.updatedBy, updatedByUser.id))
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      return {
        reports: reportsResult,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
      };
    }),

  getById: protectedProcedure
    .input(reportByIdSchema)
    .query(async ({ input }) => {
      const report = await db
        .select()
        .from(reports)
        .where(eq(reports.id, input.id))
        .limit(1);

      if (!report[0]) {
        throw new Error("Report not found");
      }

      return report[0];
    }),

  create: protectedProcedure
    .input(reportInputSchema)
    .mutation(async ({ input, ctx }) => {
      const reportData = {
        ...input,
        reportDate: new Date(input.reportDate),
        createdBy: ctx.user.id,
        updatedBy: ctx.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newReport = await db.insert(reports).values(reportData).returning();

      return newReport[0];
    }),

  update: protectedProcedure
    .input(reportUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...reportData } = input;

      // Prepare update data with proper date conversion
      const updateData: any = {
        ...reportData,
        updatedBy: ctx.user.id,
        updatedAt: new Date(),
      };

      // Convert dates if provided
      if (reportData.reportDate) {
        updateData.reportDate = new Date(reportData.reportDate);
      }

      const updatedReport = await db
        .update(reports)
        .set(updateData)
        .where(eq(reports.id, id))
        .returning();

      return updatedReport[0];
    }),

  delete: protectedProcedure
    .input(reportDeleteSchema)
    .mutation(async ({ input }) => {
      await db.delete(reports).where(eq(reports.id, input.id));
      return { success: true };
    }),

  getStats: protectedProcedure.query(async () => {
    const totalReports = await db.select({ count: count() }).from(reports);

    return {
      totalReports: totalReports[0]?.count || 0,
    };
  }),
});
