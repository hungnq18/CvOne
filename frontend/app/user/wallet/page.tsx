"use client"

import { useState, useEffect } from "react"
import { CreditCard, Gift, Loader } from "lucide-react"
import WalletCard from "@/components/wallet/wallet-card"
import VoucherList from "@/components/wallet/voucher-list"
import ActionButtons from "@/components/wallet/action-buttons"
import { getCredit, type Credit, type CreditVoucher } from "@/api/apiCredit"
import { type Voucher } from "@/api/apiVoucher"

interface VoucherWithDetails extends Voucher {
    startDate: string
    endDate: string
    _id: string
}

export default function WalletPage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [credit, setCredit] = useState<Credit | null>(null)
    const [vouchers, setVouchers] = useState<VoucherWithDetails[]>([])

    useEffect(() => {
        loadCreditData()
    }, [])

    const loadCreditData = async () => {
        try {
            setLoading(true)
            setError(null)
            const creditData = await getCredit()
            setCredit(creditData)

            // Transform vouchers from credit to display format
            if (creditData.vouchers && creditData.vouchers.length > 0) {
                const vouchersWithDetails = creditData.vouchers
                    .filter((v: any) => v.voucherId && typeof v.voucherId === 'object')
                    .map((v: any) => {
                        const voucher = v.voucherId as any
                        return {
                            ...voucher,
                            startDate: v.startDate,
                            endDate: v.endDate,
                            _id: voucher._id || voucher.id,
                        } as VoucherWithDetails
                    })
                setVouchers(vouchersWithDetails)
            } else {
                setVouchers([])
            }
        } catch (err: any) {
            console.error("Error loading credit data:", err)
            setError(err.message || "Không thể tải dữ liệu ví")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
                <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400">Đang tải dữ liệu...</p>
                    </div>
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                        <button
                            onClick={loadCreditData}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4 mt-16">
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
                        <WalletCard tokenBalance={credit?.token || 0} />
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
                        </div>
                        <VoucherList vouchers={vouchers} />
                    </div>
                </div>
            </div>
        </main>
    )
}
