"use client";
import type React from "react"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/hr/hrSideBar"
import { Header } from "@/components/ui/header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const sidebarPaths = [
    "/hr/dashboard",
    "/hr/manageJob",
    "/hr/manageApplyJob",
    "/hr/manageCandidate"
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const showSidebar = sidebarPaths.some(path => pathname === path || pathname.startsWith(path + "/"));

    return (
        <SidebarProvider>
            <div className="flex flex-1 min-h-0 w-full max-w-full">
                {showSidebar && <AppSidebar />}
                <div className="flex-1 flex flex-col min-h-0 w-full max-w-full overflow-x-auto">
                    <SidebarInset>
                        <Header />
                        <main className="flex-1 min-h-0 w-full max-w-full overflow-x-auto">{children}</main>
                    </SidebarInset>
                </div>
            </div>
        </SidebarProvider>
    )
}
