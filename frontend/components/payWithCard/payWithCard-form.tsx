"use client"

import type React from "react"

import { useState } from "react"
import { CreditCard, User, Lock, Loader } from "lucide-react"
import Link from "next/link"
import { notify } from "@/lib/notify"

interface PayWithCardFormProps {
    depositAmount: number
}

export default function PayWithCardForm({ depositAmount }: PayWithCardFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate payment processing
        setTimeout(() => {
            setIsLoading(false)
            notify.success("Thanh toán thành công! Số tiền đã được nạp vào tài khoản của bạn.")
            window.location.href = "/wallet"
        }, 2000)
    }

    const formatCardNumber = (value: string) => {
        return value
            .replace(/\s/g, "")
            .replace(/(\d{4})/g, "$1 ")
            .trim()
    }

    const formatExpiryDate = (value: string) => {
        return value
            .replace(/\D/g, "")
            .replace(/(\d{2})(\d{0,2})/, "$1/$2")
            .slice(0, 5)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Thông tin cá nhân
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Họ và tên</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Nguyễn Văn A"
                            required
                            className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-blue-500 dark:focus:border-blue-500 outline-none text-slate-900 dark:text-white dark:bg-slate-700 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="user@example.com"
                            required
                            className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-blue-500 dark:focus:border-blue-500 outline-none text-slate-900 dark:text-white dark:bg-slate-700 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Payment Information */}
            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Thông tin thanh toán
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Số thẻ</label>
                        <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    cardNumber: formatCardNumber(e.target.value),
                                }))
                            }
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            required
                            className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-blue-500 dark:focus:border-blue-500 outline-none text-slate-900 dark:text-white dark:bg-slate-700 transition-colors font-mono"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Ngày hết hạn</label>
                            <input
                                type="text"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        expiryDate: formatExpiryDate(e.target.value),
                                    }))
                                }
                                placeholder="MM/YY"
                                maxLength={5}
                                required
                                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-blue-500 dark:focus:border-blue-500 outline-none text-slate-900 dark:text-white dark:bg-slate-700 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">CVV</label>
                            <input
                                type="password"
                                name="cvv"
                                value={formData.cvv}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        cvv: e.target.value.slice(0, 4),
                                    }))
                                }
                                placeholder="123"
                                maxLength={4}
                                required
                                className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-blue-500 dark:focus:border-blue-500 outline-none text-slate-900 dark:text-white dark:bg-slate-700 transition-colors font-mono"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Terms */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" required className="mt-1" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                        Tôi đồng ý với{" "}
                        <Link href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                            điều khoản dịch vụ
                        </Link>{" "}
                        và{" "}
                        <Link href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                            chính sách bảo mật
                        </Link>
                    </span>
                </label>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Đang xử lý thanh toán...
                    </>
                ) : (
                    <>
                        <Lock className="w-5 h-5" />
                        Thanh toán {depositAmount.toLocaleString("vi-VN")}đ
                    </>
                )}
            </button>
        </form>
    )
}
