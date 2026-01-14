"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Palette, Shield, Loader2, ChevronRight, ChevronDown, AlertTriangle } from "lucide-react";
import { useAuth } from "@/components/providers/SessionProvider";
import { useTheme } from "@/lib/hooks/use-theme";

type SettingsTab = "profile" | "notifications" | "appearance" | "privacy";

const TABS = [
  { id: "profile" as const, label: "个人资料", icon: User },
  { id: "notifications" as const, label: "通知", icon: Bell },
  { id: "appearance" as const, label: "外观", icon: Palette },
  { id: "privacy" as const, label: "隐私与安全", icon: Shield },
];

export default function SettingsPage() {
  const { user, refreshSession } = useAuth();
  const { theme, setTheme, accentColor, setAccentColor, mounted: themeMounted } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  // Danger zone collapse state
  const [dangerZoneExpanded, setDangerZoneExpanded] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  async function handleSaveProfile() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        setMessage("个人资料已更新");
        await refreshSession();
      } else {
        const data = await response.json();
        setMessage(data.error || "更新失败");
      }
    } catch (error) {
      setMessage("网络错误，请稍后重试");
    } finally {
      setSaving(false);
    }
  }

  function getUserInitial() {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-slate-900">
          设置
        </h1>
        <p className="font-body text-slate-600 mt-1">
          管理你的账户和应用设置
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  isActive
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <ChevronRight className={`h-4 w-4 ml-auto transition-transform ${
                  isActive ? "opacity-100" : "opacity-0"
                }`} />
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>个人资料</CardTitle>
                  <CardDescription>更新你的个人信息</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">{getUserInitial()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user.name || "未设置姓名"}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">姓名</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="你的姓名"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">邮箱</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="bg-slate-50"
                      />
                      <p className="text-xs text-slate-500">邮箱地址无法修改</p>
                    </div>

                    {message && (
                      <p className={`text-sm ${message.includes("失败") ? "text-red-600" : "text-green-600"}`}>
                        {message}
                      </p>
                    )}

                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          保存中...
                        </>
                      ) : (
                        "保存更改"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  onClick={() => setDangerZoneExpanded(!dangerZoneExpanded)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors rounded-t-xl"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-slate-400 dark:text-slate-600" />
                    <div>
                      <CardTitle className="text-slate-600 dark:text-slate-500 text-base">危险区域</CardTitle>
                      <CardDescription className="text-slate-400 dark:text-slate-600">不可逆操作</CardDescription>
                    </div>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-slate-400 dark:text-slate-600 transition-transform ${
                    dangerZoneExpanded ? "rotate-180" : ""
                  }`} />
                </button>
                {dangerZoneExpanded && (
                  <CardContent className="px-6 pb-6 pt-2 space-y-4">
                    <Separator className="bg-slate-200 dark:bg-slate-800" />
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-300">删除所有数据</p>
                        <p className="text-sm text-slate-500 dark:text-slate-500">永久删除你的所有Prompt和 Skills</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/50 hover:border-red-300 dark:hover:border-red-800">
                        删除所有数据
                      </Button>
                    </div>
                    <Separator className="bg-slate-200 dark:bg-slate-800" />
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-300">删除账户</p>
                        <p className="text-sm text-slate-500 dark:text-slate-500">永久删除你的账户和所有数据</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/50 hover:border-red-300 dark:hover:border-red-800">
                        删除账户
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            </>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>通知设置</CardTitle>
                <CardDescription>选择你想接收的通知类型</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">邮件通知</p>
                    <p className="text-sm text-slate-500">接收重要更新的邮件通知</p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">每周摘要</p>
                    <p className="text-sm text-slate-500">每周接收你的Prompt和Skills使用统计</p>
                  </div>
                  <Switch
                    checked={weeklyDigest}
                    onCheckedChange={setWeeklyDigest}
                  />
                </div>

                <Separator />

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">
                    🔔 通知功能正在开发中，敬请期待更多通知选项。
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>外观设置</CardTitle>
                <CardDescription>自定义应用的外观</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>主题</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { id: "light", label: "浅色", desc: "默认浅色主题" },
                      { id: "dark", label: "深色", desc: "深色主题" },
                      { id: "system", label: "跟随系统", desc: "自动切换" },
                    ] as const).map((themeOption) => (
                      <button
                        key={themeOption.id}
                        onClick={() => setTheme(themeOption.id)}
                        style={theme === themeOption.id ? {
                          borderColor: accentColor === "violet" ? "#7C3AED" :
                                     accentColor === "blue" ? "#2563EB" :
                                     accentColor === "green" ? "#10B981" :
                                     accentColor === "orange" ? "#F97316" :
                                     accentColor === "pink" ? "#EC4899" : "#7C3AED",
                          backgroundColor: accentColor === "violet" ? "#F5F3FF" :
                                     accentColor === "blue" ? "#EFF6FF" :
                                     accentColor === "green" ? "#ECFDF5" :
                                     accentColor === "orange" ? "#FFF7ED" :
                                     accentColor === "pink" ? "#FDF2F8" : "#F5F3FF"
                        } : {}}
                        className="p-4 rounded-xl border-2 text-left transition-all border-slate-200 hover:border-slate-300"
                      >
                        <p className="font-medium text-slate-900">{themeOption.label}</p>
                        <p className="text-xs text-slate-500 mt-1">{themeOption.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>主题色</Label>
                  <div className="flex gap-3">
                    {[
                      { id: "violet", label: "紫色", color: "bg-violet-500" },
                      { id: "blue", label: "蓝色", color: "bg-blue-500" },
                      { id: "green", label: "绿色", color: "bg-green-500" },
                      { id: "orange", label: "橙色", color: "bg-orange-500" },
                      { id: "pink", label: "粉色", color: "bg-pink-500" },
                    ].map((colorOption) => (
                      <button
                        key={colorOption.id}
                        onClick={() => setAccentColor(colorOption.id)}
                        className={`w-12 h-12 rounded-xl ${colorOption.color} ${
                          accentColor === colorOption.id
                            ? "ring-2 ring-offset-2 ring-slate-400"
                            : ""
                        }`}
                        title={colorOption.label}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <Card>
              <CardHeader>
                <CardTitle>隐私与安全</CardTitle>
                <CardDescription>管理你的隐私和安全设置</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                    <div>
                      <p className="font-medium text-slate-900">公开分享</p>
                      <p className="text-sm text-slate-500">允许将Prompt和Skills设为公开分享</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                    <div>
                      <p className="font-medium text-slate-900">数据导出</p>
                      <p className="text-sm text-slate-500">导出你的所有数据</p>
                    </div>
                    <Button variant="outline" size="sm">
                      导出
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">
                    🔒 隐私和安全功能正在开发中。
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
