import { createServerClient } from "@/lib/auth/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/categories - List categories
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type") as "prompt" | "skill" | null;

    let query = supabase
      .from("categories")
      .select("*")
      .order("is_system", { ascending: false })
      .order("name", { ascending: true });

    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ categories: data || [] });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create category
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();

    // Guest mode - use a fixed guest user ID
    const GUEST_USER_ID = "00000000-0000-0000-0000-000000000000";

    const { name, type, color, icon, description } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name,
        type,
        color: color || "#3B82F6",
        icon,
        description,
        user_id: GUEST_USER_ID,
        is_system: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, category: data }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
