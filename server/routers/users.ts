import { router, publicProcedure } from "../trpc";
import { users } from "@/lib/db/schema";
import { desc, asc, like, and, eq, or, count, not } from "drizzle-orm";
import {
  getAllUsersSchema,
  getUserByIdSchema,
  createUserSchema,
  updateUserSchema,
  updateUserPasswordSchema,
} from "../schemas/users";
import bcrypt from "bcrypt";

export const usersRouter = router({
  // Fetch all users with optional filters
  getAll: publicProcedure
    .input(getAllUsersSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, search, sortBy, sortOrder, role, isActive } = input;

      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (search) {
        whereConditions.push(
          or(
            like(users.firstName, `%${search}%`),
            like(users.lastName, `%${search}%`),
            like(users.email, `%${search}%`)
          )
        );
      }

      if (role) {
        whereConditions.push(eq(users.role, role));
      }

      if (isActive !== undefined) {
        whereConditions.push(eq(users.isActive, isActive));
      }

      // Build order clause
      const orderBy = (() => {
        switch (sortBy) {
          case "firstName":
            return sortOrder === "desc"
              ? desc(users.firstName)
              : asc(users.firstName);
          case "lastName":
            return sortOrder === "desc"
              ? desc(users.lastName)
              : asc(users.lastName);
          case "email":
            return sortOrder === "desc" ? desc(users.email) : asc(users.email);
          case "createdAt":
          default:
            return sortOrder === "desc"
              ? desc(users.createdAt)
              : asc(users.createdAt);
        }
      })();

      // Get total count
      const [totalCount] = await ctx.db
        .select({ count: count() })
        .from(users)
        .where(
          whereConditions.length > 0 ? and(...whereConditions) : undefined
        );

      // Get users (excluding password hash)
      const usersList = await ctx.db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          role: users.role,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      const totalPages = Math.ceil(totalCount.count / limit);

      return {
        users: usersList,
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

  // Fetch a single user by ID
  getById: publicProcedure
    .input(getUserByIdSchema)
    .query(async ({ ctx, input }) => {
      const user = await ctx.db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          role: users.role,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, input.id))
        .limit(1);

      if (!user || user.length === 0) {
        throw new Error("User not found");
      }

      return user[0];
    }),

  // Create a new user
  create: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user with email already exists
      const existingUser = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new Error("Un utilisateur avec cet email existe déjà");
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(input.password, 12);

      const newUser = await ctx.db
        .insert(users)
        .values({
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          passwordHash: hashedPassword,
          role: input.role,
          isActive: true,
        })
        .returning({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          role: users.role,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        });

      return newUser[0];
    }),

  // Update a user
  update: publicProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // If email is being updated, check if it's already taken by another user
      if (updateData.email) {
        const existingUser = await ctx.db
          .select()
          .from(users)
          .where(and(eq(users.email, updateData.email), not(eq(users.id, id))))
          .limit(1);

        if (existingUser.length > 0) {
          throw new Error(
            "Cet email est déjà utilisé par un autre utilisateur"
          );
        }
      }

      const updatedUser = await ctx.db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          role: users.role,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        });

      if (!updatedUser || updatedUser.length === 0) {
        throw new Error("Utilisateur non trouvé");
      }

      return updatedUser[0];
    }),

  // Update user password
  updatePassword: publicProcedure
    .input(updateUserPasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, currentPassword, newPassword } = input;

      // Get user with password hash
      const user = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!user || user.length === 0) {
        throw new Error("Utilisateur non trouvé");
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user[0].passwordHash
      );

      if (!isCurrentPasswordValid) {
        throw new Error("Le mot de passe actuel est incorrect");
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await ctx.db
        .update(users)
        .set({
          passwordHash: hashedNewPassword,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));

      return { success: true };
    }),

  // Delete a user (soft delete)
  delete: publicProcedure
    .input(getUserByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const deletedUser = await ctx.db
        .update(users)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.id))
        .returning({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          role: users.role,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        });

      if (!deletedUser || deletedUser.length === 0) {
        throw new Error("Utilisateur non trouvé");
      }

      return deletedUser[0];
    }),
});
