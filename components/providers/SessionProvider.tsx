"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const STORAGE_KEY = "prompt-skills-manager-session";

interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string; requireConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Fetch session on mount
  useEffect(() => {
    setMounted(true);
    loadSession();
  }, []);

  async function loadSession() {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const session = JSON.parse(stored);
          setUser(session.user);
          setAccessToken(session.access_token);
        }
      }
    } catch (error) {
      console.error("Failed to load session:", error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        return { success: false, error: data.error || `登录失败 (${response.status})` };
      }

      const data = await response.json();

      // Store session in localStorage
      if (typeof window !== "undefined") {
        const sessionData = {
          user: data.user,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
      }

      setUser(data.user);
      setAccessToken(data.session.access_token);
      return { success: true };
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: "网络错误，请检查网络连接后重试" };
    }
  }

  async function signUp(email: string, password: string, name?: string) {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const data = await response.json();
        return { success: false, error: data.error || `注册失败 (${response.status})` };
      }

      const data = await response.json();

      if (data.requireConfirmation) {
        return { success: true, requireConfirmation: true };
      }

      // Store session if available
      if (data.session && typeof window !== "undefined") {
        const sessionData = {
          user: data.user,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
        setUser(data.user);
        setAccessToken(data.session.access_token);
      }

      return { success: true };
    } catch (error) {
      console.error("Sign up error:", error);
      return { success: false, error: "网络错误，请检查网络连接后重试" };
    }
  }

  async function signOut() {
    try {
      if (accessToken) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
      setUser(null);
      setAccessToken(null);
    }
  }

  async function refreshSession() {
    await loadSession();
  }

  // Don't render children until mounted on client
  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
