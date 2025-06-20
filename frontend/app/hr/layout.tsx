import type React from "react"
import { AppSidebar } from "@/components/hr/hrSideBar"
import { Header } from "@/components/ui/header"
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
                <Header />
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
