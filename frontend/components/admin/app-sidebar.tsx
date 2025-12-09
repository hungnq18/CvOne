"use client"

import type * as React from "react"
import { LayoutDashboard, Users, FileText, Mail, BriefcaseBusiness, CreditCard, Briefcase, LineChart } from "lucide-react"
import { DashboardSidebarShared } from "@/components/ui/dashboard-sidebar-shared"
import { useLanguage } from "@/providers/global_provider"

export function AppSidebar() {
  const { t } = useLanguage()

const menuItems = [
  {
      title: t.admin.sidebar.dashboard,
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
      title: t.admin.sidebar.manageUser,
    url: "/admin/user",
    icon: Users,
  },
  {
      title: t.admin.sidebar.manageCvTemplate,
    url: "/admin/cv-template",
    icon: FileText,
  },
  {
      title: t.admin.sidebar.manageClTemplate,
    url: "/admin/cl-template",
    icon: Mail,
  },
  {
      title: t.admin.sidebar.approveJobs,
    url: "/admin/job-approval",
    icon: BriefcaseBusiness,
  },
  {
      title: t.admin.sidebar.manageRegisterHr,
    url: "/admin/newHrRegister",
    icon: Briefcase,
  },
  {
      title: t.admin.sidebar.orders,
    url: "/admin/orders",
    icon: CreditCard,
  },
  {
      title: t.admin.sidebar.finance,
    url: "/admin/finance",
    icon: LineChart,
  },
]

  return <DashboardSidebarShared menuItems={menuItems} />
}
