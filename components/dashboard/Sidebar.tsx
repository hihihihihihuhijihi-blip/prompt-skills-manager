"use client";

import Link from "next/link";
import { FileText, Zap, Folder, Tag, Import, Settings, Home, Sparkles } from "lucide-react";

interface SidebarProps {
  className?: string;
}

const navItems = [
  {
    title: "概览",
    href: "/dashboard",
    icon: Home,
    color: "from-violet-500 to-purple-500",
  },
  {
    title: "Prompt",
    href: "/dashboard/prompts",
    icon: FileText,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Skills",
    href: "/dashboard/skills",
    icon: Zap,
    color: "from-amber-500 to-orange-500",
  },
  {
    title: "分类",
    href: "/dashboard/categories",
    icon: Folder,
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "标签",
    href: "/dashboard/tags",
    icon: Tag,
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "导入导出",
    href: "/dashboard/import-export",
    icon: Import,
    color: "from-indigo-500 to-violet-500",
  },
  {
    title: "设置",
    href: "/dashboard/settings",
    icon: Settings,
    color: "from-slate-500 to-slate-600",
  },
];

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside
      className={`flex h-screen w-72 flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200/50 ${className || ""}`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Prompt Manager
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navItems.map((item, index) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            title={item.title}
            color={item.color}
            delay={index * 50}
          />
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-100">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100/50 hover:shadow-md transition-all duration-200 group"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-semibold">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">用户</p>
            <p className="text-xs text-slate-500 truncate">访客模式</p>
          </div>
          <Settings className="h-4 w-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
        </Link>
      </div>
    </aside>
  );
}

function NavLink({
  href,
  icon: Icon,
  title,
  color,
  delay,
}: {
  href: string;
  icon: any;
  title: string;
  color: string;
  delay: number;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-200`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <span className="font-medium">{title}</span>
    </Link>
  );
}
