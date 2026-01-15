import { createAdminClient } from "@/lib/auth/supabase";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/tags/[id] - Delete a tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // The id here is actually the tag name (from the client URL encoding)
    const tagName = decodeURIComponent(id);

    // Check if tag exists and user has permission
    const { data: tag } = await supabase
      .from("tags")
      .select("*")
      .eq("name", tagName)
      .single();

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // System tags cannot be deleted
    if (tag.is_system) {
      return NextResponse.json({ error: "系统标签不能删除" }, { status: 403 });
    }

    // Delete the tag
    const { error } = await supabase
      .from("tags")
      .delete()
      .eq("name", tagName);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Also remove this tag from all prompts
    const { data: prompts } = await supabase
      .from("prompts")
      .select("id, tags")
      .contains("tags", [tagName]);

    if (prompts) {
      for (const prompt of prompts) {
        const updatedTags = (prompt.tags || []).filter((t: string) => t !== tagName);
        await supabase
          .from("prompts")
          .update({ tags: updatedTags })
          .eq("id", prompt.id);
      }
    }

    // Also remove this tag from all skills
    const { data: skills } = await supabase
      .from("skills")
      .select("id, tags")
      .contains("tags", [tagName]);

    if (skills) {
      for (const skill of skills) {
        const updatedTags = (skill.tags || []).filter((t: string) => t !== tagName);
        await supabase
          .from("skills")
          .update({ tags: updatedTags })
          .eq("id", skill.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
