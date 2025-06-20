import { AppSidebar } from "@/components/hr/hrSideBar"
import { DashboardHeader } from "@/components/hr/hrDashHeader"
import { DashboardContent } from "@/components/hr/hrDashConten"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function AdminDashboard() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <DashboardHeader />
                <DashboardContent />
            </SidebarInset>
        </SidebarProvider>
    )
}
