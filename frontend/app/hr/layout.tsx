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
            <div className="flex flex-1 min-h-0">
                <AppSidebar />
                <div className="flex-1 flex flex-col min-h-0">
                    <SidebarInset>
                        <Header />
                        <main className="flex-1 min-h-0">{children}</main>
                    </SidebarInset>
                </div>
            </div>
        </SidebarProvider>
    )
}
