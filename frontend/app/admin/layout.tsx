import type React from "react"
import { AppSidebar } from "@/components/admin/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/admin/dashboard-header"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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