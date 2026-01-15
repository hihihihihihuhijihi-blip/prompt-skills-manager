"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/components/providers/SessionProvider";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
