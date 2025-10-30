import { router, publicProcedure, protectedProcedure } from "../trpc";
import { employees, auditLogs, users } from "@/lib/db/schema";
import { desc, asc, like, and, eq, or, count, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import {
  getAllEmployeesSchema,
  getEmployeeByIdSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
} from "../schemas/employees";
import { captureChanges } from "@/lib/audit-logger";
import { TRPCError } from "@trpc/server";

// Create aliases for the users table to handle both createdBy and updatedBy
const createdByUser = alias(users, "createdByUser");
const updatedByUser = alias(users, "updatedByUser");

export const employeesRouter = router({
  // Fetch all employees with optional filters
  getAll: protectedProcedure
    .input(getAllEmployeesSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, sortBy, sortOrder, isActive } = input;

      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (search) {
        whereConditions.push(
          or(
            like(employees.firstName, `%${search}%`),
            like(employees.lastName, `%${search}%`),
            like(employees.email, `%${search}%`)
          )
        );
      }

      if (isActive !== undefined) {
        whereConditions.push(eq(employees.isActive, isActive));
      }

      // Build order clause
      const orderBy = (() => {
        switch (sortBy) {
          case "firstName":
            return sortOrder === "desc"
              ? desc(employees.firstName)
              : asc(employees.firstName);
          case "lastName":
            return sortOrder === "desc"
              ? desc(employees.lastName)
              : asc(employees.lastName);
          case "email":
            return sortOrder === "desc"
              ? desc(employees.email)
              : asc(employees.email);
          case "createdAt":
          default:
            return sortOrder === "desc"
              ? desc(employees.createdAt)
              : asc(employees.createdAt);
        }
      })();

      // Get total count
      const [totalCount] = await ctx.db
        .select({ count: count() })
        .from(employees)
        .where(
          whereConditions.length > 0 ? and(...whereConditions) : undefined
        );

      // Get employees with user names
      const employeesList = await ctx.db
        .select({
          // All employee fields
          id: employees.id,
          firstName: employees.firstName,
          lastName: employees.lastName,
          sex: employees.sex,
          placeOfBirth: employees.placeOfBirth,
          dateOfBirth: employees.dateOfBirth,
          education: employees.education,
          maritalStatus: employees.maritalStatus,
          employeeId: employees.employeeId,
          function: employees.function,
          deploymentLocation: employees.deploymentLocation,
          residence: employees.residence,
          phone: employees.phone,
          email: employees.email,
          photoUrl: employees.photoUrl,
          isActive: employees.isActive,
          createdBy: employees.createdBy,
          updatedBy: employees.updatedBy,
          createdAt: employees.createdAt,
          updatedAt: employees.updatedAt,
          // User names
          createdByName: sql<string>`CONCAT(${createdByUser.firstName}, ' ', ${createdByUser.lastName})`,
          updatedByName: sql<string>`CONCAT(${updatedByUser.firstName}, ' ', ${updatedByUser.lastName})`,
        })
        .from(employees)
        .leftJoin(createdByUser, eq(employees.createdBy, createdByUser.id))
        .leftJoin(updatedByUser, eq(employees.updatedBy, updatedByUser.id))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      const totalPages = Math.ceil(totalCount.count / limit);

      return {
        employees: employeesList,
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

  // Fetch a single employee by ID with user names
  getById: protectedProcedure
    .input(getEmployeeByIdSchema)
    .query(async ({ ctx, input }) => {
      const employee = await ctx.db
        .select({
          // All employee fields
          id: employees.id,
          firstName: employees.firstName,
          lastName: employees.lastName,
          sex: employees.sex,
          placeOfBirth: employees.placeOfBirth,
          dateOfBirth: employees.dateOfBirth,
          education: employees.education,
          maritalStatus: employees.maritalStatus,
          employeeId: employees.employeeId,
          function: employees.function,
          deploymentLocation: employees.deploymentLocation,
          residence: employees.residence,
          phone: employees.phone,
          email: employees.email,
          photoUrl: employees.photoUrl,
          isActive: employees.isActive,
          createdBy: employees.createdBy,
          updatedBy: employees.updatedBy,
          createdAt: employees.createdAt,
          updatedAt: employees.updatedAt,
          // User names
          createdByName: sql<string>`CONCAT(${createdByUser.firstName}, ' ', ${createdByUser.lastName})`,
          updatedByName: sql<string>`CONCAT(${updatedByUser.firstName}, ' ', ${updatedByUser.lastName})`,
        })
        .from(employees)
        .leftJoin(createdByUser, eq(employees.createdBy, createdByUser.id))
        .leftJoin(updatedByUser, eq(employees.updatedBy, updatedByUser.id))
        .where(eq(employees.id, input.id))
        .limit(1);

      if (!employee || employee.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Employé non trouvé",
        });
      }

      return employee[0];
    }),

  // Create a new employee
  create: protectedProcedure
    .input(createEmployeeSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Wrap employee creation and audit log in a transaction
        const result = await ctx.db.transaction(async (tx) => {
          // 1. Insert employee
          const newEmployee = await tx
            .insert(employees)
            .values({
              firstName: input.firstName,
              lastName: input.lastName,
              sex: input.sex,
              placeOfBirth: input.placeOfBirth,
              dateOfBirth: input.dateOfBirth,
              education: input.education,
              maritalStatus: input.maritalStatus,
              function: input.function,
              deploymentLocation: input.deploymentLocation,
              residence: input.residence,
              phone: input.phone,
              email: input.email,
              photoUrl: input.photoUrl,
              createdBy: ctx.user.id,
              updatedBy: ctx.user.id,
            })
            .returning();

          // 2. Insert audit log within the same transaction
          await tx.insert(auditLogs).values({
            userId: ctx.user.id,
            action: "create",
            entityType: "employee",
            entityId: newEmployee[0].id,
            details: {
              description: `Nouvel employé enregistré: ${input.firstName} ${input.lastName}`,
              function: input.function,
              deploymentLocation: input.deploymentLocation,
              email: input.email,
            },
          });

          return newEmployee[0];
        });

        return result;
      } catch (error) {
        // Handle unique constraint violation for email
        if (error instanceof Error) {
          // Check for Postgres unique constraint violation
          // Drizzle wraps the Postgres error in a cause property
          const errorAny = error as any;
          const cause = errorAny.cause;

          // Check if the cause contains the unique constraint violation
          if (
            cause &&
            cause.code === "23505" &&
            cause.constraint === "employees_email_unique"
          ) {
            throw new TRPCError({
              code: "CONFLICT",
              message:
                "Cette adresse email est déjà utilisée par un autre employé",
            });
          }
        }

        // Re-throw other errors
        throw error;
      }
    }),

  // Update an employee
  update: protectedProcedure
    .input(updateEmployeeSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      try {
        // Get current employee data for change tracking
        const currentEmployee = await ctx.db
          .select()
          .from(employees)
          .where(eq(employees.id, id))
          .limit(1);

        if (!currentEmployee || currentEmployee.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Employé non trouvé",
          });
        }

        // Wrap employee update and audit log in a transaction
        const result = await ctx.db.transaction(async (tx) => {
          // 1. Update employee
          const updatedEmployee = await tx
            .update(employees)
            .set({
              ...updateData,
              updatedBy: ctx.user.id,
              updatedAt: new Date(),
            })
            .where(eq(employees.id, id))
            .returning();

          if (!updatedEmployee || updatedEmployee.length === 0) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Employé non trouvé",
            });
          }

          // 2. Capture changes and insert audit log within the same transaction
          const changes = captureChanges(currentEmployee[0], updateData);
          await tx.insert(auditLogs).values({
            userId: ctx.user.id,
            action: "update",
            entityType: "employee",
            entityId: id,
            details: {
              description: `Modification de l'employé: ${updatedEmployee[0].firstName} ${updatedEmployee[0].lastName}`,
              changed: changes,
            },
          });

          return updatedEmployee[0];
        });

        return result;
      } catch (error) {
        // Re-throw TRPCError as-is
        if (error instanceof TRPCError) {
          throw error;
        }

        // Handle unique constraint violation for email
        if (error instanceof Error) {
          // Check for Postgres unique constraint violation
          // Drizzle wraps the Postgres error in a cause property
          const errorAny = error as any;
          const cause = errorAny.cause;

          // Check if the cause contains the unique constraint violation
          if (
            cause &&
            cause.code === "23505" &&
            cause.constraint === "employees_email_unique"
          ) {
            throw new TRPCError({
              code: "CONFLICT",
              message:
                "Cette adresse email est déjà utilisée par un autre employé",
            });
          }
        }

        // Re-throw other errors
        throw error;
      }
    }),

  // Delete an employee (soft delete)
  delete: protectedProcedure
    .input(getEmployeeByIdSchema)
    .mutation(async ({ ctx, input }) => {
      // Get employee data before deletion for logging (outside transaction)
      const employeeToDelete = await ctx.db
        .select()
        .from(employees)
        .where(eq(employees.id, input.id))
        .limit(1);

      if (!employeeToDelete || employeeToDelete.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Employé non trouvé",
        });
      }

      // Wrap employee deletion and audit log in a transaction
      const result = await ctx.db.transaction(async (tx) => {
        // 1. Soft delete employee (set isActive to false)
        const deletedEmployee = await tx
          .update(employees)
          .set({
            isActive: false,
            updatedBy: ctx.user.id,
            updatedAt: new Date(),
          })
          .where(eq(employees.id, input.id))
          .returning();

        if (!deletedEmployee || deletedEmployee.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Employé non trouvé",
          });
        }

        // 2. Insert audit log within the same transaction
        await tx.insert(auditLogs).values({
          userId: ctx.user.id,
          action: "delete",
          entityType: "employee",
          entityId: input.id,
          details: {
            description: `Suppression (désactivation) de l'employé: ${employeeToDelete[0].firstName} ${employeeToDelete[0].lastName}`,
            function: employeeToDelete[0].function,
            deploymentLocation: employeeToDelete[0].deploymentLocation,
            email: employeeToDelete[0].email,
          },
        });

        return deletedEmployee[0];
      });

      return result;
    }),
});
