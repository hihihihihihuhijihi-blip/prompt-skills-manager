import Link from "next/link";
import { Sparkles, Zap, ArrowRight, Bot, Lightbulb, FileText, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-400/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Prompt Manager
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              登录
            </Link>
            <Link href="/signup" className="btn-primary px-5 py-2.5 rounded-xl font-medium">
              免费注册
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 px-6 lg:px-12 pt-16 lg:pt-24 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100/50 border border-violet-200/50 text-violet-700 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                <span>AI Prompt管理平台</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                <span className="text-slate-900">管理你的</span>
                <br />
                <span className="gradient-text">AI Prompt</span>
                <br />
                <span className="text-slate-900">与 Skills</span>
              </h1>

              <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                一个专业的平台，帮助你组织、管理和优化所有 AI Prompt和 Skills。
                版本控制、分类标签、导入导出，一切尽在掌握。
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/signup" className="btn-primary px-8 py-4 rounded-2xl font-semibold text-lg inline-flex items-center gap-2">
                  免费开始
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/login" className="btn-secondary px-8 py-4 rounded-2xl font-semibold text-lg">
                  登录账号
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-8 border-t border-slate-200">
                <div>
                  <div className="text-3xl font-bold gradient-text">10K+</div>
                  <div className="text-sm text-slate-500">活跃用户</div>
                </div>
                <div>
                  <div className="text-3xl font-bold gradient-text">50K+</div>
                  <div className="text-sm text-slate-500">Prompt管理</div>
                </div>
                <div>
                  <div className="text-3xl font-bold gradient-text">99%</div>
                  <div className="text-sm text-slate-500">满意度</div>
                </div>
              </div>
            </div>

            {/* Right Content - Feature Cards */}
            <div className="relative">
              <div className="grid gap-4">
                {/* Top Card */}
                <div className="glass-card p-6 rounded-3xl card-hover animate-float">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">智能Prompt</h3>
                      <p className="text-sm text-slate-500">使用 AI 优化和改进你的Prompt</p>
                    </div>
                  </div>
                </div>

                {/* Middle Card */}
                <div className="glass-card p-6 rounded-3xl card-hover ml-8">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                      <Lightbulb className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">Skills 库</h3>
                      <p className="text-sm text-slate-500">构建可复用的 AI Skills 集合</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Cards */}
                <div className="grid grid-cols-2 gap-4 ml-4">
                  <div className="glass-card p-5 rounded-3xl card-hover">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg mb-3">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">版本控制</h3>
                    <p className="text-xs text-slate-500">追踪所有变更</p>
                  </div>
                  <div className="glass-card p-5 rounded-3xl card-hover">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg mb-3">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">数据分析</h3>
                    <p className="text-xs text-slate-500">洞察使用情况</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 px-6 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              强大的功能，<span className="gradient-text">简单易用</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              无论是个人开发者还是团队协作，Prompt Manager 都能满足你的需求
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="快速创建"
              description="直观的编辑器，轻松创建和管理Prompt模板"
              color="from-violet-500 to-purple-500"
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              title="智能分类"
              description="灵活的标签和分类系统，让内容井井有条"
              color="from-amber-500 to-orange-500"
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="数据分析"
              description="详细的使用统计和分析报告，了解效果如何"
              color="from-emerald-500 to-teal-500"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-8 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
          © 2025 Prompt Manager. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className="glass-card p-8 rounded-3xl card-hover text-center">
      <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mx-auto mb-6`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
