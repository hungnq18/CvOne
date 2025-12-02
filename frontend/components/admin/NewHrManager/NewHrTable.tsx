"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Eye } from "lucide-react"
import type { HrUser } from "@/api/apiHr"

interface HRTableProps {
    applications: HrUser[]
    onViewDetails: (app: HrUser) => void
    showStatus?: boolean
}

export function HRTable({ applications, onViewDetails, showStatus = true }: HRTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Tên Công Ty</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">MST</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Người Đăng Ký</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Ngày Đăng Ký</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-foreground"></th>
                    </tr>
                </thead>
                <tbody>
                    {applications.map((app) => (
                        <tr key={app._id} className="border-b border-border transition-colors hover:bg-muted/50">
                            <td className="px-4 py-3 text-sm font-medium text-foreground">{app.company_name}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{app.vatRegistrationNumber}</td>
                            <td className="px-4 py-3 text-sm text-foreground">{`${app.first_name} ${app.last_name}`}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{app.account_id}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                {app.createdAt
                                    ? format(new Date(app.createdAt), "dd MMM yyyy HH:mm", { locale: vi })
                                    : "—"}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <button
                                    onClick={() => onViewDetails(app)}
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    <Eye size={16} />
                                    Chi Tiết
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
