import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient as createSSRClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Skip middleware for static files
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/static") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables");
    return response;
  }

  const supabase = createSSRClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: any) {
        request.cookies.delete({
          name,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.delete({
          name,
          ...options,
        });
      },
    },
  });

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Public routes - skip auth check
    if (request.nextUrl.pathname.startsWith("/share")) {
      return response;
    }

    // Auth paths
    const authPaths = ["/login", "/signup"];
    const isAuthPath = authPaths.some((path) => request.nextUrl.pathname === path);

    // Protected routes
    const protectedPaths = ["/dashboard"];
    const isProtectedPath = protectedPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );

    // Redirect to login if accessing protected route without session
    if (isProtectedPath && !session) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect to dashboard if logged in and accessing auth pages
    if (isAuthPath && session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/share/:path*"],
};
