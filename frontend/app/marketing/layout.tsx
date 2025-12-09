"use client";

import type React from "react"
import { AppSidebar } from "@/components/marketing/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/marketing/dashboard-header"
import { usePathname } from "next/navigation"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/marketing/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex flex-1 min-h-0">
        <AppSidebar />
        <SidebarInset>
            <DashboardHeader />
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
