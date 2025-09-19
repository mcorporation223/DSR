import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // Add any additional middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - api/trpc (TRPC API routes - needed for public procedures)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - signin (signin page)
     * - setup-password (setup password page)
     */
    "/((?!api/auth|api/trpc|_next/static|_next/image|favicon.ico|signin|setup-password).*)",
  ],
};
