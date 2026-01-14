import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return NextResponse.json({
    supabaseUrl: url,
    urlLength: url.length,
    hasIssue: url.includes('con') && !url.endsWith('.com'),
    preview: url.substring(0, 50) + (url.length > 50 ? "..." : ""),
  });
}
