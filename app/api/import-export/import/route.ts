import { createServerClient } from "@/lib/auth/supabase";
import { NextRequest, NextResponse } from "next/server";

// POST /api/import-export/import - Import user data
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { data, format = "json" } = body;

    let importedPrompts = 0;
    let importedSkills = 0;
    const errors: string[] = [];

    if (format === "json") {
      const importData = JSON.parse(data);

      // Import categories (if user-defined)
      if (importData.categories) {
        for (const cat of importData.categories) {
          if (!cat.is_system && cat.user_id !== user.id) {
            // Create new category for this user
            try {
              await supabase.from("categories").insert({
                name: cat.name,
                type: cat.type,
                color: cat.color,
                icon: cat.icon,
                description: cat.description,
                user_id: user.id,
                is_system: false,
              });
            } catch (e) {
              // Ignore duplicate errors
            }
          }
        }
      }

      // Import prompts
      if (importData.prompts && Array.isArray(importData.prompts)) {
        for (const prompt of importData.prompts) {
          try {
            // Check if prompt with same title already exists
            const { data: existing } = await supabase
              .from("prompts")
              .select("id")
              .eq("user_id", user.id)
              .eq("title", prompt.title)
              .single();

            if (existing) {
              errors.push(`Prompt "${prompt.title}" already exists, skipped`);
              continue;
            }

            await supabase.from("prompts").insert({
              title: prompt.title,
              content: prompt.content,
              description: prompt.description,
              tags: prompt.tags || [],
              variables: prompt.variables || {},
              category_id: prompt.category_id,
              user_id: user.id,
              is_public: false,
              is_favorite: prompt.is_favorite || false,
            });
            importedPrompts++;
          } catch (e: any) {
            errors.push(`Failed to import prompt "${prompt.title}": ${e.message}`);
          }
        }
      }

      // Import skills
      if (importData.skills && Array.isArray(importData.skills)) {
        for (const skill of importData.skills) {
          try {
            // Check if skill with same title already exists
            const { data: existing } = await supabase
              .from("skills")
              .select("id")
              .eq("user_id", user.id)
              .eq("title", skill.title)
              .single();

            if (existing) {
              errors.push(`Skill "${skill.title}" already exists, skipped`);
              continue;
            }

            await supabase.from("skills").insert({
              title: skill.title,
              description: skill.description,
              tags: skill.tags || [],
              parameters: skill.parameters || {},
              examples: skill.examples || [],
              category_id: skill.category_id,
              user_id: user.id,
              is_public: false,
              is_favorite: skill.is_favorite || false,
            });
            importedSkills++;
          } catch (e: any) {
            errors.push(`Failed to import skill "${skill.title}": ${e.message}`);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      imported: {
        prompts: importedPrompts,
        skills: importedSkills,
      },
      errors,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
