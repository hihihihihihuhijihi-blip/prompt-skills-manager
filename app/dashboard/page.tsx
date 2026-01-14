import { Card, CardContent } from "@/components/ui/card";
import { FileText, Zap, Folder, TrendingUp, ArrowUpRight, Sparkles, Clock } from "lucide-react";
import Link from "next/link";
import { fetchDashboardStats } from "@/lib/api/client";

// Helper to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "刚刚";
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays === 1) return "昨天";
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString("zh-CN");
}

// Helper to format usage count
function formatUsageCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

// Helper to get color gradient based on index
function getColorGradient(index: number): string {
  const gradients = [
    "from-violet-500 to-purple-500",
    "from-pink-500 to-rose-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
  ];
  return gradients[index % gradients.length];
}

export default async function DashboardPage() {
  // Fetch real data from API
  let stats = {
    promptsCount: 0,
    skillsCount: 0,
    categoriesCount: 11,
    usageCount: 0,
    recentPrompts: [],
    recentSkills: [],
  };

  try {
    stats = await fetchDashboardStats();
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    // Will show zero values
  }

  // Combine recent items
  const recentItems = [
    ...stats.recentPrompts.map((p) => ({
      id: p.id,
      title: p.title,
      time: formatRelativeTime(p.created_at),
      type: "prompt" as const,
      usage: p.usage_count,
    })),
    ...stats.recentSkills.map((s) => ({
      id: s.id,
      title: s.title,
      time: formatRelativeTime(s.created_at),
      type: "skill" as const,
      usage: s.usage_count,
    })),
  ]
    .sort((a, b) => b.usage - a.usage)
    .slice(0, 5);

  // Get top prompts for featured section
  const topPrompts = stats.recentPrompts.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            欢迎回来 👋
          </h1>
          <p className="text-slate-500 mt-1">
            这是你的 AI Prompt与 Skills 管理中心
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">实时数据</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Prompt总数"
          value={stats.promptsCount.toString()}
          change=""
          icon={FileText}
          color="from-violet-500 to-purple-500"
          trend="neutral"
        />
        <StatCard
          title="Skills 总数"
          value={stats.skillsCount.toString()}
          change=""
          icon={Zap}
          color="from-amber-500 to-orange-500"
          trend="neutral"
        />
        <StatCard
          title="分类数量"
          value={stats.categoriesCount.toString()}
          change=""
          icon={Folder}
          color="from-emerald-500 to-teal-500"
          trend="neutral"
        />
        <StatCard
          title="使用次数"
          value={formatUsageCount(stats.usageCount)}
          change=""
          icon={TrendingUp}
          color="from-blue-500 to-cyan-500"
          trend="neutral"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">快速开始</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <QuickActionCard
              href="/dashboard/prompts/new"
              title="创建Prompt"
              description="创建一个新的 AI Prompt模板"
              icon={FileText}
              color="from-violet-500 to-purple-500"
            />
            <QuickActionCard
              href="/dashboard/skills/new"
              title="创建 Skills"
              description="定义一个新的 AI Skill"
              icon={Zap}
              color="from-amber-500 to-orange-500"
            />
          </div>

          {/* Featured Prompts - show if data exists */}
          {topPrompts.length > 0 && (
            <>
              <div className="flex items-center justify-between pt-4">
                <h2 className="text-lg font-bold text-slate-900">最新Prompt</h2>
                <Link href="/dashboard/prompts" className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
                  查看全部
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topPrompts.map((prompt, index) => (
                  <FeaturedPromptCard
                    key={prompt.id}
                    title={prompt.title}
                    description={prompt.description || "无描述"}
                    tags={prompt.tags}
                    usage={formatUsageCount(prompt.usage_count)}
                    color={getColorGradient(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">最近活动</h2>
            <Link href="/dashboard/prompts" className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
              查看全部
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <Card className="glass-card">
            <CardContent className="p-4">
              {recentItems.length > 0 ? (
                <div className="space-y-4">
                  {recentItems.map((item, index) => (
                    <Link
                      key={item.id}
                      href={item.type === "prompt" ? `/dashboard/prompts` : `/dashboard/skills`}
                    >
                      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                          item.type === "prompt"
                            ? "bg-gradient-to-br from-violet-500 to-purple-500"
                            : "bg-gradient-to-br from-amber-500 to-orange-500"
                        }`}>
                          {item.type === "prompt" ? (
                            <FileText className="h-4 w-4 text-white" />
                          ) : (
                            <Zap className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate group-hover:text-violet-600 transition-colors">{item.title}</p>
                          <p className="text-xs text-slate-500">{item.time}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无活动</p>
                  <p className="text-xs mt-1">创建你的第一个Prompt或 Skill 吧！</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Empty state when no data */}
      {stats.promptsCount === 0 && stats.skillsCount === 0 && (
        <div className="text-center py-16">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg mx-auto mb-4">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">开始你的创作之旅</h2>
          <p className="text-slate-500 mb-6">创建你的第一个 AI Prompt或 Skill</p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard/prompts/new" className="btn-primary px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2">
              <FileText className="h-4 w-4" />
              创建Prompt
            </Link>
            <Link href="/dashboard/skills/new" className="btn-secondary px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2">
              <Zap className="h-4 w-4" />
              创建 Skills
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string;
  change: string;
  icon: any;
  color: string;
  trend: "up" | "down" | "neutral";
}) {
  return (
    <Card className="glass-card card-hover overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            {change && (
              <div className={`flex items-center gap-1 text-xs font-medium ${
                trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-slate-500"
              }`}>
                {change}
              </div>
            )}
          </div>
          <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({
  href,
  title,
  description,
  icon: Icon,
  color,
}: {
  href: string;
  title: string;
  description: string;
  icon: any;
  color: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="glass-card card-hover h-full">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function FeaturedPromptCard({
  title,
  description,
  tags,
  usage,
  color,
}: {
  title: string;
  description: string;
  tags: string[];
  usage: string;
  color: string;
}) {
  return (
    <Link href="/dashboard/prompts">
      <Card className="glass-card card-hover group cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">{title}</h3>
              <p className="text-sm text-slate-500 mt-1 line-clamp-1">{description}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {tags.slice(0, 2).map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
            <span className="text-xs text-slate-500">{usage} 次</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
