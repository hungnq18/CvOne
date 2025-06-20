import { AppSidebar } from "@/components/hr/hrSideBar"
import { Header } from "@/components/ui/header"
import { DashboardContent } from "@/components/hr/hrDashConten"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function AdminDashboard() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Header />
                <DashboardContent />
            </SidebarInset>
        </SidebarProvider>
    )
}
