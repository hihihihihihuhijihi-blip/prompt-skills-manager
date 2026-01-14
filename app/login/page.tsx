"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/providers/SessionProvider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.push(redirect);
    }
  }, [user, router, searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn(email, password);
      if (result.success) {
        const redirect = searchParams.get("redirect") || "/dashboard";
        router.push(redirect);
        router.refresh();
      } else {
        setError(result.error || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">欢迎回来</h1>
          <p className="text-slate-500 mt-2">登录到 Prompt Skills Manager</p>
        </div>

        {/* Login Form */}
        <Card className="glass-card border-0 shadow-xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  邮箱地址
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-11 h-12"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-11 h-12"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 btn-primary text-base font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    登录中...
                  </>
                ) : (
                  <>
                    登录
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-sm text-slate-400">或</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Signup Link */}
            <p className="text-center text-slate-600">
              还没有账号？
              <Link
                href="/signup"
                className="ml-1 text-violet-600 hover:text-violet-700 font-medium"
              >
                立即注册
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-amber-50 flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
