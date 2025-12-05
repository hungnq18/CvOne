"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

type MenuItem = {
  title: string
  url: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

interface DashboardSidebarSharedProps
  extends React.ComponentProps<typeof Sidebar> {
  menuItems: MenuItem[]
}

export function DashboardSidebarShared({
  menuItems,
  ...props
}: DashboardSidebarSharedProps) {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border bg-slate-800">
      </SidebarHeader>
      <SidebarContent className="bg-slate-800 text-slate-200">
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                MENU
              </p>
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
                      <Link
                        href={item.url}
                        className="flex items-center gap-3 px-3 py-2"
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border px-4 py-3 bg-slate-800">
        <div className="flex items-center justify-center flex-col gap-2 text-[11px] text-white">
          <span className="text-center">© 2025 CV One Team</span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

