import { AppSidebar } from "@/components/admin/app-sidebar"
import { DashboardContent } from "@/components/admin/dashboard-content"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function AdminDashboard() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardContent />
      </SidebarInset>
    </SidebarProvider>
  )
}