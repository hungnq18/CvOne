"use client"

import Link from "next/link"
import { ArrowUpRight, CreditCard } from "lucide-react"
import { tokenToVnd, formatVnd } from "@/utils/currency"

interface WalletCardProps {
    tokenBalance: number
}

export default function WalletCard({ tokenBalance }: WalletCardProps) {
    const vndBalance = tokenToVnd(tokenBalance)
    const formattedBalance = formatVnd(vndBalance)
    const formattedTokens = tokenBalance.toLocaleString("vi-VN")

    return (
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-start justify-between mb-12">
                <div>
                    <p className="text-blue-100 text-sm font-medium mb-2">Số dư hiện tại</p>
                    <h3 className="text-4xl font-bold">{formattedBalance}</h3>
                    <p className="text-blue-100 text-xs mt-1">VND</p>

                </div>
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur">
                    <CreditCard className="w-6 h-6" />
                </div>
            </div>

            <Link
                href="/user/wallet/deposit"
                className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors w-full justify-center group"
            >
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Nạp Tiền Ngay
            </Link>
        </div>
    )
}
