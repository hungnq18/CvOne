"use client"

import type * as React from "react"
import { LayoutDashboard, Ticket, Megaphone, GalleryHorizontal } from "lucide-react"
import { DashboardSidebarShared } from "@/components/ui/dashboard-sidebar-shared"
import { useLanguage } from "@/providers/global_provider"

export function AppSidebar() {
  const { t } = useLanguage();

  const menuItems = [
    {
      title: t.sidebar.dashboard,
      url: "/marketing",
      icon: LayoutDashboard,
    },
    {
      title: t.sidebar.manageVoucher,
      url: "/marketing/voucher",
      icon: Ticket,
    },
    {
      title: t.sidebar.manageBanners,
      url: "/marketing/banner",
      icon: Megaphone,
    },
    {
      title: t.sidebar.manageFeedback,
      url: "/marketing/feedback",
      icon: GalleryHorizontal,
    },
  ]

  return <DashboardSidebarShared menuItems={menuItems} />
}
