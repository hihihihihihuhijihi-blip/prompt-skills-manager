"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Folder, Pen, Trash2, Loader2, X, Check } from "lucide-react";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api/client";

const PRESET_COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#8B5CF6", // purple
  "#F97316", // orange
  "#06B6D4", // cyan
  "#EC4899", // pink
  "#F59E0B", // amber
  "#6366F1", // indigo
  "#14B8A6", // teal
  "#EF4444", // red
];

interface Category {
  id: string;
  name: string;
  type: "prompt" | "skill";
  color: string;
  icon?: string;
  is_system: boolean;
  description?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "prompt" as "prompt" | "skill",
    color: PRESET_COLORS[0],
    description: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingCategory(null);
    setFormData({
      name: "",
      type: "prompt",
      color: PRESET_COLORS[0],
      description: "",
    });
    setShowDialog(true);
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color,
      description: category.description || "",
    });
    setShowDialog(true);
  }

  async function handleSave() {
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      if (editingCategory) {
        // Update existing category
        const updated = await updateCategory(editingCategory.id, formData);
        setCategories(categories.map((c) => (c.id === editingCategory.id ? updated : c)));
      } else {
        // Create new category
        const newCategory = await createCategory({
          name: formData.name,
          type: formData.type,
          color: formData.color,
          description: formData.description,
        });
        setCategories([...categories, newCategory]);
      }
      setShowDialog(false);
    } catch (error: any) {
      console.error("Failed to save category:", error);
      alert(error.message || "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    if (category.is_system) {
      alert("系统分类不能删除");
      return;
    }

    if (!confirm(`确定要删除分类"${category.name}"吗？`)) return;

    try {
      await deleteCategory(category.id);
      setCategories(categories.filter((c) => c.id !== category.id));
    } catch (error: any) {
      console.error("Failed to delete category:", error);
      alert(error.message || "删除失败");
    }
  }

  const promptCategories = categories.filter((c) => c.type === "prompt");
  const skillCategories = categories.filter((c) => c.type === "skill");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">分类管理</h1>
          <p className="text-slate-500 mt-1">管理你的Prompt和 Skills 分类</p>
        </div>
        <Button onClick={openCreateDialog} className="btn-primary">
          <Plus className="h-4 w-4" />
          新建分类
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Prompt Categories */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Prompt分类
            </h2>
            {promptCategories.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-slate-500">
                  暂无Prompt分类
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {promptCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={() => openEditDialog(category)}
                    onDelete={() => handleDelete(category)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Skill Categories */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Skills 分类
            </h2>
            {skillCategories.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-slate-500">
                  暂无 Skills 分类
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {skillCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={() => openEditDialog(category)}
                    onDelete={() => handleDelete(category)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full !bg-white">
            <CardHeader>
              <CardTitle>{editingCategory ? "编辑分类" : "新建分类"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  分类名称
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：写作助手"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  类型
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "prompt" | "skill" })}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="prompt">Prompt</option>
                  <option value="skill">Skills</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  颜色
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`h-10 w-10 rounded-lg border-2 transition-all ${
                        formData.color === color ? "border-slate-900 scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  描述（可选）
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="分类描述"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !formData.name.trim()}
                  className="flex-1 btn-primary"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "保存"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function CategoryCard({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: category.color + "20" }}
            >
              <Folder
                className="h-5 w-5"
                style={{ color: category.color }}
              />
            </div>
            <div>
              <CardTitle className="text-base">{category.name}</CardTitle>
              {category.description && (
                <p className="text-xs text-slate-500 mt-0.5">{category.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
              title="编辑"
            >
              <Pen className="h-3 w-3" />
            </Button>
            {!category.is_system && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500"
                onClick={onDelete}
                title="删除"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <Badge variant={category.is_system ? "secondary" : "default"}>
          {category.is_system ? "系统" : "自定义"}
        </Badge>
      </CardContent>
    </Card>
  );
}
