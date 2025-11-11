"use client"

import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface Voucher {
    id: string
    name: string
    description: string
    type: number
    discountValue: number
    maxDiscountAmount: number
    minOrderValue: number
    usageLimit: number
    usedCount: number
    perUserLimit: number
}

interface VoucherListProps {
    vouchers: Voucher[]
}

export default function VoucherList({ vouchers }: VoucherListProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const handleCopyCode = (id: string) => {
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const getDiscountText = (voucher: Voucher) => {
        if (voucher.type === 1) {
            return `Giảm ${voucher.discountValue}%`
        }
        return `Giảm ${voucher.discountValue.toLocaleString("vi-VN")}đ`
    }

    const getProgressPercentage = (used: number, limit: number) => {
        return (used / limit) * 100
    }

    return (
        <div className="space-y-4">
            {vouchers.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-600 dark:text-slate-400">Bạn chưa lưu voucher nào</p>
                </div>
            ) : (
                vouchers.map((voucher) => (
                    <div
                        key={voucher.id}
                        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{voucher.name}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{voucher.description}</p>
                                </div>
                                <div className="text-right ml-4">
                                    <div className="inline-block bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10 px-4 py-2 rounded-lg">
                                        <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{getDiscountText(voucher)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 py-4 border-t border-b border-slate-200 dark:border-slate-700">
                                <div>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Đơn tối thiểu</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                                        {voucher.minOrderValue.toLocaleString("vi-VN")}đ
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Giảm tối đa</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                                        {voucher.maxDiscountAmount.toLocaleString("vi-VN")}đ
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Giới hạn/người</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{voucher.perUserLimit}x</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Còn lại</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                                        {(voucher.usageLimit - voucher.usedCount).toLocaleString("vi-VN")}
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Tỷ lệ sử dụng</p>
                                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                        {voucher.usedCount} / {voucher.usageLimit}
                                    </p>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${getProgressPercentage(voucher.usedCount, voucher.usageLimit)}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleCopyCode(voucher.id)}
                                    className="flex-1 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {copiedId === voucher.id ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Đã sao chép
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Sao chép mã
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}
