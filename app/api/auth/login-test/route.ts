import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // This is a minimal test endpoint that doesn't call Supabase
  return NextResponse.json({
    message: "Login test endpoint works!",
    timestamp: new Date().toISOString(),
  });
}
