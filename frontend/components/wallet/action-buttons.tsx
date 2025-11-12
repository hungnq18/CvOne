"use client"

import Link from "next/link"
import { ShoppingCart, History } from "lucide-react"

export default function ActionButtons() {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Checkout Button */}
                <Link
                    href="/user/wallet/deposit"
                    className="bg-white dark:bg-slate-800 rounded-xl p-6 hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700 group"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg group-hover:scale-110 transition-transform">
                            <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Nạp tiền</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Nạp tiền vào tài khoản</p>
                        </div>
                    </div>
                </Link>

                {/* History Button */}
                <Link
                    href="/user/wallet/history"
                    className="bg-white dark:bg-slate-800 rounded-xl p-6 hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700 group"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg group-hover:scale-110 transition-transform">
                            <History className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Lịch sử</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Xem lịch sử giao dịch</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                    💡 <strong>Mẹo:</strong> Sử dụng voucher để tiết kiệm hơn trên mỗi giao dịch của bạn
                </p>
            </div>
        </div>
    )
}
