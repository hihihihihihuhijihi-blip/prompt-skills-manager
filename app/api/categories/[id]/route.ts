import { createServerClient } from "@/lib/auth/supabase";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/categories/[id] - Update category
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();

    const body = await request.json();
    const { name, color, description, icon } = body;

    // Check if category exists
    const { data: category } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // System categories cannot be modified
    if (category.is_system) {
      return NextResponse.json({ error: "System categories cannot be modified" }, { status: 403 });
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (color !== undefined) updates.color = color;
    if (description !== undefined) updates.description = description;
    if (icon !== undefined) updates.icon = icon;

    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ category: data });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();

    // Check if category exists
    const { data: category } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // System categories cannot be deleted
    if (category.is_system) {
      return NextResponse.json({ error: "System categories cannot be deleted" }, { status: 403 });
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
