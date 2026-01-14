"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tag, Plus, X, Loader2 } from "lucide-react";
import { fetchTags } from "@/lib/api/client";

export default function TagsPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadTags();
  }, []);

  async function loadTags() {
    setLoading(true);
    try {
      const data = await fetchTags();
      setTags(data);
    } catch (error) {
      console.error("Failed to load tags:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTag() {
    if (!newTag.trim()) return;

    setSaving(true);
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTag.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setTags([...tags, data.tag]);
        setNewTag("");
        setShowDialog(false);
      } else {
        const data = await response.json();
        alert(data.error || "创建失败");
      }
    } catch (error) {
      console.error("Failed to create tag:", error);
      alert("网络错误，请稍后重试");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTag(tag: string) {
    if (!confirm(`确定要删除标签"${tag}"吗？`)) return;

    try {
      const response = await fetch(`/api/tags/${encodeURIComponent(tag)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTags(tags.filter((t) => t !== tag));
      } else {
        const data = await response.json();
        alert(data.error || "删除失败");
      }
    } catch (error) {
      console.error("Failed to delete tag:", error);
      alert("网络错误，请稍后重试");
    }
  }

  const filteredTags = searchQuery
    ? tags.filter((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    : tags;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">标签管理</h1>
          <p className="text-slate-500 mt-1">管理和查看所有标签</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          新建标签
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          type="search"
          placeholder="搜索标签..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
        </div>
      ) : filteredTags.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Tag className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                {searchQuery ? "未找到匹配的标签" : "暂无标签"}
              </h3>
              <p className="text-slate-500 mt-1">
                {searchQuery ? "尝试其他搜索关键词" : "标签会在创建Prompt或 Skill 时自动生成"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              {filteredTags.map((tag) => (
                <span
                  key={tag}
                  className="group inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-medium hover:bg-violet-200 transition-colors"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                  <button
                    onClick={() => handleDeleteTag(tag)}
                    className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-4">
              共 {filteredTags.length} 个标签
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Tag Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full !bg-white">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">新建标签</h3>
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="输入标签名称"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateTag();
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDialog(false);
                    setNewTag("");
                  }}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  onClick={handleCreateTag}
                  disabled={saving || !newTag.trim()}
                  className="flex-1 btn-primary"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "创建"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
