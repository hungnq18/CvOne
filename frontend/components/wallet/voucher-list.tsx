"use client"

import { Copy, Check, Calendar } from "lucide-react"
import { useState } from "react"
import { type Voucher } from "@/api/apiVoucher"
import { useLanguage } from "@/providers/global_provider"

interface VoucherWithDates extends Voucher {
    startDate: string
    endDate: string
    _id: string
}

interface VoucherListProps {
    vouchers: VoucherWithDates[]
}

const translations = {
    vi: {
        noVoucher: "Bạn chưa lưu voucher nào",
        minOrder: "Đơn tối thiểu",
        maxDiscount: "Giảm tối đa",
        perUserLimit: "Giới hạn/người",
        remaining: "Còn lại",
        copied: "Đã sao chép",
        copyCode: "Sao chép mã",
        unlimited: "Không giới hạn",
        expired: "Voucher đã hết hạn",
        discountPercent: "Giảm {value}%",
        discountAmount: "Giảm {value}đ"
    },
    en: {
        noVoucher: "You have no saved vouchers",
        minOrder: "Minimum Order",
        maxDiscount: "Maximum Discount",
        perUserLimit: "Limit per User",
        remaining: "Remaining",
        copied: "Copied",
        copyCode: "Copy Code",
        unlimited: "Unlimited",
        expired: "Voucher expired",
        discountPercent: "Discount {value}%",
        discountAmount: "Discount {value} VND"
    }
}

export default function VoucherList({ vouchers }: VoucherListProps) {
    const { language } = useLanguage()
    const t = translations[language]

    const [copiedName, setCopiedName] = useState<string | null>(null)

    const handleCopyCode = (name: string) => {
        navigator.clipboard.writeText(name)
        setCopiedName(name)
        setTimeout(() => setCopiedName(null), 2000)
    }

    const getDiscountText = (voucher: VoucherWithDates) => {
        if (voucher.discountType === "percent") {
            return t.discountPercent.replace("{value}", voucher.discountValue.toString())
        }
        return t.discountAmount.replace("{value}", voucher.discountValue.toLocaleString("vi-VN"))
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    }

    const isExpired = (endDate: string) => {
        return new Date(endDate) < new Date()
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vouchers.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-600 dark:text-slate-400">{t.noVoucher}</p>
                </div>
            ) : (
                vouchers.map((voucher) => {
                    const expired = isExpired(voucher.endDate)
                    return (
                        <div
                            key={voucher._id}
                            className={`bg-white dark:bg-slate-800 rounded-xl border overflow-hidden hover:shadow-lg transition-shadow p-4 ${expired
                                ? "border-red-200 dark:border-red-800 opacity-75"
                                : "border-slate-200 dark:border-slate-700"
                                }`}
                        >
                            {expired && (
                                <div className="mb-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-1 text-center">
                                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">{t.expired}</p>
                                </div>
                            )}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h3 className="text-md font-bold text-slate-900 dark:text-white mb-1">{voucher.name}</h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">{voucher.description}</p>
                                </div>
                                <div className="text-right ml-2">
                                    <div className="inline-block bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10 px-2 py-1 rounded-lg">
                                        <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{getDiscountText(voucher)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-2 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-2">
                                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        {formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                                <div>
                                    <p className="font-medium text-slate-600 dark:text-slate-400">{t.minOrder}</p>
                                    <p className="font-semibold text-slate-900 dark:text-white mt-1">
                                        {voucher.minOrderValue ? `${voucher.minOrderValue.toLocaleString("vi-VN")}đ` : t.unlimited}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-600 dark:text-slate-400">{t.maxDiscount}</p>
                                    <p className="font-semibold text-slate-900 dark:text-white mt-1">
                                        {voucher.maxDiscountValue ? `${voucher.maxDiscountValue.toLocaleString("vi-VN")}đ` : t.unlimited}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-600 dark:text-slate-400">{t.perUserLimit}</p>
                                    <p className="font-semibold text-slate-900 dark:text-white mt-1">
                                        {voucher.perUserLimit ? `${voucher.perUserLimit}x` : t.unlimited}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-600 dark:text-slate-400">{t.remaining}</p>
                                    <p className="font-semibold text-slate-900 dark:text-white mt-1">
                                        {voucher.usageLimit
                                            ? (voucher.usageLimit - (voucher.usedCount || 0)).toLocaleString("vi-VN")
                                            : t.unlimited}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleCopyCode(voucher.name)}
                                disabled={expired}
                                className="w-full bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed text-blue-600 dark:text-blue-400 font-semibold py-1 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
                            >
                                {copiedName === voucher.name ? (
                                    <>
                                        <Check className="w-3 h-3" />
                                        {t.copied}
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3 h-3" />
                                        {t.copyCode}
                                    </>
                                )}
                            </button>
                        </div>
                    )
                })
            )}
        </div>
    )
}
