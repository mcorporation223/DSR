import { router, publicProcedure, protectedProcedure } from "../trpc";
import { employees } from "@/lib/db/schema";
import { desc, asc, like, and, eq, or, count } from "drizzle-orm";
import {
  getAllEmployeesSchema,
  getEmployeeByIdSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
} from "../schemas/employees";
import { logEmployeeAction, captureChanges } from "@/lib/audit-logger";

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

      // Get employees
      const employeesList = await ctx.db
        .select()
        .from(employees)
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

  // Fetch a single employee by ID
  getById: protectedProcedure
    .input(getEmployeeByIdSchema)
    .query(async ({ ctx, input }) => {
      const employee = await ctx.db
        .select()
        .from(employees)
        .where(eq(employees.id, input.id))
        .limit(1);

      if (!employee || employee.length === 0) {
        throw new Error("Employee not found");
      }

      return employee[0];
    }),

  // Create a new employee
  create: protectedProcedure
    .input(createEmployeeSchema)
    .mutation(async ({ ctx, input }) => {
      const newEmployee = await ctx.db
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

      // Log the employee creation
      await logEmployeeAction(ctx.user, "create", newEmployee[0].id, {
        description: `Nouvel employé enregistré: ${input.firstName} ${input.lastName}`,
        function: input.function,
        deploymentLocation: input.deploymentLocation,
        email: input.email,
      });

      return newEmployee[0];
    }),

  // Update an employee
  update: protectedProcedure
    .input(updateEmployeeSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Get current employee data for change tracking
      const currentEmployee = await ctx.db
        .select()
        .from(employees)
        .where(eq(employees.id, id))
        .limit(1);

      if (!currentEmployee || currentEmployee.length === 0) {
        throw new Error("Employé non trouvé");
      }

      const updatedEmployee = await ctx.db
        .update(employees)
        .set({
          ...updateData,
          updatedBy: ctx.user.id,
          updatedAt: new Date(),
        })
        .where(eq(employees.id, id))
        .returning();

      if (!updatedEmployee || updatedEmployee.length === 0) {
        throw new Error("Employé non trouvé");
      }

      // Capture and log changes
      const changes = captureChanges(currentEmployee[0], updateData);
      await logEmployeeAction(ctx.user, "update", id, {
        description: `Modification de l'employé: ${updatedEmployee[0].firstName} ${updatedEmployee[0].lastName}`,
        changed: changes,
      });

      return updatedEmployee[0];
    }),

  // Delete an employee (soft delete)
  delete: protectedProcedure
    .input(getEmployeeByIdSchema)
    .mutation(async ({ ctx, input }) => {
      // Get employee data before deletion for logging
      const employeeToDelete = await ctx.db
        .select()
        .from(employees)
        .where(eq(employees.id, input.id))
        .limit(1);

      if (!employeeToDelete || employeeToDelete.length === 0) {
        throw new Error("Employé non trouvé");
      }

      const deletedEmployee = await ctx.db
        .update(employees)
        .set({
          isActive: false,
          updatedBy: ctx.user.id,
          updatedAt: new Date(),
        })
        .where(eq(employees.id, input.id))
        .returning();

      if (!deletedEmployee || deletedEmployee.length === 0) {
        throw new Error("Employé non trouvé");
      }

      // Log the employee deletion
      await logEmployeeAction(ctx.user, "delete", input.id, {
        description: `Suppression (désactivation) de l'employé: ${employeeToDelete[0].firstName} ${employeeToDelete[0].lastName}`,
        function: employeeToDelete[0].function,
        deploymentLocation: employeeToDelete[0].deploymentLocation,
        email: employeeToDelete[0].email,
      });

      return deletedEmployee[0];
    }),
});
