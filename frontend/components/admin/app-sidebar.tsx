"use client"

import type * as React from "react"
import { LayoutDashboard, Users, FileText, Mail, BriefcaseBusiness, CreditCard } from "lucide-react"
import { DashboardSidebarShared } from "@/components/ui/dashboard-sidebar-shared"

// Menu items với đường dẫn thực tế (config)
const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Manage User",
    url: "/admin/user",
    icon: Users,
  },
  {
    title: "Manage CV Template",
    url: "/admin/cv-template",
    icon: FileText,
  },
  {
    title: "Manage CL Template",
    url: "/admin/cl-template",
    icon: Mail,
  },
  {
    title: "Approve Jobs",
    url: "/admin/job-approval",
    icon: BriefcaseBusiness,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: CreditCard,
  },
]

export function AppSidebar() {
  return <DashboardSidebarShared menuItems={menuItems} />
}