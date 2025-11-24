"use client"

import { useState } from "react"
import { X, Gift, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Voucher } from "@/api/apiVoucher"

const FEEDBACK_VOUCHER: Voucher = {
    _id: "79b3ba37b477064174e2f107",
    name: "FEEDBACK15K",
    description: "Cảm ơn bạn đã gửi feedback.",
    type: "saveable",
    discountValue: 15000,
    discountType: "amount",
    maxDiscountValue: undefined,
    minOrderValue: 60000,
    usageLimit: 1000,
    usedCount: 0,
    perUserLimit: 1,
    startDate: "2025-01-01T00:00:00.000Z",
    endDate: "2025-12-31T23:59:59.000Z",
    isActive: true,
}

export function VoucherPopup() {
    const [isOpen, setIsOpen] = useState(true)
    const [copied, setCopied] = useState(false)

    const voucher = FEEDBACK_VOUCHER
    const voucherCode = voucher.name

    const handleClose = () => setIsOpen(false)
    const handleCopyCode = () => {
        navigator.clipboard.writeText(voucherCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const discountDisplay =
        voucher.discountType === "percent" ? `${voucher.discountValue}%` : `${voucher.discountValue.toLocaleString()} đ`

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Đóng hộp ưu đãi"
                    title="Đóng"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-amber-100 rounded-full">
                                <Gift className="w-8 h-8 text-amber-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chúc mừng!</h2>
                        <p className="text-gray-600">{voucher.description}</p>
                    </div>

                    {/* Voucher Card */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white shadow-lg">
                        <p className="text-sm opacity-90 mb-2">Ưu đãi của bạn</p>
                        <p className="text-5xl font-bold mb-6">{discountDisplay}</p>

                        {/* Code Section */}
                        <div className="bg-white/20 rounded-lg p-4 flex items-center justify-between backdrop-blur-sm">
                            <code className="text-lg font-mono font-bold tracking-wider">{voucherCode}</code>
                            <button
                                onClick={handleCopyCode}
                                className="p-2 hover:bg-white/30 rounded-lg transition-colors"
                                title="Sao chép mã"
                                aria-label="Sao chép mã ưu đãi"
                            >
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Action Button */}
                    <Button
                        onClick={handleClose}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                        Đã hiểu
                    </Button>
                </div>
            </div>
        </div>
    )
}
