"use client"

import type * as React from "react"
import { LayoutDashboard, Ticket, Megaphone, GalleryHorizontal } from "lucide-react"
import { DashboardSidebarShared } from "@/components/ui/dashboard-sidebar-shared"

// Menu items for Marketing (config)
const menuItems = [
  {
    title: "Dashboard",
    url: "/marketing",
    icon: LayoutDashboard,
  },
  {
    title: "Manage Voucher",
    url: "/marketing/voucher",
    icon: Ticket,
  },
  {
    title: "Manage Ads",
    url: "/marketing/ads",
    icon: Megaphone,
  },
  {
    title: "Manage Feedback",
    url: "/marketing/feedback",
    icon: GalleryHorizontal,
  },
]

export function AppSidebar() {
  return <DashboardSidebarShared menuItems={menuItems} />
}