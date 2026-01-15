import { createServerClient } from "@/lib/auth/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/skills - List skills
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const tags = searchParams.get("tags")?.split(",");
    const favorite = searchParams.get("favorite") === "true";
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    let query = supabase
      .from("skills")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply filters
    if (category) {
      query = query.eq("category_id", category);
    }

    if (tags && tags.length > 0) {
      query = query.contains("tags", tags);
    }

    if (favorite) {
      query = query.eq("is_favorite", true);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      skills: data || [],
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > to + 1,
    });
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/skills - Create skill
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();

    // Guest mode - use a fixed guest user ID
    const GUEST_USER_ID = "00000000-0000-0000-0000-000000000000";

    const { title, description, content, category_id, tags, parameters, examples, is_public } = body;

    if (!title || !description || !content) {
      return NextResponse.json(
        { error: "Title, description, and content are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("skills")
      .insert({
        title,
        description,
        content,  // Claude Code: main skill instruction
        category_id,
        tags: tags || [],
        parameters: parameters || [],  // Claude Code format: [{name, type, description, required, default}]
        examples: examples || [],  // Claude Code format: [{input, output, description}]
        is_public: is_public || false,
        user_id: GUEST_USER_ID,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, skill: data }, { status: 201 });
  } catch (error) {
    console.error("Error creating skill:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
