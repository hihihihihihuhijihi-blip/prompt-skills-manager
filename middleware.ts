import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Allow all requests - no authentication required
  return NextResponse.next();
}

// Keep the matcher but it won't do anything
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/share/:path*"],
};
