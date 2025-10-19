import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";
import { appRouter } from "@/server/routers/_app";
import { db } from "@/lib/db";
import { type User, users } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { eq } from "drizzle-orm";

const createContext = async () => {
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
  };
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
