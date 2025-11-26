import { router, protectedProcedure } from "../trpc";
import { db } from "@/lib/db";
import { reports, users } from "@/lib/db/schema";
import { and, count, desc, asc, eq, or, ilike, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  reportInputSchema,
  reportUpdateSchema,
  reportQuerySchema,
  reportByIdSchema,
  reportDeleteSchema,
} from "../schemas/reports";
import { logReportAction, captureChanges } from "@/lib/audit-logger";

export const reportsRouter = router({
  getAll: protectedProcedure
    .input(reportQuerySchema)
    .query(async ({ input }) => {
      const { page, limit, search, searchDate, sortBy, sortOrder } = input;
      const offset = (page - 1) * limit;

      const whereConditions: SQL[] = [];

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

      // Date filtering - search for reports on a specific date
      if (searchDate) {
        const searchDateObj = new Date(searchDate);
        const nextDay = new Date(searchDateObj);
        nextDay.setDate(nextDay.getDate() + 1);

        whereConditions.push(
          and(
            sql`${reports.reportDate} >= ${searchDateObj}`,
            sql`${reports.reportDate} < ${nextDay}`
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rapport non trouvé",
        });
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

      // Log the report creation
      await logReportAction(ctx.user, "create", newReport[0].id, {
        description: `Nouveau rapport créé: ${input.title}`,
        title: input.title,
        location: input.location,
      });

      return newReport[0];
    }),

  update: protectedProcedure
    .input(reportUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...reportData } = input;

      // Get current report data for change tracking
      const currentReport = await db
        .select()
        .from(reports)
        .where(eq(reports.id, id))
        .limit(1);

      if (!currentReport || currentReport.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rapport non trouvé",
        });
      }

      // Prepare update data with proper date conversion
      const updateData: Record<string, unknown> = {
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

      // Capture and log changes
      const changes = captureChanges(currentReport[0], updateData);
      await logReportAction(ctx.user, "update", id, {
        description: `Modification du rapport: ${updatedReport[0].title}`,
        changed: changes,
      });

      return updatedReport[0];
    }),

  delete: protectedProcedure
    .input(reportDeleteSchema)
    .mutation(async ({ input, ctx }) => {
      // Get report data before deletion for logging
      const reportToDelete = await db
        .select()
        .from(reports)
        .where(eq(reports.id, input.id))
        .limit(1);

      if (!reportToDelete || reportToDelete.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Rapport non trouvé",
        });
      }

      await db.delete(reports).where(eq(reports.id, input.id));

      // Log the report deletion
      await logReportAction(ctx.user, "delete", input.id, {
        description: `Suppression du rapport: ${reportToDelete[0].title}`,
        title: reportToDelete[0].title,
        location: reportToDelete[0].location,
      });

      return { success: true };
    }),

  getStats: protectedProcedure.query(async () => {
    const totalReports = await db.select({ count: count() }).from(reports);

    return {
      totalReports: totalReports[0]?.count || 0,
    };
  }),
});
