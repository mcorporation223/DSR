import { router, protectedProcedure } from "../trpc";
import { db } from "@/lib/db";
import { statements, users, detainees } from "@/lib/db/schema";
import { and, count, desc, asc, eq, or, ilike, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import {
  statementInputSchema,
  statementUpdateSchema,
  statementQuerySchema,
  statementByIdSchema,
  statementDeleteSchema,
} from "../schemas/statements";
import { logStatementAction, captureChanges } from "@/lib/audit-logger";

export const statementsRouter = router({
  getAll: protectedProcedure
    .input(statementQuerySchema)
    .query(async ({ input }) => {
      const { page, limit, search, sortBy, sortOrder } = input;
      const offset = (page - 1) * limit;

      const whereConditions: SQL[] = [];

      // Search functionality
      if (search) {
        whereConditions.push(
          or(
            ilike(statements.fileUrl, `%${search}%`),
            // Search in detainee names
            ilike(
              sql`CONCAT(${detainees.firstName}, ' ', ${detainees.lastName})`,
              `%${search}%`
            )
          )!
        );
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Get total count (need to join with detainees for search to work)
      const totalResult = await db
        .select({ count: count() })
        .from(statements)
        .innerJoin(detainees, eq(statements.detaineeId, detainees.id))
        .where(whereClause);

      const totalItems = totalResult[0]?.count || 0;

      // Create aliases for users table to join twice
      const createdByUser = alias(users, "createdByUser");
      const updatedByUser = alias(users, "updatedByUser");

      // Get statements with sorting and user names
      const orderBy =
        sortOrder === "asc"
          ? asc(statements[sortBy])
          : desc(statements[sortBy]);

      const statementsResult = await db
        .select({
          id: statements.id,
          fileUrl: statements.fileUrl,
          detaineeId: statements.detaineeId,
          createdBy: statements.createdBy,
          updatedBy: statements.updatedBy,
          createdAt: statements.createdAt,
          updatedAt: statements.updatedAt,
          // Join with users table to get names
          createdByName: sql<string>`CONCAT(${createdByUser.firstName}, ' ', ${createdByUser.lastName})`,
          updatedByName: sql<string>`CONCAT(${updatedByUser.firstName}, ' ', ${updatedByUser.lastName})`,
          // Join with detainees table to get detainee name
          detaineeName: sql<string>`CONCAT(${detainees.firstName}, ' ', ${detainees.lastName})`,
        })
        .from(statements)
        .innerJoin(detainees, eq(statements.detaineeId, detainees.id))
        .leftJoin(createdByUser, eq(statements.createdBy, createdByUser.id))
        .leftJoin(updatedByUser, eq(statements.updatedBy, updatedByUser.id))
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      return {
        statements: statementsResult,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
      };
    }),

  getById: protectedProcedure
    .input(statementByIdSchema)
    .query(async ({ input }) => {
      const statement = await db
        .select()
        .from(statements)
        .where(eq(statements.id, input.id))
        .limit(1);

      if (!statement[0]) {
        throw new Error("Statement not found");
      }

      return statement[0];
    }),

  create: protectedProcedure
    .input(statementInputSchema)
    .mutation(async ({ input, ctx }) => {
      const statementData = {
        ...input,
        createdBy: ctx.user.id,
        updatedBy: ctx.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newStatement = await db
        .insert(statements)
        .values(statementData)
        .returning();

      // Log the statement creation
      await logStatementAction(ctx.user, "create", newStatement[0].id, {
        description: `Nouvelle déclaration enregistrée`,
        fileUrl: input.fileUrl,
        detaineeId: input.detaineeId,
      });

      return newStatement[0];
    }),

  update: protectedProcedure
    .input(statementUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...statementData } = input;

      // Get current statement data for change tracking
      const currentStatement = await db
        .select()
        .from(statements)
        .where(eq(statements.id, id))
        .limit(1);

      if (!currentStatement || currentStatement.length === 0) {
        throw new Error("Déclaration non trouvée");
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {
        ...statementData,
        updatedBy: ctx.user.id,
        updatedAt: new Date(),
      };

      const updatedStatement = await db
        .update(statements)
        .set(updateData)
        .where(eq(statements.id, id))
        .returning();

      // Capture and log changes
      const changes = captureChanges(currentStatement[0], updateData);
      await logStatementAction(ctx.user, "update", id, {
        description: `Modification de la déclaration`,
        changed: changes,
      });

      return updatedStatement[0];
    }),

  delete: protectedProcedure
    .input(statementDeleteSchema)
    .mutation(async ({ input, ctx }) => {
      // Get statement data before deletion for logging
      const statementToDelete = await db
        .select()
        .from(statements)
        .where(eq(statements.id, input.id))
        .limit(1);

      if (!statementToDelete || statementToDelete.length === 0) {
        throw new Error("Déclaration non trouvée");
      }

      await db.delete(statements).where(eq(statements.id, input.id));

      // Log the statement deletion
      await logStatementAction(ctx.user, "delete", input.id, {
        description: `Suppression de la déclaration`,
        fileUrl: statementToDelete[0].fileUrl,
        detaineeId: statementToDelete[0].detaineeId,
      });

      return { success: true };
    }),

  getStats: protectedProcedure.query(async () => {
    const totalStatements = await db
      .select({ count: count() })
      .from(statements);

    return {
      totalStatements: totalStatements[0]?.count || 0,
    };
  }),
});
