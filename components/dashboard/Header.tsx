"use client";

import { Bell, Search, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/SessionProvider";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  function getUserInitial() {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  }

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

        {user ? (
          <>
            <button className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors relative">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* User Avatar */}
            <div
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200"
              title={user.email}
            >
              <span className="text-white font-semibold text-sm">
                {getUserInitial()}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-600 hover:text-red-600"
              title="退出登录"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogOut className="h-5 w-5" />
              )}
            </button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              className="h-10 px-4 rounded-xl font-medium text-sm"
              onClick={() => router.push("/login")}
            >
              登录
            </Button>
            <Button
              className="btn-primary h-10 px-4 rounded-xl font-medium text-sm"
              onClick={() => router.push("/signup")}
            >
              注册
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
