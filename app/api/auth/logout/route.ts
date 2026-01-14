import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Logout is handled client-side by clearing localStorage
  return NextResponse.json({ success: true });
}
