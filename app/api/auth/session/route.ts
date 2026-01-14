import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("[SESSION] Session endpoint called");

  // Check if we can even reach this endpoint
  return NextResponse.json({
    user: null,
    debug: {
      timestamp: new Date().toISOString(),
      pathname: request.nextUrl.pathname,
      hasAuthHeader: !!request.headers.get("authorization"),
    },
  });
}
