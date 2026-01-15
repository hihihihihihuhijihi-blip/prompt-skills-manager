"use client";

import { createContext, useContext, useState, ReactNode } from "react";

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
  const [loading, setLoading] = useState(false);

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
      }

      return { success: true };
    } catch (error) {
      console.error("Sign up error:", error);
      return { success: false, error: "网络错误，请检查网络连接后重试" };
    }
  }

  async function signOut() {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setUser(null);
    }
  }

  async function refreshSession() {
    // No-op
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
