"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  X,
  Edit3,
  Trash2,
  Star,
  Share2,
  Link as LinkIcon,
  Code,
  FileText,
  Boxes,
} from "lucide-react";
import {
  fetchSkill,
  updateSkill,
  deleteSkill,
  fetchCategories,
  type Skill,
  type Category,
  type SkillParameter,
  type SkillExample,
} from "@/lib/api/client";

const PARAMETER_TYPES = ['string', 'number', 'boolean', 'object', 'array'] as const;

export default function SkillDetailPage() {
  const router = useRouter();
  const params = useParams();
  const skillId = params.id as string;

  const [skill, setSkill] = useState<Skill | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  // Form state for editing
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [parameters, setParameters] = useState<SkillParameter[]>([]);
  const [examples, setExamples] = useState<SkillExample[]>([]);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    // Validate UUID format before making API call
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!skillId || !uuidRegex.test(skillId)) {
      console.error("Invalid skill ID:", skillId);
      setError("无效的 Skill ID");
      setLoading(false);
      return;
    }

    loadData();
  }, [skillId, router]);

  async function loadData() {
    setLoading(true);
    try {
      const [skillData, categoriesData] = await Promise.all([
        fetchSkill(skillId),
        fetchCategories("skill"),
      ]);
      setSkill(skillData);
      setCategories(categoriesData);

      // Initialize form state
      setTitle(skillData.title);
      setDescription(skillData.description);
      setContent(skillData.content || "");
      setCategoryId(skillData.category_id || "");
      setTags(skillData.tags || []);
      setParameters(skillData.parameters || []);
      setExamples(skillData.examples || []);
      setIsPublic(skillData.is_public || false);
    } catch (error: any) {
      setError(error.message || "加载失败");
    } finally {
      setLoading(false);
    }
  }

  function startEditing() {
    setIsEditing(true);
    setError("");
  }

  function cancelEditing() {
    if (skill) {
      setTitle(skill.title);
      setDescription(skill.description);
      setContent(skill.content || "");
      setCategoryId(skill.category_id || "");
      setTags(skill.tags || []);
      setParameters(skill.parameters || []);
      setExamples(skill.examples || []);
    }
    setIsEditing(false);
    setError("");
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

  async function handleSave() {
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

    setSaving(true);
    try {
      const updated = await updateSkill(skillId, {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        category_id: categoryId || undefined,
        tags,
        parameters: parameters.filter(p => p.name.trim()),
        examples: examples.filter(e => e.input.trim() || e.output.trim()),
      });
      setSkill(updated);
      setIsEditing(false);
    } catch (error: any) {
      setError(error.message || "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleFavorite() {
    if (!skill) return;
    try {
      const updated = await updateSkill(skillId, {
        is_favorite: !skill.is_favorite,
      });
      setSkill(updated);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  }

  async function handleDelete() {
    if (!confirm("确定要删除这个 Skill 吗？此操作不可恢复。")) return;

    setDeleting(true);
    try {
      await deleteSkill(skillId);
      router.push("/dashboard/skills");
    } catch (error: any) {
      setError(error.message || "删除失败");
      setDeleting(false);
    }
  }

  function getShareLink() {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/share/skills/${skillId}`;
    }
    return `/share/skills/${skillId}`;
  }

  async function handleShare() {
    if (!skill) return;

    if (!skill.is_public) {
      if (!confirm("此 Skill 当前未公开分享。是否要设置为公开以生成分享链接？")) {
        return;
      }
      try {
        const updated = await updateSkill(skillId, { is_public: true });
        setSkill(updated);
        setIsPublic(true);
      } catch (error) {
        console.error("Failed to make public:", error);
        return;
      }
    }

    setShowShareDialog(true);
  }

  async function copyShareLink() {
    const link = getShareLink();
    try {
      await navigator.clipboard.writeText(link);
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy share link:", error);
    }
  }

  function getCategoryName(categoryId: string | undefined) {
    if (!categoryId) return "未分类";
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.name || "未分类";
  }

  function getCategoryColor(categoryId: string | undefined) {
    if (!categoryId) return "#94A3B8";
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.color || "#94A3B8";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/dashboard/skills">
          <Button>返回列表</Button>
        </Link>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Skill 不存在</p>
        <Link href="/dashboard/skills">
          <Button className="mt-4">返回列表</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/skills">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{skill.title}</h1>
            <p className="text-slate-500 text-sm">
              创建于 {new Date(skill.created_at).toLocaleDateString("zh-CN")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                title={skill.is_favorite ? "取消收藏" : "收藏"}
              >
                <Star
                  className={`h-5 w-5 ${
                    skill.is_favorite ? "text-amber-500 fill-amber-500" : "text-slate-400"
                  }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                title="分享"
                className={skill.is_public ? "text-violet-600" : ""}
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={startEditing}
                title="编辑"
              >
                <Edit3 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={deleting}
                title="删除"
              >
                {deleting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5 text-red-500" />
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={cancelEditing}
                disabled={saving}
              >
                取消
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    保存
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <Card className="glass-card">
        <CardContent className="p-8">
          {isEditing ? (
            // Edit Mode
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Skill 名称
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  简短描述
                </label>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Skill 内容 <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="resize-none font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  分类
                </label>
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
              </div>

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

              {/* Parameters Edit Section */}
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
              </div>

              {/* Examples Edit Section */}
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
                            value={example.description || ""}
                            onChange={(e) => updateExample(index, "description", e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="space-y-6">
              {/* Tags and Category */}
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: getCategoryColor(skill.category_id) }}
                >
                  {getCategoryName(skill.category_id)}
                </span>
                {skill.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-3">描述</h3>
                <p className="text-slate-700 leading-relaxed">{skill.description}</p>
              </div>

              {/* Content - Main Skill Instruction */}
              {skill.content && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Skill 内容
                  </h3>
                  <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4">
                      <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap overflow-x-auto">
                        {skill.content}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Parameters */}
              {parameters && parameters.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                    <Boxes className="h-4 w-4" />
                    参数 ({parameters.length})
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {parameters.map((param, i) => (
                      <Card key={i} className="bg-slate-50 border-slate-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <code className="text-sm font-mono font-semibold text-violet-600">
                              {param.name}
                            </code>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                              {param.type}
                            </span>
                            {param.required && (
                              <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-600">
                                必填
                              </span>
                            )}
                          </div>
                          {param.description && (
                            <p className="text-sm text-slate-600 mb-2">{param.description}</p>
                          )}
                          {param.default !== undefined && (
                            <p className="text-xs text-slate-500">
                              默认: <code className="font-mono">{String(param.default)}</code>
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Examples */}
              {examples && examples.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    示例 ({examples.length})
                  </h3>
                  <div className="space-y-3">
                    {examples.map((example, i) => (
                      <Card key={i} className="border-slate-200">
                        <CardContent className="p-4 space-y-3">
                          {example.description && (
                            <p className="text-sm font-medium text-slate-700">{example.description}</p>
                          )}
                          <div>
                            <label className="text-xs font-medium text-slate-500">输入</label>
                            <div className="mt-1 p-3 rounded-lg bg-slate-50 border border-slate-200">
                              <pre className="text-sm font-mono whitespace-pre-wrap">{example.input}</pre>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500">输出</label>
                            <div className="mt-1 p-3 rounded-lg bg-slate-50 border border-slate-200">
                              <pre className="text-sm font-mono whitespace-pre-wrap">{example.output}</pre>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-slate-500 pt-4 border-t">
                <span>使用次数: {skill.usage_count}</span>
                <span>
                  最后更新: {new Date(skill.updated_at).toLocaleDateString("zh-CN")}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full !bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">分享 Skill</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowShareDialog(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    公开状态
                  </label>
                  <div className="flex items-center gap-2">
                    {skill?.is_public ? (
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        已公开分享
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-slate-500">
                        <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                        仅自己可见
                      </span>
                    )}
                  </div>
                </div>

                {skill?.is_public && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      分享链接
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={getShareLink()}
                        readOnly
                        className="flex-1 text-sm"
                      />
                      <Button
                        onClick={copyShareLink}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <LinkIcon className="h-4 w-4" />
                        {shareLinkCopied ? "已复制" : "复制"}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      任何人都可以通过此链接查看此 Skill
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
