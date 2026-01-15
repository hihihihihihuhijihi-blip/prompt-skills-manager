import { createAdminClient } from "@/lib/auth/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/tags - List all tags
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type") as "prompt" | "skill" | null;

    // Get tags from the tags table
    const { data: managedTags } = await supabase
      .from("tags")
      .select("name");
    const managedTagNames = managedTags?.map((t) => t.name) || [];

    // Get all prompts or skills and extract unique tags
    if (type === "prompt" || !type) {
      const { data: prompts } = await supabase
        .from("prompts")
        .select("tags");

      const promptTags = prompts?.flatMap((p) => p.tags || []) || [];
      const uniquePromptTags = [...new Set([...managedTagNames, ...promptTags])];

      if (type === "prompt") {
        return NextResponse.json({ tags: uniquePromptTags });
      }
    }

    if (type === "skill" || !type) {
      const { data: skills } = await supabase
        .from("skills")
        .select("tags");

      const skillTags = skills?.flatMap((s) => s.tags || []) || [];
      const uniqueSkillTags = [...new Set([...managedTagNames, ...skillTags])];

      if (type === "skill") {
        return NextResponse.json({ tags: uniqueSkillTags });
      }
    }

    // Combined tags from all sources
    const { data: prompts } = await supabase.from("prompts").select("tags");
    const { data: skills } = await supabase.from("skills").select("tags");

    const allTags = [
      ...managedTagNames,
      ...(prompts?.flatMap((p) => p.tags || []) || []),
      ...(skills?.flatMap((s) => s.tags || []) || []),
    ];

    const uniqueTags = [...new Set(allTags)];

    return NextResponse.json({ tags: uniqueTags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const GUEST_USER_ID = "00000000-0000-0000-0000-000000000000";

    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
    }

    const tagName = name.trim();

    // Check if tag already exists in the tags table
    const { data: existingTag } = await supabase
      .from("tags")
      .select("*")
      .eq("name", tagName)
      .single();

    if (existingTag) {
      return NextResponse.json({ error: "标签已存在" }, { status: 400 });
    }

    // Create the tag
    const { data, error } = await supabase
      .from("tags")
      .insert({
        name: tagName,
        user_id: GUEST_USER_ID,
        is_system: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ tag: data.name });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
