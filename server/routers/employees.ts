import { router, publicProcedure } from "../trpc";
import { employees } from "@/lib/db/schema";
import { desc, asc, like, and, eq, or, count } from "drizzle-orm";
import {
  getAllEmployeesSchema,
  getEmployeeByIdSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
} from "../schemas/employees";

export const employeesRouter = router({
  // Fetch all employees with optional filters
  getAll: publicProcedure
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
  getById: publicProcedure
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
  create: publicProcedure
    .input(createEmployeeSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Get current user ID from session - for now use null
      // const currentUserId = ctx.session?.user?.id;

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
          // createdBy: currentUserId,
          // updatedBy: currentUserId,
        })
        .returning();

      return newEmployee[0];
    }),

  // Update an employee
  update: publicProcedure
    .input(updateEmployeeSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // TODO: Get current user ID from session - for now use null
      // const currentUserId = ctx.session?.user?.id;

      const updatedEmployee = await ctx.db
        .update(employees)
        .set({
          ...updateData,
          // updatedBy: currentUserId,
          updatedAt: new Date(),
        })
        .where(eq(employees.id, id))
        .returning();

      if (!updatedEmployee || updatedEmployee.length === 0) {
        throw new Error("Employee not found");
      }

      return updatedEmployee[0];
    }),

  // Delete an employee (soft delete)
  delete: publicProcedure
    .input(getEmployeeByIdSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Get current user ID from session - for now use null
      // const currentUserId = ctx.session?.user?.id;

      const deletedEmployee = await ctx.db
        .update(employees)
        .set({
          isActive: false,
          // updatedBy: currentUserId,
          updatedAt: new Date(),
        })
        .where(eq(employees.id, input.id))
        .returning();

      if (!deletedEmployee || deletedEmployee.length === 0) {
        throw new Error("Employee not found");
      }

      return deletedEmployee[0];
    }),
});
