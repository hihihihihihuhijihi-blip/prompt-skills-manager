import { createAdminClient } from "@/lib/auth/supabase";
import { NextRequest, NextResponse } from "next/server";

// POST /api/import-export/export - Export user data
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const GUEST_USER_ID = "00000000-0000-0000-0000-000000000000";

    const body = await request.json();
    const { format = "json", type = "all" } = body;

    // Fetch user's data
    const [promptsResult, skillsResult, categoriesResult] = await Promise.all([
      type === "all" || type === "prompts"
        ? supabase.from("prompts").select("*").eq("user_id", GUEST_USER_ID)
        : { data: [] },
      type === "all" || type === "skills"
        ? supabase.from("skills").select("*").eq("user_id", GUEST_USER_ID)
        : { data: [] },
      type === "all"
        ? supabase.from("categories").select("*").or(`user_id.eq.${GUEST_USER_ID},is_system.eq.true`)
        : { data: [] },
    ]);

    const exportData = {
      version: "1.0",
      exported_at: new Date().toISOString(),
      user_id: GUEST_USER_ID,
      prompts: promptsResult.data || [],
      skills: skillsResult.data || [],
      categories: categoriesResult.data || [],
    };

    if (format === "json") {
      return NextResponse.json({
        success: true,
        data: exportData,
        filename: `prompt-skills-export-${new Date().toISOString().split('T')[0]}.json`,
      });
    }

    // CSV format (simplified - just prompts)
    if (format === "csv" && type === "prompts") {
      const headers = ["title", "content", "description", "tags", "category_id", "created_at"];
      const rows = (promptsResult.data || []).map((p: any) => [
        p.title,
        p.content.replace(/"/g, '""'),
        p.description || "",
        p.tags.join(";"),
        p.category_id || "",
        p.created_at,
      ]);
      const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");

      return NextResponse.json({
        success: true,
        data: csv,
        filename: `prompts-export-${new Date().toISOString().split('T')[0]}.csv`,
      });
    }

    // Markdown format - prompts as markdown files
    if (format === "markdown") {
      let markdown = `# Prompt & Skills Export\n\n`;
      markdown += `Exported on: ${new Date().toLocaleDateString()}\n\n`;

      markdown += `## Prompts\n\n`;
      for (const prompt of promptsResult.data || []) {
        markdown += `### ${prompt.title}\n\n`;
        if (prompt.description) {
          markdown += `${prompt.description}\n\n`;
        }
        markdown += "```\n" + prompt.content + "\n```\n\n";
        if (prompt.tags.length > 0) {
          markdown += `Tags: ${prompt.tags.join(", ")}\n\n`;
        }
        markdown += "---\n\n";
      }

      markdown += `## Skills\n\n`;
      for (const skill of skillsResult.data || []) {
        markdown += `### ${skill.title}\n\n`;
        markdown += `${skill.description}\n\n`;
        if (skill.tags.length > 0) {
          markdown += `Tags: ${skill.tags.join(", ")}\n\n`;
        }
        markdown += "---\n\n";
      }

      return NextResponse.json({
        success: true,
        data: markdown,
        filename: `prompt-skills-export-${new Date().toISOString().split('T')[0]}.md`,
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/import-export/export - Get export options/info
export async function GET() {
  return NextResponse.json({
    formats: ["json", "csv", "markdown"],
    types: ["all", "prompts", "skills"],
  });
}
