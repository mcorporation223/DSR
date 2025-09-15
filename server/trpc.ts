import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { type User, users } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { eq } from "drizzle-orm";

/**
 * Context creation for tRPC (Next.js API Routes)
 */
export async function createTRPCContext(opts: CreateNextContextOptions) {
  const { req, res } = opts;

  // Get user from NextAuth session
  const session = await getServerSession(authOptions);

  let user: User | null = null;
  if (session?.user?.id) {
    // Fetch full user details from database
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    user = userResult[0] || null;
  }

  return {
    db,
    user,
    req,
    res,
  };
}

/**
 * Context creation for tRPC (App Router/Fetch)
 */
export async function createTRPCFetchContext(
  opts: FetchCreateContextFnOptions
) {
  // Extract headers from the request
  const { req } = opts;

  // Get the cookie header from the request
  const cookieHeader = req.headers.get("cookie") || "";

  // Debug logging
  console.log(
    "TRPC Context - Cookie header:",
    cookieHeader ? "Present" : "Missing"
  );

  // Get user from NextAuth session with proper request context
  const session = await getServerSession(authOptions);

  let user: User | null = null;
  if (session?.user?.id) {
    try {
      // Fetch full user details from database
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);
      user = userResult[0] || null;
    } catch (error) {
      console.error("Error fetching user from database:", error);
      user = null;
    }
  }

  return {
    db,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
export type FetchContext = Awaited<ReturnType<typeof createTRPCFetchContext>>;

/**
 * Initialize tRPC instance
 */
const t = initTRPC.context<FetchContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * Router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure that requires authentication
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // user is now guaranteed to be non-null
    },
  });
});

/**
 * Admin-only procedure
 */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({
    ctx,
  });
});
