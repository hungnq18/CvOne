"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/ui/header";
import FooterWrapper from "@/components/ui/footer-wrapper";

interface ConditionalLayoutProps {
  children: React.ReactNode;
  role: string | null;
}

export default function ConditionalLayout({
  children,
  role,
}: ConditionalLayoutProps) {
  const pathname = usePathname();
  // Hide header/footer for admin/marketing login and dashboard roles
  const isAuthPage = pathname?.startsWith("/admin/login") || pathname?.startsWith("/marketing/login");
  const isDashboard = role === "admin" || role === "mkt";

  if (isDashboard || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 min-h-0">{children}</main>
      <FooterWrapper />
    </div>
  );
}
