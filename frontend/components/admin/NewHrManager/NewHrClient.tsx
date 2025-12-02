"use client";

import { useEffect, useState } from "react";
import { HRTable } from "./NewHrTable";
import { HRDetailModal } from "./NewHrDetailModal";
import { HrUser, getUnactiveHrUsers, updateHrActiveStatus } from "@/api/apiHr";
import { deleteUser } from "@/api/userApi"

export default function HRManagementDashboard() {
    const [applications, setApplications] = useState<HrUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<HrUser | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Hàm fetch lại danh sách applications
    const fetchApplications = async () => {
        try {
            setLoading(true);
            const data = await getUnactiveHrUsers();
            setApplications(data);
        } catch (error) {
            console.error("Error fetching HR users:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch khi load page
    useEffect(() => {
        fetchApplications();
    }, []);

    // APPROVE HR
    const handleApprove = async (accountId: string) => {
        try {
            await updateHrActiveStatus(accountId, { isActive: true });
            await fetchApplications(); // reset lại danh sách
        } catch (error) {
            console.error("Approve error:", error);
        } finally {
            setIsModalOpen(false);
            setSelectedApp(null);
        }
    };

    // REJECT HR
    const handleReject = async (userId: string) => {
        try {
            await deleteUser(userId);
            await fetchApplications(); // reset lại danh sách
        } catch (error) {
            console.error("Delete user failed", error);
        } finally {
            setIsModalOpen(false);
            setSelectedApp(null);
        }
    };

    // View Details
    const handleViewDetails = (app: HrUser) => {
        setSelectedApp(app);
        setIsModalOpen(true);
    };

    const pendingApps = applications;

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-card">
                <div className="flex items-center justify-between px-8 py-6">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Quản Lý Đăng Ký HR</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Duyệt và quản lý đơn đăng ký công ty mới
                        </p>
                    </div>
                    <div className="rounded-lg bg-blue-50 px-4 py-2">
                        <p className="text-sm font-medium text-blue-900">Chờ duyệt</p>
                        <p className="text-2xl font-bold text-blue-600">{pendingApps.length}</p>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <div className="flex-1 overflow-auto p-8">
                <div className="rounded-lg border border-border bg-card">
                    <div className="border-b border-border px-6 py-4">
                        <h2 className="text-xl font-semibold text-foreground">Đơn Đăng Ký Chờ Duyệt</h2>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="py-12 text-center text-muted-foreground">Đang tải...</div>
                        ) : pendingApps.length > 0 ? (
                            <HRTable
                                applications={pendingApps}
                                onViewDetails={handleViewDetails}
                                showStatus={false}
                            />
                        ) : (
                            <div className="py-12 text-center text-muted-foreground">
                                Không có đơn chờ duyệt
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {selectedApp && (
                <HRDetailModal
                    application={{
                        ...selectedApp,
                        _id: selectedApp._id,
                        first_name: selectedApp.first_name,
                        last_name: selectedApp.last_name,
                        company_name: selectedApp.company_name,
                        company_country: selectedApp.company_country,
                        company_city: selectedApp.company_city,
                        company_district: selectedApp.company_district,
                        createdAt: selectedApp.createdAt,
                    }}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedApp(null);
                    }}
                    onApprove={() => handleApprove(selectedApp._id)}
                    onReject={() => handleReject(selectedApp._id)}
                />
            )}
        </div>
    );
}
