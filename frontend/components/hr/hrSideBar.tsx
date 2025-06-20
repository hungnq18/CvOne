"use client"

import type * as React from "react"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, FileText, Mail } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"

// Menu items với đường dẫn thực tế
const menuItems = [
    {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Manage User",
        url: "/admin/users",
        icon: Users,
    },
    {
        title: "Manage CV Template",
        url: "/admin/cv-templates",
        icon: FileText,
    },
    {
        title: "Manage CL Template",
        url: "/admin/cl-templates",
        icon: Mail,
    },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

    return (
        <Sidebar className="border-r-0" {...props}>
            <SidebarHeader className="h-16 border-b border-sidebar-border">
                <div className="flex items-center gap-2 px-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
                        <LayoutDashboard className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xl font-bold text-sidebar-foreground">TailAdmin</span>
                </div>
            </SidebarHeader>
            <SidebarContent className="bg-slate-800 text-slate-200">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <div className="px-3 py-2">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">MENU</p>
                        </div>
                        <SidebarMenu>
                            {menuItems.map((item) => {
                                const isActive = pathname === item.url
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            className="text-slate-200 hover:bg-slate-700 hover:text-white data-[active=true]:bg-blue-600 data-[active=true]:text-white"
                                        >
                                            <a href={item.url} className="flex items-center gap-3 px-3 py-2">
                                                <item.icon className="h-5 w-5" />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
