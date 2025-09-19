import { router, publicProcedure } from "../trpc";
import {
  detainees,
  employees,
  incidents,
  reports,
  seizures,
  statements,
  users,
} from "@/lib/db/schema";
import { desc, eq, count, sql, gte } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

// Create aliases for the users table
const createdByUser = alias(users, "createdByUser");

export const dashboardRouter = router({
  // Get overall statistics for the dashboard
  getStats: publicProcedure.query(async ({ ctx }) => {
    // Get counts for each entity
    const [
      detaineesCount,
      employeesCount,
      incidentsCount,
      reportsCount,
      seizuresCount,
      statementsCount,
    ] = await Promise.all([
      ctx.db.select({ count: count() }).from(detainees),
      ctx.db
        .select({ count: count() })
        .from(employees)
        .where(eq(employees.isActive, true)),
      ctx.db.select({ count: count() }).from(incidents),
      ctx.db.select({ count: count() }).from(reports),
      ctx.db.select({ count: count() }).from(seizures),
      ctx.db.select({ count: count() }).from(statements),
    ]);

    // Get status breakdown for detainees
    const detaineesStatusBreakdown = await ctx.db
      .select({
        status: detainees.status,
        count: count(),
      })
      .from(detainees)
      .groupBy(detainees.status);

    // Get seizures status breakdown
    const seizuresStatusBreakdown = await ctx.db
      .select({
        status: seizures.status,
        count: count(),
      })
      .from(seizures)
      .groupBy(seizures.status);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentDetainees, recentIncidents, recentReports, recentSeizures] =
      await Promise.all([
        ctx.db
          .select({ count: count() })
          .from(detainees)
          .where(gte(detainees.createdAt, thirtyDaysAgo)),
        ctx.db
          .select({ count: count() })
          .from(incidents)
          .where(gte(incidents.createdAt, thirtyDaysAgo)),
        ctx.db
          .select({ count: count() })
          .from(reports)
          .where(gte(reports.createdAt, thirtyDaysAgo)),
        ctx.db
          .select({ count: count() })
          .from(seizures)
          .where(gte(seizures.createdAt, thirtyDaysAgo)),
      ]);

    return {
      totalCounts: {
        detainees: detaineesCount[0]?.count || 0,
        employees: employeesCount[0]?.count || 0,
        incidents: incidentsCount[0]?.count || 0,
        reports: reportsCount[0]?.count || 0,
        seizures: seizuresCount[0]?.count || 0,
        statements: statementsCount[0]?.count || 0,
      },
      statusBreakdowns: {
        detainees: detaineesStatusBreakdown,
        seizures: seizuresStatusBreakdown,
      },
      recentActivity: {
        detainees: recentDetainees[0]?.count || 0,
        incidents: recentIncidents[0]?.count || 0,
        reports: recentReports[0]?.count || 0,
        seizures: recentSeizures[0]?.count || 0,
      },
    };
  }),

  // Get recent activities across all entities
  getRecentActivities: publicProcedure.query(async ({ ctx }) => {
    // Get recent detainees
    const recentDetainees = await ctx.db
      .select({
        id: detainees.id,
        type: sql<string>`'detainee'`,
        title: sql<string>`CONCAT(${detainees.firstName}, ' ', ${detainees.lastName})`,
        description: detainees.crimeReason,
        createdAt: detainees.createdAt,
        createdByName: sql<string>`CONCAT(${createdByUser.firstName}, ' ', ${createdByUser.lastName})`,
      })
      .from(detainees)
      .leftJoin(createdByUser, eq(detainees.createdBy, createdByUser.id))
      .orderBy(desc(detainees.createdAt))
      .limit(5);

    // Get recent incidents
    const recentIncidents = await ctx.db
      .select({
        id: incidents.id,
        type: sql<string>`'incident'`,
        title: incidents.eventType,
        description: incidents.location,
        createdAt: incidents.createdAt,
        createdByName: sql<string>`CONCAT(${createdByUser.firstName}, ' ', ${createdByUser.lastName})`,
      })
      .from(incidents)
      .leftJoin(createdByUser, eq(incidents.createdBy, createdByUser.id))
      .orderBy(desc(incidents.createdAt))
      .limit(5);

    // Get recent reports
    const recentReports = await ctx.db
      .select({
        id: reports.id,
        type: sql<string>`'report'`,
        title: reports.title,
        description: reports.location,
        createdAt: reports.createdAt,
        createdByName: sql<string>`CONCAT(${createdByUser.firstName}, ' ', ${createdByUser.lastName})`,
      })
      .from(reports)
      .leftJoin(createdByUser, eq(reports.createdBy, createdByUser.id))
      .orderBy(desc(reports.createdAt))
      .limit(5);

    // Get recent seizures
    const recentSeizures = await ctx.db
      .select({
        id: seizures.id,
        type: sql<string>`'seizure'`,
        title: seizures.itemName,
        description: seizures.seizureLocation,
        createdAt: seizures.createdAt,
        createdByName: sql<string>`CONCAT(${createdByUser.firstName}, ' ', ${createdByUser.lastName})`,
      })
      .from(seizures)
      .leftJoin(createdByUser, eq(seizures.createdBy, createdByUser.id))
      .orderBy(desc(seizures.createdAt))
      .limit(5);

    // Combine all activities and sort by date
    const allActivities = [
      ...recentDetainees,
      ...recentIncidents,
      ...recentReports,
      ...recentSeizures,
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10); // Get top 10 most recent

    return allActivities;
  }),

  // Get weekly statistics for charts
  getWeeklyStats: publicProcedure.query(async ({ ctx }) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get daily counts for the last 7 days
    const dailyStats = await Promise.all([
      // Detainees by day
      ctx.db
        .select({
          date: sql<string>`DATE(${detainees.createdAt})`,
          count: count(),
        })
        .from(detainees)
        .where(gte(detainees.createdAt, sevenDaysAgo))
        .groupBy(sql`DATE(${detainees.createdAt})`)
        .orderBy(sql`DATE(${detainees.createdAt})`),

      // Incidents by day
      ctx.db
        .select({
          date: sql<string>`DATE(${incidents.createdAt})`,
          count: count(),
        })
        .from(incidents)
        .where(gte(incidents.createdAt, sevenDaysAgo))
        .groupBy(sql`DATE(${incidents.createdAt})`)
        .orderBy(sql`DATE(${incidents.createdAt})`),
    ]);

    return {
      detainees: dailyStats[0],
      incidents: dailyStats[1],
    };
  }),
});
