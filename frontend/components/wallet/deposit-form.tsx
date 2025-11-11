"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Loader } from "lucide-react"

const DEPOSIT_PACKAGES = [
    { id: 1, amount: 100000, label: "100.000đ" },
    { id: 2, amount: 250000, label: "250.000đ" },
    { id: 3, amount: 500000, label: "500.000đ" },
    { id: 4, amount: 1000000, label: "1.000.000đ" },
    { id: 5, amount: 2500000, label: "2.500.000đ" },
    { id: 6, amount: 5000000, label: "5.000.000đ" },
]

export default function DepositForm() {
    const [selectedPackage, setSelectedPackage] = useState<number | null>(1)
    const [customAmount, setCustomAmount] = useState("")
    const [useCustom, setUseCustom] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const amount = useCustom
        ? Number.parseInt(customAmount) || 0
        : DEPOSIT_PACKAGES.find((p) => p.id === selectedPackage)?.amount || 0

    const handleProceedToCheckout = () => {
        if (amount <= 0) {
            alert("Vui lòng chọn hoặc nhập số tiền hợp lệ")
            return
        }
        setIsLoading(true)
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            window.location.href = `/checkout?amount=${amount}`
        }, 500)
    }

    return (
        <div className="space-y-8">
            {/* Predefined Packages */}
            <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Chọn gói nạp</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {DEPOSIT_PACKAGES.map((pkg) => (
                        <button
                            key={pkg.id}
                            onClick={() => {
                                setSelectedPackage(pkg.id)
                                setUseCustom(false)
                            }}
                            className={`p-4 rounded-lg font-semibold transition-all border-2 ${!useCustom && selectedPackage === pkg.id
                                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                    : "border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-blue-300 dark:hover:border-blue-700"
                                }`}
                        >
                            {pkg.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Amount */}
            <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Hoặc nhập số tiền khác</h2>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-600 dark:text-slate-400">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => {
                            setCustomAmount(e.target.value)
                            setUseCustom(true)
                        }}
                        placeholder="Nhập số tiền (VND)"
                        className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-blue-500 dark:focus:border-blue-500 outline-none text-slate-900 dark:text-white dark:bg-slate-700 transition-colors"
                    />
                </div>
            </div>

            {/* Order Summary */}
            {amount > 0 && (
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-slate-400">Số tiền</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{amount.toLocaleString("vi-VN")}đ</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                            <span className="text-slate-600 dark:text-slate-400">Phí</span>
                            <span className="font-semibold text-slate-900 dark:text-white">0đ</span>
                        </div>
                        <div className="flex justify-between items-center pt-3">
                            <span className="text-lg font-semibold text-slate-900 dark:text-white">Tổng cộng</span>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {amount.toLocaleString("vi-VN")}đ
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Link
                    href="/wallet"
                    className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                >
                    Hủy
                </Link>
                <button
                    onClick={handleProceedToCheckout}
                    disabled={isLoading || amount <= 0}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            Tiếp tục thanh toán
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

import { DollarSign } from "lucide-react"
