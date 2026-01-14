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
  Sparkles,
  Save,
  Loader2,
  Plus,
  X,
  Edit3,
  Trash2,
  Copy,
  Star,
  History,
  Clock,
  ChevronDown,
  ChevronUp,
  Share2,
  Link as LinkIcon,
} from "lucide-react";
import {
  fetchPrompt,
  updatePrompt,
  deletePrompt,
  fetchCategories,
  type Prompt,
  type Category,
} from "@/lib/api/client";
import { useAuth } from "@/components/providers/SessionProvider";

interface PromptVersion {
  id: string;
  content: string;
  version_number: number;
  change_note: string;
  created_at: string;
}

export default function PromptDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const promptId = params.id as string;

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [error, setError] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  // Form state for editing
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    if (!user) {
      router.push("/login");
      return;
    }

    // Validate UUID format before making API call
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!promptId || !uuidRegex.test(promptId)) {
      console.error("Invalid prompt ID received:", promptId);
      setError(`无效的 Prompt ID: ${promptId}`);
      setLoading(false);
      // Redirect back to list after showing error
      setTimeout(() => {
        router.push("/dashboard/prompts");
      }, 2000);
      return;
    }

    loadData();
  }, [user, promptId, router, authLoading]);

  async function loadData() {
    setLoading(true);
    try {
      const [promptData, categoriesData] = await Promise.all([
        fetchPrompt(promptId),
        fetchCategories("prompt"),
      ]);
      setPrompt(promptData);
      setCategories(categoriesData);

      // Initialize form state
      setTitle(promptData.title);
      setContent(promptData.content);
      setDescription(promptData.description || "");
      setCategoryId(promptData.category_id || "");
      setTags(promptData.tags || []);
      setIsPublic(promptData.is_public || false);
    } catch (error: any) {
      setError(error.message || "加载失败");
    } finally {
      setLoading(false);
    }
  }

  async function loadVersions() {
    if (showVersions) return; // Already loaded
    setLoadingVersions(true);
    try {
      const response = await fetch(`/api/prompts/${promptId}/versions`);
      const data = await response.json();
      if (response.ok) {
        setVersions(data.versions || []);
      }
    } catch (error) {
      console.error("Failed to load versions:", error);
    } finally {
      setLoadingVersions(false);
    }
  }

  function toggleVersions() {
    if (!showVersions) {
      loadVersions();
    }
    setShowVersions(!showVersions);
  }

  async function restoreVersion(version: PromptVersion) {
    if (!confirm(`确定要恢复到版本 ${version.version_number} 吗？当前内容将被替换。`)) return;

    setContent(version.content);
    setIsEditing(true);
    setShowVersions(false);
  }

  function startEditing() {
    setIsEditing(true);
    setError("");
  }

  function cancelEditing() {
    if (prompt) {
      setTitle(prompt.title);
      setContent(prompt.content);
      setDescription(prompt.description || "");
      setCategoryId(prompt.category_id || "");
      setTags(prompt.tags || []);
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

  async function handleSave() {
    setError("");
    if (!title.trim() || !content.trim()) {
      setError("标题和内容不能为空");
      return;
    }

    setSaving(true);
    try {
      const updated = await updatePrompt(promptId, {
        title: title.trim(),
        content: content.trim(),
        description: description.trim() || undefined,
        category_id: categoryId || undefined,
        tags,
      });
      setPrompt(updated);
      setIsEditing(false);
      // Reload versions after saving (a new version might have been created)
      setVersions([]);
      setShowVersions(false);
    } catch (error: any) {
      setError(error.message || "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleFavorite() {
    if (!prompt) return;
    try {
      const updated = await updatePrompt(promptId, {
        is_favorite: !prompt.is_favorite,
      });
      setPrompt(updated);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  }

  async function handleDelete() {
    if (!confirm("确定要删除这个Prompt吗？此操作不可恢复。")) return;

    setDeleting(true);
    try {
      await deletePrompt(promptId);
      router.push("/dashboard/prompts");
    } catch (error: any) {
      setError(error.message || "删除失败");
      setDeleting(false);
    }
  }

  async function handleCopy() {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt.content);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }

  function getShareLink() {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/share/prompts/${promptId}`;
    }
    return `/share/prompts/${promptId}`;
  }

  async function handleShare() {
    if (!prompt) return;

    if (!prompt.is_public) {
      // Ask user if they want to make it public
      if (!confirm("此Prompt当前未公开分享。是否要设置为公开以生成分享链接？")) {
        return;
      }
      try {
        const updated = await updatePrompt(promptId, { is_public: true });
        setPrompt(updated);
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
        <Link href="/dashboard/prompts">
          <Button>返回列表</Button>
        </Link>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Prompt不存在</p>
        <Link href="/dashboard/prompts">
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
          <Link href="/dashboard/prompts">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{prompt.title}</h1>
            <p className="text-slate-500 text-sm">
              创建于 {new Date(prompt.created_at).toLocaleDateString("zh-CN")}
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
                title={prompt.is_favorite ? "取消收藏" : "收藏"}
              >
                <Star
                  className={`h-5 w-5 ${
                    prompt.is_favorite ? "text-amber-500 fill-amber-500" : "text-slate-400"
                  }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                title="复制内容"
              >
                <Copy className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                title="分享"
                className={prompt.is_public ? "text-violet-600" : ""}
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleVersions}
                title="版本历史"
              >
                <History className="h-5 w-5" />
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

      {/* Version History */}
      {showVersions && (
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <History className="h-5 w-5" />
                版本历史
              </h3>
              <Button variant="ghost" size="sm" onClick={toggleVersions}>
                关闭
              </Button>
            </div>

            {loadingVersions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 text-violet-600 animate-spin" />
              </div>
            ) : versions.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">
                暂无版本历史
              </p>
            ) : (
              <div className="space-y-3">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-900">
                            版本 {version.version_number}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(version.created_at).toLocaleString("zh-CN")}
                          </span>
                        </div>
                        {version.change_note && (
                          <p className="text-xs text-slate-500 mb-2">{version.change_note}</p>
                        )}
                        <pre className="text-xs bg-white p-2 rounded border border-slate-200 overflow-x-auto max-h-24">
                          {version.content.substring(0, 200)}
                          {version.content.length > 200 && "..."}
                        </pre>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreVersion(version)}
                      >
                        恢复
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card className="glass-card">
        <CardContent className="p-8">
          {isEditing ? (
            // Edit Mode
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  标题
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  描述
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
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-violet-900"
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prompt内容
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={15}
                  className="resize-none font-mono text-sm"
                />
              </div>
            </div>
          ) : (
            // View Mode
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: getCategoryColor(prompt.category_id) }}
                >
                  {getCategoryName(prompt.category_id)}
                </span>
                {prompt.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {prompt.description && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">描述</h3>
                  <p className="text-slate-700">{prompt.description}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-3">
                  Prompt内容
                </h3>
                <div className="relative">
                  <pre className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm overflow-x-auto">
                    <code>{prompt.content}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="absolute top-2 right-2 h-8 w-8"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-500 pt-4 border-t">
                <span>使用次数: {prompt.usage_count}</span>
                <span>
                  最后更新: {new Date(prompt.updated_at).toLocaleDateString("zh-CN")}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">分享Prompt</h3>
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
                    {prompt?.is_public ? (
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

                {prompt?.is_public && (
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
                      任何人都可以通过此链接查看此Prompt
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
