import type { Metadata } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Prompt Skills Manager",
  description: "管理你的 AI Prompt和 Skills",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}
