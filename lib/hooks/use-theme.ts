"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
export type AccentColor = "violet" | "blue" | "green" | "orange" | "pink";

const THEME_KEY = "theme";
const ACCENT_COLOR_KEY = "accentColor";

// Color mappings for CSS variables
const accentColors: Record<AccentColor, { primary: string; from: string; to: string }> = {
  violet: { primary: "#7C3AED", from: "#7C3AED", to: "#4F46E5" },
  blue: { primary: "#2563EB", from: "#2563EB", to: "#1D4ED8" },
  green: { primary: "#10B981", from: "#10B981", to: "#059669" },
  orange: { primary: "#F97316", from: "#F97316", to: "#EA580C" },
  pink: { primary: "#EC4899", from: "#EC4899", to: "#DB2777" },
};

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

function getStoredAccentColor(): AccentColor {
  if (typeof window === "undefined") return "violet";
  const stored = localStorage.getItem(ACCENT_COLOR_KEY);
  if (stored === "violet" || stored === "blue" || stored === "green" || stored === "orange" || stored === "pink") {
    return stored as AccentColor;
  }
  return "violet";
}

function applyTheme(theme: Theme) {
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
  const root = document.documentElement;

  if (resolvedTheme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

function applyAccentColor(color: AccentColor) {
  const root = document.documentElement;
  const colors = accentColors[color];

  root.style.setProperty("--accent-primary", colors.primary);
  root.style.setProperty("--accent-from", colors.from);
  root.style.setProperty("--accent-to", colors.to);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("system");
  const [accentColor, setAccentColorState] = useState<AccentColor>("violet");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = getStoredTheme();
    const savedAccent = getStoredAccentColor();
    setThemeState(savedTheme);
    setAccentColorState(savedAccent);
    setMounted(true);

    // Apply initial theme and accent color
    applyTheme(savedTheme);
    applyAccentColor(savedAccent);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
  };

  const setAccentColor = (newColor: AccentColor) => {
    setAccentColorState(newColor);
    localStorage.setItem(ACCENT_COLOR_KEY, newColor);
    applyAccentColor(newColor);
  };

  return {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    mounted,
  };
}
