"use client";

import { Bell, Search } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6">
      {/* Left side - Logo & Mobile menu button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden h-10 w-10 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Right side - Search & Actions */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        {/* Search - 自适应宽度 */}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="搜索..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-100/50 border border-slate-200/50 focus:bg-white focus:border-violet-300 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-sm"
            />
          </div>
        </div>

        {/* Notification */}
        <button className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors relative">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User Avatar - Guest Mode */}
        <div
          className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200"
          title="访客模式"
        >
          <span className="text-white font-semibold text-sm">U</span>
        </div>
      </div>
    </header>
  );
}
