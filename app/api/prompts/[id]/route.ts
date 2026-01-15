import { createServerClient } from "@/lib/auth/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/prompts/[id] - Get a single prompt
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate UUID format before querying database
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      console.error("UUID validation failed for:", id);
      return NextResponse.json({ error: "Invalid prompt ID format" }, { status: 400 });
    }

    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ prompt: data });
  } catch (error) {
    console.error("Error fetching prompt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/prompts/[id] - Update a prompt
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();

    const body = await request.json();
    const { title, content, description, category_id, tags, is_favorite, is_public } = body;

    const { data, error } = await supabase
      .from("prompts")
      .update({
        title: title || undefined,
        content: content || undefined,
        description: description !== undefined ? description : undefined,
        category_id: category_id !== undefined ? category_id : undefined,
        tags: tags !== undefined ? tags : undefined,
        is_favorite: is_favorite !== undefined ? is_favorite : undefined,
        is_public: is_public !== undefined ? is_public : undefined,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, prompt: data });
  } catch (error) {
    console.error("Error updating prompt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/prompts/[id] - Delete a prompt
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();

    const { error } = await supabase
      .from("prompts")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
