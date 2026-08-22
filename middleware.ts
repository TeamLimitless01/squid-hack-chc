import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Allows us to add custom logic on top of next-auth
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Must be logged in to access dashboard or profile
        if (
          req.nextUrl.pathname.startsWith("/dashboard") ||
          req.nextUrl.pathname.startsWith("/profile")
        ) {
          return !!token;
        }
        return true;
      },
    },
    pages: {
      signIn: "/login",
    }
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
