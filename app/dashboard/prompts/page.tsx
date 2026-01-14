"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Grid, List, Sparkles, Star, TrendingUp, Loader2, Filter, X, SlidersHorizontal } from "lucide-react";
import { fetchPrompts, fetchCategories, fetchTags, type Prompt, type Category } from "@/lib/api/client";

type ViewMode = "grid" | "list";

export default function PromptsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadPrompts();
  }, [selectedCategory, selectedTags, favoriteOnly]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [promptsData, categoriesData, tagsData] = await Promise.all([
        fetchPrompts({ limit: 50 }),
        fetchCategories("prompt"),
        fetchTags(),
      ]);
      console.log("Loaded prompts:", promptsData.prompts);

      // Validate all prompt IDs
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validPrompts = promptsData.prompts.filter(p => p.id && uuidRegex.test(p.id));
      const invalidPrompts = promptsData.prompts.filter(p => !p.id || !uuidRegex.test(p.id));

      if (invalidPrompts.length > 0) {
        console.error("Found prompts with invalid IDs:", invalidPrompts);
      }

      console.log(`Loaded ${validPrompts.length} valid prompts out of ${promptsData.prompts.length} total`);
      setPrompts(validPrompts);
      setTotal(validPrompts.length);
      setCategories(categoriesData);
      setAvailableTags(tagsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPrompts(search?: string) {
    try {
      const result = await fetchPrompts({
        search: search || searchQuery,
        category: selectedCategory,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        favorite: favoriteOnly,
        limit: 50,
      });

      // Validate all prompt IDs
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validPrompts = result.prompts.filter(p => p.id && uuidRegex.test(p.id));
      const invalidPrompts = result.prompts.filter(p => !p.id || !uuidRegex.test(p.id));

      if (invalidPrompts.length > 0) {
        console.error("Found prompts with invalid IDs:", invalidPrompts);
      }

      setPrompts(validPrompts);
      setTotal(validPrompts.length);
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
    }
  }

  function handleSearch(value: string) {
    setSearchQuery(value);
    loadPrompts(value);
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function clearFilters() {
    setSelectedCategory("");
    setSelectedTags([]);
    setFavoriteOnly(false);
    setSearchQuery("");
    loadPrompts("");
  }

  function hasActiveFilters() {
    return selectedCategory || selectedTags.length > 0 || favoriteOnly || searchQuery;
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Prompt库
          </h1>
          <p className="text-slate-500 mt-1">
            管理和组织你的 AI Prompt模板
            {!loading && <span className="ml-2 text-violet-600">({total} 个)</span>}
          </p>
        </div>
        <Link href="/dashboard/prompts/new">
          <Button className="btn-primary h-11 px-6 rounded-xl font-medium">
            <Plus className="h-4 w-4" />
            新建Prompt
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="搜索Prompt..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-11"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`h-11 px-4 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                showAdvanced || hasActiveFilters()
                  ? "bg-violet-100 text-violet-700"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              筛选
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-violet-100 text-violet-700"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-violet-100 text-violet-700"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <Card className="glass-card">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">高级筛选</h3>
                {hasActiveFilters() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    清除全部
                  </Button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  分类
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">全部分类</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    标签
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.slice(0, 20).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedTags.includes(tag)
                            ? "bg-violet-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorite Filter */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFavoriteOnly(!favoriteOnly)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    favoriteOnly
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Star className={`h-4 w-4 ${favoriteOnly ? "fill-amber-500" : ""}`} />
                  只看收藏
                </button>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters() && (
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
                  <span className="text-sm text-slate-500">已选:</span>
                  {selectedCategory && (
                    <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium flex items-center gap-1">
                      {getCategoryName(selectedCategory)}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setSelectedCategory("")}
                      />
                    </span>
                  )}
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium flex items-center gap-1"
                    >
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      />
                    </span>
                  ))}
                  {favoriteOnly && (
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium flex items-center gap-1">
                      收藏
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setFavoriteOnly(false)}
                      />
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-violet-600 animate-spin mb-4" />
          <p className="text-slate-500">加载中...</p>
        </div>
      ) : prompts.length > 0 ? (
        <>
          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {prompts
                .filter(p => p.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.id))
                .map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  {...prompt}
                  categoryName={getCategoryName(prompt.category_id)}
                  categoryColor={getCategoryColor(prompt.category_id)}
                />
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="space-y-3">
              {prompts
                .filter(p => p.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.id))
                .map((prompt) => (
                <PromptListItem
                  key={prompt.id}
                  {...prompt}
                  categoryName={getCategoryName(prompt.category_id)}
                  categoryColor={getCategoryColor(prompt.category_id)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-20">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg mx-auto mb-4">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">暂无Prompt</h2>
          <p className="text-slate-500 mb-6">创建你的第一个 AI Prompt模板吧！</p>
          <Link href="/dashboard/prompts/new">
            <Button className="btn-primary h-11 px-6 rounded-xl font-medium">
              <Plus className="h-4 w-4" />
              创建Prompt
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function PromptCard(prompt: Prompt & { categoryName?: string; categoryColor?: string }) {
  // Validate ID before rendering
  if (!prompt.id) {
    console.error("PromptCard: Invalid prompt ID", prompt);
    return null;
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(prompt.id)) {
    console.error("PromptCard: Invalid UUID format", prompt.id);
    return null;
  }

  return (
    <Card className="glass-card card-hover group cursor-pointer">
      <a href={`/dashboard/prompts/${prompt.id}`} className="block">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 group-hover:text-violet-600 transition-colors truncate">
                  {prompt.title}
                </h3>
              </div>
              <span
                className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-1"
                style={{ backgroundColor: prompt.categoryColor || "#94A3B8" }}
              >
                {prompt.categoryName || "未分类"}
              </span>
              <p className="text-sm text-slate-500 line-clamp-2">
                {prompt.description || "无描述"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {prompt.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                {tag}
              </span>
            ))}
            {prompt.tags.length === 0 && (
              <span className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-400 text-xs">
                无标签
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {new Date(prompt.created_at).toLocaleDateString("zh-CN")}
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <TrendingUp className="h-3 w-3" />
                {prompt.usage_count} 次
              </div>
              <button className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
                <Star className={`h-4 w-4 ${prompt.is_favorite ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
              </button>
            </div>
          </div>
        </CardContent>
      </a>
    </Card>
  );
}

function PromptListItem(prompt: Prompt & { categoryName?: string; categoryColor?: string }) {
  // Validate ID before rendering
  if (!prompt.id) {
    console.error("PromptListItem: Invalid prompt ID", prompt);
    return null;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(prompt.id)) {
    console.error("PromptListItem: Invalid UUID format", prompt.id);
    return null;
  }

  return (
    <Card className="glass-card card-hover group cursor-pointer">
      <a href={`/dashboard/prompts/${prompt.id}`} className="block">
        <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">
                {prompt.title}
              </h3>
              <span
                className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white"
                style={{ backgroundColor: prompt.categoryColor || "#94A3B8" }}
              >
                {prompt.categoryName || "未分类"}
              </span>
              <div className="flex gap-1">
                {prompt.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-1 line-clamp-1">
              {prompt.description || "无描述"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">
              {new Date(prompt.created_at).toLocaleDateString("zh-CN")}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <TrendingUp className="h-3 w-3" />
              {prompt.usage_count} 次
            </div>
            <button className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
              <Star className={`h-4 w-4 ${prompt.is_favorite ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
            </button>
          </div>
        </div>
        </CardContent>
      </a>
    </Card>
  );
}
