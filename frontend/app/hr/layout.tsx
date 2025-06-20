import type React from "react"
import { AppSidebar } from "@/components/hr/hrSideBar"
import { DashboardHeader } from "@/components/hr/hrDashHeader"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <DashboardHeader />
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
