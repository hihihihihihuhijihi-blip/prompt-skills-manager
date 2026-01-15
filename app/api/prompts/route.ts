import { createServerClient } from "@/lib/auth/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/prompts - List prompts
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
      .from("prompts")
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
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,description.ilike.%${search}%`);
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
      prompts: data || [],
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > to + 1,
    });
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/prompts - Create prompt
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();

    // Guest mode - use a fixed guest user ID
    const GUEST_USER_ID = "00000000-0000-0000-0000-000000000000";

    const { title, content, description, category_id, tags, variables, is_public } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("prompts")
      .insert({
        title,
        content,
        description,
        category_id,
        tags: tags || [],
        variables: variables || {},
        is_public: is_public || false,
        user_id: GUEST_USER_ID,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, prompt: data }, { status: 201 });
  } catch (error) {
    console.error("Error creating prompt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
