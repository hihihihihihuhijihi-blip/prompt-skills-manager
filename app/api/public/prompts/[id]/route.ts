import { createServerClient } from "@/lib/auth/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/public/prompts/[id] - Get a public prompt without authentication
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();

    // Fetch the prompt with is_public check
    const { data: prompt, error } = await supabase
      .from("prompts")
      .select(`
        *,
        category:categories(id, name, color, icon)
      `)
      .eq("id", id)
      .eq("is_public", true)
      .single();

    if (error || !prompt) {
      return NextResponse.json(
        { error: "Prompt not found or not public" },
        { status: 404 }
      );
    }

    // Increment usage count
    await supabase
      .from("prompts")
      .update({ usage_count: (prompt.usage_count || 0) + 1 })
      .eq("id", id);

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error("Error fetching public prompt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
