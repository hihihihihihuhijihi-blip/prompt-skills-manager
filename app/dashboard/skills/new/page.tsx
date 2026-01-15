"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Zap, Save, Loader2, Plus, X, Trash2 } from "lucide-react";
import { createSkill, fetchCategories, type Category, type SkillParameter, type SkillExample } from "@/lib/api/client";

const PARAMETER_TYPES = ['string', 'number', 'boolean', 'object', 'array'] as const;

export default function NewSkillPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [parameters, setParameters] = useState<SkillParameter[]>([]);
  const [examples, setExamples] = useState<SkillExample[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setCategoriesLoading(true);
    try {
      const data = await fetchCategories("skill");
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleTagInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  }

  // Parameters management
  function addParameter() {
    setParameters([...parameters, {
      name: "",
      type: "string",
      description: "",
      required: false,
    }]);
  }

  function updateParameter(index: number, field: keyof SkillParameter, value: any) {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    setParameters(updated);
  }

  function removeParameter(index: number) {
    setParameters(parameters.filter((_, i) => i !== index));
  }

  // Examples management
  function addExample() {
    setExamples([...examples, { input: "", output: "", description: "" }]);
  }

  function updateExample(index: number, field: keyof SkillExample, value: string) {
    const updated = [...examples];
    updated[index] = { ...updated[index], [field]: value };
    setExamples(updated);
  }

  function removeExample(index: number) {
    setExamples(examples.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim() || !content.trim()) {
      setError("标题、描述和内容不能为空");
      return;
    }

    // Validate parameters
    for (const param of parameters) {
      if (!param.name.trim()) {
        setError("参数名称不能为空");
        return;
      }
    }

    setLoading(true);

    try {
      const skill = await createSkill({
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        category_id: categoryId || undefined,
        tags,
        parameters: parameters.filter(p => p.name.trim()),
        examples: examples.filter(e => e.input.trim() || e.output.trim()),
        is_public: false,
      });

      router.push(`/dashboard/skills/${skill.id}`);
      router.refresh();
    } catch (error: any) {
      setError(error.message || "创建失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/skills">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">新建 Skill</h1>
          <p className="text-slate-500 text-sm">创建符合 Claude Code 规范的 AI Skill</p>
        </div>
      </div>

      {/* Form */}
      <Card className="glass-card">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Skill 名称 <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="例如：data-analyzer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 font-mono"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                使用小写字母和连字符，例如：code-reviewer, data-analyzer
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                简短描述 <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="一句话描述这个 Skill 的功能"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-12"
                required
              />
            </div>

            {/* Content - Main Skill Instruction */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Skill 内容 <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder={`在这里编写 Skill 的主要指令内容...

例如：
You are a data analysis assistant. Your role is to help users analyze and interpret data.

When analyzing data:
1. Understand the context and goals
2. Identify patterns and trends
3. Provide clear, actionable insights`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="resize-none font-mono text-sm"
                required
              />
              <p className="text-xs text-slate-500 mt-2">
                这是 Skill 的核心指令，定义了 AI 应该如何执行任务
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                分类
              </label>
              {categoriesLoading ? (
                <div className="h-12 flex items-center text-slate-400">
                  加载中...
                </div>
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">未分类</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                标签
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-amber-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="添加标签（按回车）"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="flex-1 h-11"
                />
                <Button
                  type="button"
                  onClick={addTag}
                  variant="outline"
                  className="h-11 px-4"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Parameters Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  参数
                </label>
                <Button
                  type="button"
                  onClick={addParameter}
                  variant="outline"
                  size="sm"
                  className="h-9"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  添加参数
                </Button>
              </div>

              {parameters.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-sm text-slate-500">暂无参数，点击上方按钮添加</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {parameters.map((param, index) => (
                    <Card key={index} className="bg-slate-50 border-slate-200">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">参数 {index + 1}</span>
                          <Button
                            type="button"
                            onClick={() => removeParameter(index)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              参数名称
                            </label>
                            <Input
                              type="text"
                              placeholder="例如：filePath"
                              value={param.name}
                              onChange={(e) => updateParameter(index, "name", e.target.value)}
                              className="h-10 text-sm font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              类型
                            </label>
                            <select
                              value={param.type}
                              onChange={(e) => updateParameter(index, "type", e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            >
                              {PARAMETER_TYPES.map((type) => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            描述
                          </label>
                          <Input
                            type="text"
                            placeholder="描述这个参数的用途"
                            value={param.description}
                            onChange={(e) => updateParameter(index, "description", e.target.value)}
                            className="h-10 text-sm"
                          />
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={param.required}
                              onChange={(e) => updateParameter(index, "required", e.target.checked)}
                              className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                            />
                            <span className="text-slate-700">必填</span>
                          </label>

                          <div className="flex-1">
                            <Input
                              type="text"
                              placeholder="默认值（可选）"
                              value={param.default || ""}
                              onChange={(e) => updateParameter(index, "default", e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Examples Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  示例
                </label>
                <Button
                  type="button"
                  onClick={addExample}
                  variant="outline"
                  size="sm"
                  className="h-9"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  添加示例
                </Button>
              </div>

              {examples.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-sm text-slate-500">暂无示例，点击上方按钮添加</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {examples.map((example, index) => (
                    <Card key={index} className="bg-slate-50 border-slate-200">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">示例 {index + 1}</span>
                          <Button
                            type="button"
                            onClick={() => removeExample(index)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            输入
                          </label>
                          <Textarea
                            placeholder="示例输入..."
                            value={example.input}
                            onChange={(e) => updateExample(index, "input", e.target.value)}
                            rows={2}
                            className="resize-none text-sm font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            输出
                          </label>
                          <Textarea
                            placeholder="示例输出..."
                            value={example.output}
                            onChange={(e) => updateExample(index, "output", e.target.value)}
                            rows={2}
                            className="resize-none text-sm font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            说明（可选）
                          </label>
                          <Input
                            type="text"
                            placeholder="简要说明此示例的用途"
                            value={example.description || ""}
                            onChange={(e) => updateExample(index, "description", e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Link href="/dashboard/skills">
                <Button type="button" variant="ghost" className="h-11 px-6">
                  取消
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="btn-primary h-11 px-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    保存 Skill
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
