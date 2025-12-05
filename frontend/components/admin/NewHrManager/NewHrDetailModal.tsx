"use client"

import { X, Check, XIcon } from "lucide-react"
import { format } from "date-fns"
import { vi, enUS } from "date-fns/locale"
import type { HrUser } from "@/api/apiHr"
import { useLanguage } from "@/providers/global_provider"

interface HRDetailModalProps {
    application: HrUser
    isOpen: boolean
    onClose: () => void
    onApprove: () => void
    onReject: () => void
}

export function HRDetailModal({ application, isOpen, onClose, onApprove, onReject }: HRDetailModalProps) {
    const { t, language } = useLanguage()

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card shadow-lg">

                <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-6 py-4">
                    <h2 className="text-xl font-bold">{t.admin.newHr.modal.title}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-4">
                            {t.admin.newHr.modal.contactInfo}
                        </h3>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="text-xs font-semibold">{t.admin.newHr.modal.firstName}</label>
                                <p className="mt-1 text-lg">{application.first_name}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold">{t.admin.newHr.modal.lastName}</label>
                                <p className="mt-1 text-lg">{application.last_name}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold">{t.admin.newHr.modal.phone}</label>
                                <p className="mt-1 text-lg">{application.phone || "—"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t" />

                    {/* Company */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-4">
                            {t.admin.newHr.modal.companyInfo}
                        </h3>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold">{t.admin.newHr.modal.companyName}</label>
                                <p className="mt-1 text-lg">{application.company_name}</p>
                            </div>

                            <div>
                                <label className="text-xs font-semibold">{t.admin.newHr.modal.taxId}</label>
                                <p className="mt-1 text-lg font-mono">{application.vatRegistrationNumber}</p>
                            </div>

                            <div>
                                <label className="text-xs font-semibold">{t.admin.newHr.modal.country}</label>
                                <p className="mt-1 text-lg">{application.company_country}</p>
                            </div>

                            <div>
                                <label className="text-xs font-semibold">{t.admin.newHr.modal.city}</label>
                                <p className="mt-1 text-lg">{application.company_city}</p>
                            </div>

                            <div>
                                <label className="text-xs font-semibold">{t.admin.newHr.modal.district}</label>
                                <p className="mt-1 text-lg">{application.company_district}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t" />

                    {/* Registration */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-4">
                            {t.admin.newHr.modal.regInfo}
                        </h3>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="text-xs font-semibold">{t.admin.newHr.modal.regDate}</label>
                                <p className="mt-1 text-lg">
                                    {application.createdAt
                                        ? format(new Date(application.createdAt), "dd/MM/yyyy", {
                                            locale: language === 'vi' ? vi : enUS,
                                        })
                                        : "—"}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-semibold">{t.admin.newHr.modal.status}</label>
                                <p className="mt-1 text-lg">{t.admin.newHr.modal.statusPending}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t" />

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onApprove}
                            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 py-3 text-white hover:bg-green-700"
                        >
                            <Check size={18} />
                            {t.admin.newHr.modal.approve}
                        </button>

                        <button
                            onClick={onReject}
                            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600 py-3 text-white hover:bg-red-700"
                        >
                            <XIcon size={18} />
                            {t.admin.newHr.modal.reject}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
