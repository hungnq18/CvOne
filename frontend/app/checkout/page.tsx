"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Lock } from "lucide-react"
import CheckoutForm from "@/components/checkout/checkout-form"

export default function CheckoutPage() {
    const searchParams = useSearchParams()
    const amount = searchParams.get("amount") || "0"
    const [depositAmount, setDepositAmount] = useState(Number.parseInt(amount))

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <Link
                    href="/wallet"
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 rounded-lg">
                                    <ShoppingCart className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Thanh Toán</h1>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">Hoàn tất giao dịch nạp tiền của bạn</p>
                                </div>
                            </div>

                            <CheckoutForm depositAmount={depositAmount} />
                        </div>
                    </div>

                    {/* Summary */}
                    <div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 sticky top-8">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Đơn hàng</h2>

                            <div className="space-y-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 dark:text-slate-400">Nạp tiền</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {depositAmount.toLocaleString("vi-VN")}đ
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 dark:text-slate-400">Phí</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">0đ</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-6">
                                <span className="text-lg font-bold text-slate-900 dark:text-white">Tổng cộng</span>
                                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {depositAmount.toLocaleString("vi-VN")}đ
                                </span>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-3">
                                <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-900 dark:text-blue-200">
                                    Thanh toán được bảo vệ bởi hệ thống mã hóa SSL 256-bit
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
