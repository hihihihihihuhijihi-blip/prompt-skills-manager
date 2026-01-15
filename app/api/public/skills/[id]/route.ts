import { createAdminClient } from "@/lib/auth/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/public/skills/[id] - Get a public skill without authentication
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Fetch the skill with is_public check
    const { data: skill, error } = await supabase
      .from("skills")
      .select(`
        *,
        category:categories(id, name, color, icon)
      `)
      .eq("id", id)
      .eq("is_public", true)
      .single();

    if (error || !skill) {
      return NextResponse.json(
        { error: "Skill not found or not public" },
        { status: 404 }
      );
    }

    // Increment usage count
    await supabase
      .from("skills")
      .update({ usage_count: (skill.usage_count || 0) + 1 })
      .eq("id", id);

    return NextResponse.json({ skill });
  } catch (error) {
    console.error("Error fetching public skill:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
