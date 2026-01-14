"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Zap,
  Loader2,
  Copy,
  Share2,
  ArrowLeft,
  Calendar,
  TrendingUp,
  Lock,
  Unlock,
  Settings,
} from "lucide-react";
import Link from "next/link";

interface Skill {
  id: string;
  title: string;
  description: string;
  tags: string[];
  parameters?: Record<string, any>;
  examples?: any[];
  category?: {
    id: string;
    name: string;
    color: string;
    icon?: string;
  };
  usage_count: number;
  created_at: string;
}

export default function PublicSkillPage() {
  const params = useParams();
  const router = useRouter();
  const skillId = params.id as string;

  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSkill();
  }, [skillId]);

  async function loadSkill() {
    setLoading(true);
    try {
      const response = await fetch(`/api/public/skills/${skillId}`);
      const data = await response.json();

      if (response.ok) {
        setSkill(data.skill);
      } else {
        setError(data.error || "加载失败");
      }
    } catch (err) {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!skill) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(skill, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: skill?.title,
          text: skill?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share canceled");
      }
    } else {
      handleCopy();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-violet-600 animate-spin mb-4" />
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-amber-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">无法访问</h2>
            <p className="text-slate-500 mb-6">
              {error || "该 Skill 不存在或未公开分享"}
            </p>
            <Link href="/">
              <Button>返回首页</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-amber-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              分享
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <Unlock className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">公开分享</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-3">{skill.title}</h1>
          <p className="text-lg text-slate-600 mb-6">{skill.description}</p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(skill.created_at).toLocaleDateString("zh-CN")}
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              使用 {skill.usage_count} 次
            </div>
          </div>

          {/* Category & Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {skill.category && (
              <span
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: skill.category.color }}
              >
                {skill.category.name}
              </span>
            )}
            {skill.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Parameters */}
        {skill.parameters && Object.keys(skill.parameters).length > 0 && (
          <Card className="glass-card mb-6">
            <CardContent className="p-6">
              <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                参数配置
              </h2>
              <div className="grid gap-4">
                {Object.entries(skill.parameters).map(([key, value]) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-sm font-medium text-slate-700 sm:w-40">
                      {key}
                    </span>
                    <span className="text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded-lg flex-1">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Examples */}
        {skill.examples && skill.examples.length > 0 && (
          <Card className="glass-card mb-6">
            <CardContent className="p-6">
              <h2 className="font-semibold text-slate-900 mb-4">使用示例</h2>
              <div className="space-y-3">
                {skill.examples.map((example, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                      {typeof example === "string" ? example : JSON.stringify(example, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Copy JSON */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Skill 配置 (JSON)</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {copied ? "已复制" : "复制"}
              </Button>
            </div>
            <pre className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm overflow-x-auto">
              <code>{JSON.stringify(skill, null, 2)}</code>
            </pre>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm mb-4">
            由 Prompt Skills Manager 提供
          </p>
          <Link href="/signup">
            <Button variant="outline" className="rounded-xl">
              创建你的 Skills 库
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
