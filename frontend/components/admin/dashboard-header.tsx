"use client"

import { DashboardHeaderShared } from "@/components/ui/dashboard-header-shared"
import { useLanguage } from "@/providers/global_provider"

export function DashboardHeader() {
  const { t } = useLanguage()

  return (
    <DashboardHeaderShared
      role="admin"
      roleLabel={t.admin.role}
      avatarSrc="https://i.pinimg.com/736x/03/eb/d6/03ebd625cc0b9d636256ecc44c0ea324.jpg"
      avatarFallback="A"
    />
  )
}
