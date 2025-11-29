"use client"

import { DashboardHeaderShared } from "@/components/ui/dashboard-header-shared"

export function DashboardHeader() {
  return (
    <DashboardHeaderShared
      roleLabel="Marketing"
      avatarSrc="https://i.pinimg.com/736x/03/eb/d6/03ebd625cc0b9d636256ecc44c0ea324.jpg"
      avatarFallback="M"
    />
  )
}