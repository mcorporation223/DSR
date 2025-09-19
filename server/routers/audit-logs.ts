import { router, protectedProcedure } from "../trpc";
import { auditLogs, users } from "@/lib/db/schema";
import { and, count, desc, asc, eq, or, ilike, gte, lte } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import { auditLogQuerySchema, auditLogByIdSchema } from "../schemas/audit-logs";

// Create alias for the users table for the user who performed the action
const actionUser = alias(users, "actionUser");

export const auditLogsRouter = router({
  getAll: protectedProcedure
    .input(auditLogQuerySchema)
    .query(async ({ input, ctx }) => {
      const {
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        action,
        entityType,
        userId,
        dateFrom,
        dateTo,
      } = input;

      const offset = (page - 1) * limit;

      const whereConditions: SQL[] = [];

      // Search functionality
      if (search) {
        whereConditions.push(
          or(
            ilike(auditLogs.action, `%${search}%`),
            ilike(auditLogs.entityType, `%${search}%`),
            ilike(auditLogs.entityId, `%${search}%`)
          )!
        );
      }

      // Filter by action
      if (action) {
        whereConditions.push(eq(auditLogs.action, action));
      }

      // Filter by entity type
      if (entityType) {
        whereConditions.push(eq(auditLogs.entityType, entityType));
      }

      // Filter by user ID
      if (userId) {
        whereConditions.push(eq(auditLogs.userId, userId));
      }

      // Filter by date range
      if (dateFrom) {
        whereConditions.push(gte(auditLogs.createdAt, dateFrom));
      }

      if (dateTo) {
        // Add end of day to include the entire dateTo day
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        whereConditions.push(lte(auditLogs.createdAt, endOfDay));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Define sort mapping
      const sortMappings = {
        createdAt: auditLogs.createdAt,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        userId: auditLogs.userId,
      };

      const sortColumn = sortMappings[sortBy];
      const sortDirection =
        sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

      // Fetch audit logs with user information
      const auditLogsData = await ctx.db
        .select({
          id: auditLogs.id,
          userId: auditLogs.userId,
          action: auditLogs.action,
          entityType: auditLogs.entityType,
          entityId: auditLogs.entityId,
          details: auditLogs.details,
          createdAt: auditLogs.createdAt,
          // User information
          userFirstName: actionUser.firstName,
          userLastName: actionUser.lastName,
          userEmail: actionUser.email,
          userRole: actionUser.role,
        })
        .from(auditLogs)
        .leftJoin(actionUser, eq(auditLogs.userId, actionUser.id))
        .where(whereClause)
        .orderBy(sortDirection)
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const totalCountResult = await ctx.db
        .select({ count: count() })
        .from(auditLogs)
        .leftJoin(actionUser, eq(auditLogs.userId, actionUser.id))
        .where(whereClause);

      const totalCount = totalCountResult[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: auditLogsData,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    }),

  getById: protectedProcedure
    .input(auditLogByIdSchema)
    .query(async ({ input, ctx }) => {
      const auditLog = await ctx.db
        .select({
          id: auditLogs.id,
          userId: auditLogs.userId,
          action: auditLogs.action,
          entityType: auditLogs.entityType,
          entityId: auditLogs.entityId,
          details: auditLogs.details,
          createdAt: auditLogs.createdAt,
          // User information
          userFirstName: actionUser.firstName,
          userLastName: actionUser.lastName,
          userEmail: actionUser.email,
          userRole: actionUser.role,
        })
        .from(auditLogs)
        .leftJoin(actionUser, eq(auditLogs.userId, actionUser.id))
        .where(eq(auditLogs.id, input.id))
        .limit(1);

      if (!auditLog[0]) {
        throw new Error("Audit log not found");
      }

      return auditLog[0];
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Get total audit logs count
    const totalLogsResult = await ctx.db
      .select({ count: count() })
      .from(auditLogs);

    // Get logs by action type
    const logsByAction = await ctx.db
      .select({
        action: auditLogs.action,
        count: count(),
      })
      .from(auditLogs)
      .groupBy(auditLogs.action);

    // Get logs by entity type
    const logsByEntityType = await ctx.db
      .select({
        entityType: auditLogs.entityType,
        count: count(),
      })
      .from(auditLogs)
      .groupBy(auditLogs.entityType);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivityResult = await ctx.db
      .select({ count: count() })
      .from(auditLogs)
      .where(gte(auditLogs.createdAt, sevenDaysAgo));

    return {
      totalLogs: totalLogsResult[0]?.count || 0,
      logsByAction,
      logsByEntityType,
      recentActivity: recentActivityResult[0]?.count || 0,
    };
  }),
});
