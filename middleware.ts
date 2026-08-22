import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/register");

    // If the user is on an auth page and is already logged in, redirect to their dashboard
    if (isAuthPage) {
      if (isAuth) {
        const role = token?.role as string;
        if (role === "farmer") {
          return NextResponse.redirect(new URL("/dashboard/farmer", req.url));
        } else if (role === "chc") {
          return NextResponse.redirect(new URL("/dashboard/chc", req.url));
        } else if (role === "driver") {
          return NextResponse.redirect(new URL("/dashboard/driver", req.url));
        }
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    // If the user is NOT logged in and trying to access a protected route
    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    if (isAuth && req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL(`/dashboard/${token?.role}`, req.url));
    }

    // Role-based access control (RBAC) for dashboard routes
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      const role = token?.role as string;

      // Base /dashboard redirect to specific role dashboard
      if (req.nextUrl.pathname === "/dashboard") {
        if (role === "farmer") return NextResponse.redirect(new URL("/dashboard/farmer", req.url));
        if (role === "chc") return NextResponse.redirect(new URL("/dashboard/chc", req.url));
        if (role === "driver") return NextResponse.redirect(new URL("/dashboard/driver", req.url));
      }

      // Prevent cross-role access
      if (req.nextUrl.pathname.startsWith("/dashboard/farmer") && role !== "farmer") {
        return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
      }
      if (req.nextUrl.pathname.startsWith("/dashboard/chc") && role !== "chc") {
        return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
      }
      if (req.nextUrl.pathname.startsWith("/dashboard/driver") && role !== "driver") {
        return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
      }
    }

    return null;
  },
  {
    callbacks: {
      // We return true here so that the middleware function above always runs
      // and we can handle the redirects manually based on roles.
      authorized: () => true,
    },
  }
);

// Define which routes this middleware runs on
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register/:path*",
    '/'
  ],
};
