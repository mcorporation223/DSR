import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { type User } from "@/lib/db/schema";

/**
 * Context creation for tRPC (Next.js API Routes)
 */
export async function createTRPCContext(opts: CreateNextContextOptions) {
  const { req, res } = opts;

  // Get user from session/token (we'll implement auth later)
  async function getUserFromHeader(): Promise<User | null> {
    // TODO: Implement JWT/session validation
    // For now, return null (unauthenticated)
    return null;
  }

  const user = await getUserFromHeader();

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
  _opts: FetchCreateContextFnOptions
) {
  // Get user from session/token (we'll implement auth later)
  async function getUserFromHeader(): Promise<User | null> {
    // TODO: Implement JWT/session validation from headers
    // For now, return null (unauthenticated)
    return null;
  }

  const user = await getUserFromHeader();

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
