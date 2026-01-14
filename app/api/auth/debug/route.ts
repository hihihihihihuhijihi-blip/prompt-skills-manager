import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Parse request body
  let body: any;
  try {
    body = await request.json();
  } catch (parseError) {
    return NextResponse.json(
      { error: "Failed to parse JSON", details: String(parseError) },
      { status: 400 }
    );
  }

  // Return debug info without calling Supabase
  return NextResponse.json({
    success: true,
    debug: {
      receivedEmail: body.email ? `${body.email[0]}***${body.email.split('@')[1]}` : null,
      hasPassword: !!body.password,
      timestamp: new Date().toISOString(),
      headers: {
        contentType: request.headers.get("content-type"),
        origin: request.headers.get("origin"),
        host: request.headers.get("host"),
      },
    },
  });
}
