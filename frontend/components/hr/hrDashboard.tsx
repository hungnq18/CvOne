import { AppSidebar } from "@/components/hr/hrSideBar"
import { Header } from "@/components/ui/header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import FooterWrapper from "@/components/ui/footer-wrapper";
import { DashboardContent } from "./hrDashConten";

export function AdminDashboard() {
    return (
        <div className="flex flex-col min-h-screen">
            <SidebarProvider>
                <div className="flex flex-1 min-h-0">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col min-h-0">
                        <SidebarInset>
                            <Header />
                            <main className="flex-grow">
                                <DashboardContent />
                            </main>
                        </SidebarInset>
                    </div>
                </div>
            </SidebarProvider>
            <div className="relative z-10">
                <FooterWrapper />
            </div>
        </div>
    )
}
