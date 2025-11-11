"use client"

import { useState } from "react"
import { CreditCard, Gift } from "lucide-react"
import WalletCard from "@/components/wallet/wallet-card"
import VoucherList from "@/components/wallet/voucher-list"
import ActionButtons from "@/components/wallet/action-buttons"

export default function WalletPage() {
    const [userCredit, setUserCredit] = useState({
        token: 2500,
        userVoucher: [
            {
                id: "1",
                name: "Summer Sale 2024",
                description: "Giảm 20% cho tất cả các sản phẩm",
                type: 1,
                discountValue: 20,
                maxDiscountAmount: 500000,
                minOrderValue: 100000,
                usageLimit: 1000,
                usedCount: 150,
                perUserLimit: 5,
            },
            {
                id: "2",
                name: "VIP Member Discount",
                description: "Giảm 30% cho thành viên VIP",
                type: 2,
                discountValue: 30,
                maxDiscountAmount: 1000000,
                minOrderValue: 500000,
                usageLimit: 500,
                usedCount: 45,
                perUserLimit: 10,
            },
            {
                id: "3",
                name: "Flash Deal",
                description: "Giảm 50.000đ cho đơn hàng trên 200.000đ",
                type: 1,
                discountValue: 50000,
                maxDiscountAmount: 50000,
                minOrderValue: 200000,
                usageLimit: 200,
                usedCount: 120,
                perUserLimit: 3,
            },
        ],
    })

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                        <CreditCard className="w-10 h-10 text-blue-600" />
                        Quản lý Ví Tiền
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Quản lý số dư tài khoản, voucher và thực hiện các giao dịch
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Wallet Balance Card */}
                    <div className="lg:col-span-1">
                        <WalletCard balance={userCredit.token} />
                    </div>

                    {/* Quick Actions */}
                    <div className="lg:col-span-2">
                        <ActionButtons />
                    </div>
                </div>

                {/* Vouchers Section */}
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Gift className="w-6 h-6 text-amber-600" />
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Voucher Đã Lưu</h2>
                            <span className="ml-auto text-sm font-medium text-slate-600 dark:text-slate-400">
                                {userCredit.userVoucher.length} vouchers
                            </span>
                        </div>
                        <VoucherList vouchers={userCredit.userVoucher} />
                    </div>
                </div>
            </div>
        </main>
    )
}
