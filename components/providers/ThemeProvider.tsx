"use client";

import { useEffect } from "react";

// This script runs before the page renders to prevent flash of wrong theme
const themeScript = `
  (function() {
    const theme = localStorage.getItem('theme') || 'system';
    const accentColor = localStorage.getItem('accentColor') || 'violet';

    // Apply accent color
    const accentColors = {
      violet: { primary: '#7C3AED', from: '#7C3AED', to: '#4F46E5' },
      blue: { primary: '#2563EB', from: '#2563EB', to: '#1D4ED8' },
      green: { primary: '#10B981', from: '#10B981', to: '#059669' },
      orange: { primary: '#F97316', from: '#F97316', to: '#EA580C' },
      pink: { primary: '#EC4899', from: '#EC4899', to: '#DB2777' },
    };

    const colors = accentColors[accentColor] || accentColors.violet;
    document.documentElement.style.setProperty('--accent-primary', colors.primary);
    document.documentElement.style.setProperty('--accent-from', colors.from);
    document.documentElement.style.setProperty('--accent-to', colors.to);

    // Apply theme
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  })();
`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const theme = localStorage.getItem("theme") || "system";
      if (theme === "system") {
        if (mediaQuery.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return <>{children}</>;
}

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
