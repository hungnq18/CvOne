"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader, DollarSign, AlertCircle, Tag, X, Check, QrCode, CreditCard } from "lucide-react"
import { vndToToken, formatVnd, formatTokens } from "@/utils/currency"
import { createOrder, type Order } from "@/api/apiOrder"
import { getVoucherById, getVouchersForUser, type Voucher } from "@/api/apiVoucher"

const DEPOSIT_PACKAGES = [
    { id: 1, amount: 20000, label: "20.000đ" },
    { id: 2, amount: 50000, label: "50.000đ" },
    { id: 3, amount: 100000, label: "100.000đ" },
    { id: 4, amount: 200000, label: "200.000đ" },
    { id: 5, amount: 500000, label: "500.000đ" },
    { id: 6, amount: 1000000, label: "1.000.000đ" },
]

const MIN_AMOUNT = 10000 // Minimum 10,000 VND
const MAX_AMOUNT = 10000000 // Maximum 10,000,000 VND
const TRANSACTION_FEE_RATE = 0.02 // 2% transaction fee

export default function DepositForm() {
    const router = useRouter()
    const [selectedPackage, setSelectedPackage] = useState<number | null>(1)
    const [customAmount, setCustomAmount] = useState("")
    const [useCustom, setUseCustom] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [voucherCode, setVoucherCode] = useState("")
    const [voucher, setVoucher] = useState<Voucher | null>(null)
    const [voucherError, setVoucherError] = useState<string | null>(null)
    const [validatingVoucher, setValidatingVoucher] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<"qr" | "card">("qr")

    const amount = useCustom
        ? Number.parseInt(customAmount) || 0
        : DEPOSIT_PACKAGES.find((p) => p.id === selectedPackage)?.amount || 0

    // Calculate discount
    const calculateDiscount = (baseAmount: number, voucher: Voucher | null): number => {
        if (!voucher || !voucher.isActive) return 0

        const now = new Date()
        const startDate = new Date(voucher.startDate)
        const endDate = new Date(voucher.endDate)

        // Check if voucher is valid
        if (now < startDate || now > endDate) return 0
        if (voucher.minOrderValue && baseAmount < voucher.minOrderValue) return 0

        let discount = 0
        if (voucher.discountType === "percent") {
            discount = baseAmount * (voucher.discountValue / 100)
            if (voucher.maxDiscountValue && discount > voucher.maxDiscountValue) {
                discount = voucher.maxDiscountValue
            }
        } else if (voucher.discountType === "amount") {
            discount = voucher.discountValue
        }

        return Math.min(discount, baseAmount)
    }

    const discount = calculateDiscount(amount, voucher)
    const amountAfterDiscount = Math.max(amount - discount, 0)
    const transactionFee = amountAfterDiscount * TRANSACTION_FEE_RATE
    const totalAmount = amountAfterDiscount + transactionFee
    const tokens = vndToToken(amountAfterDiscount) // Token tính trên số tiền sau giảm

    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) {
            setVoucherError("Vui lòng nhập mã voucher")
            return
        }

        try {
            setValidatingVoucher(true)
            setVoucherError(null)

            // First, get all available vouchers to find by name
            const allVouchers = await getVouchersForUser()
            const voucherName = voucherCode.trim()

            // Find voucher by name (case-insensitive)
            const foundVoucher = Array.isArray(allVouchers)
                ? allVouchers.find((v: Voucher) =>
                    v.name.toLowerCase() === voucherName.toLowerCase()
                )
                : null

            if (!foundVoucher || !foundVoucher._id) {
                setVoucherError("Mã voucher không hợp lệ")
                setVoucher(null)
                return
            }

            // Get full voucher details by ID
            const voucherData = await getVoucherById(foundVoucher._id)

            // Validate voucher
            const now = new Date()
            const startDate = new Date(voucherData.startDate)
            const endDate = new Date(voucherData.endDate)

            if (!voucherData.isActive) {
                setVoucherError("Voucher không còn hoạt động")
                setVoucher(null)
                return
            }

            if (now < startDate) {
                setVoucherError("Voucher chưa đến thời gian sử dụng")
                setVoucher(null)
                return
            }

            if (now > endDate) {
                setVoucherError("Voucher đã hết hạn")
                setVoucher(null)
                return
            }

            if (voucherData.minOrderValue && amount < voucherData.minOrderValue) {
                setVoucherError(`Đơn hàng tối thiểu ${formatVnd(voucherData.minOrderValue)} để sử dụng voucher này`)
                setVoucher(null)
                return
            }

            setVoucher(voucherData)
        } catch (err: any) {
            console.error("Error validating voucher:", err)
            setVoucherError(err.message || "Mã voucher không hợp lệ")
            setVoucher(null)
        } finally {
            setValidatingVoucher(false)
        }
    }

    const handleRemoveVoucher = () => {
        setVoucher(null)
        setVoucherCode("")
        setVoucherError(null)
    }

    const handleProceedToCheckout = async () => {
        if (amount <= 0) {
            setError("Vui lòng chọn hoặc nhập số tiền hợp lệ")
            return
        }

        if (amount < MIN_AMOUNT) {
            setError(`Số tiền tối thiểu là ${formatVnd(MIN_AMOUNT)}`)
            return
        }

        if (amount > MAX_AMOUNT) {
            setError(`Số tiền tối đa là ${formatVnd(MAX_AMOUNT)}`)
            return
        }

        if (voucher && voucher.minOrderValue && amount < voucher.minOrderValue) {
            setError(`Đơn hàng tối thiểu ${formatVnd(voucher.minOrderValue)} để sử dụng voucher này`)
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            // Create order
            const orderData: Partial<Order> = {
                totalToken: tokens,
                price: amount, // Original price
                voucherId: voucher?._id,
                paymentMethod: paymentMethod === "qr" ? "payos" : "card",
            }

            const response = await createOrder(orderData as Order)

            // Handle based on payment method
            if (paymentMethod === "qr") {
                // QR Code payment - redirect to payment link
                if (response.paymentLink) {
                    window.location.href = response.paymentLink
                } else if (response.order) {
                    // Redirect to order confirmation page
                    router.push(`/user/wallet/orders/${response.order._id || response.order.orderCode}`)
                } else {
                    // Fallback: redirect to wallet page
                    router.push("/user/wallet")
                }
            } else {
                // Card payment - redirect to checkout page with order info
                if (response.order) {
                    const orderId = response.order._id || response.order.orderCode
                    router.push(`/checkout?orderId=${orderId}&amount=${Math.ceil(totalAmount)}&tokens=${tokens}`)
                } else {
                    router.push(`/checkout?amount=${Math.ceil(totalAmount)}&tokens=${tokens}`)
                }
            }
        } catch (err: any) {
            console.error("Error creating order:", err)
            setError(err.message || "Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.")
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                    >
                        ×
                    </button>
                </div>
            )}

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
                                setError(null)
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
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Nhập số tiền khác</h2>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-600 dark:text-slate-400">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <input
                        type="number"
                        min={MIN_AMOUNT}
                        max={MAX_AMOUNT}
                        value={customAmount}
                        onChange={(e) => {
                            setCustomAmount(e.target.value)
                            setUseCustom(true)
                            setError(null)
                            // Remove voucher if amount changes and doesn't meet min requirement
                            if (voucher && voucher.minOrderValue && Number.parseInt(e.target.value) < voucher.minOrderValue) {
                                handleRemoveVoucher()
                            }
                        }}
                        placeholder={`Nhập số tiền`}
                        className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-blue-500 dark:focus:border-blue-500 outline-none text-slate-900 dark:text-white dark:bg-slate-700 transition-colors"
                    />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Số tiền tối thiểu: {formatVnd(MIN_AMOUNT)}, tối đa: {formatVnd(MAX_AMOUNT)}
                </p>
            </div>

            {/* Payment Method */}
            <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Phương thức thanh toán</h2>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setPaymentMethod("qr")}
                        className={`p-6 rounded-lg border-2 transition-all ${paymentMethod === "qr"
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                            }`}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className={`p-3 rounded-lg ${paymentMethod === "qr"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                                }`}>
                                <QrCode className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <p className={`font-semibold ${paymentMethod === "qr"
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-slate-900 dark:text-white"
                                    }`}>
                                    QR Code
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    Quét mã để thanh toán
                                </p>
                            </div>
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`p-6 rounded-lg border-2 transition-all ${paymentMethod === "card"
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                            }`}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className={`p-3 rounded-lg ${paymentMethod === "card"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                                }`}>
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <p className={`font-semibold ${paymentMethod === "card"
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-slate-900 dark:text-white"
                                    }`}>
                                    Thẻ tín dụng
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    Thanh toán bằng thẻ
                                </p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Voucher Code */}
            <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Mã giảm giá (nếu có)</h2>
                {voucher ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    <span className="font-semibold text-green-800 dark:text-green-200">{voucher.name}</span>
                                </div>
                                <p className="text-sm text-green-700 dark:text-green-300 mb-1">{voucher.description}</p>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    Giảm: {voucher.discountType === "percent"
                                        ? `${voucher.discountValue}%`
                                        : `${formatVnd(voucher.discountValue)}đ`}
                                </p>
                            </div>
                            <button
                                onClick={handleRemoveVoucher}
                                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 ml-4"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-600 dark:text-slate-400">
                                <Tag className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={voucherCode}
                                onChange={(e) => {
                                    setVoucherCode(e.target.value)
                                    setVoucherError(null)
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        handleApplyVoucher()
                                    }
                                }}
                                placeholder="Nhập mã voucher"
                                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-blue-500 dark:focus:border-blue-500 outline-none text-slate-900 dark:text-white dark:bg-slate-700 transition-colors"
                            />
                        </div>
                        <button
                            onClick={handleApplyVoucher}
                            disabled={validatingVoucher || !voucherCode.trim()}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                        >
                            {validatingVoucher ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Đang kiểm tra...
                                </>
                            ) : (
                                "Áp dụng"
                            )}
                        </button>
                    </div>
                )}
                {voucherError && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">{voucherError}</p>
                )}
            </div>

            {/* Order Summary */}
            {amount > 0 && (
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Tóm tắt đơn hàng</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-slate-400">Số tiền nạp</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{formatVnd(amount)}đ</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 dark:text-slate-400">Giảm giá</span>
                                <span className="font-semibold text-green-600 dark:text-green-400">-{formatVnd(discount)}đ</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-slate-400">Số tiền sau giảm</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{formatVnd(amountAfterDiscount)}đ</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-slate-400">Phí giao dịch (2%)</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{formatVnd(Math.ceil(transactionFee))}đ</span>
                        </div>
                        <div className="flex justify-between items-center pt-3">
                            <span className="text-lg font-semibold text-slate-900 dark:text-white">Tổng cộng</span>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {formatVnd(Math.ceil(totalAmount))}đ
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Link
                    href="/user/wallet"
                    className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                >
                    Hủy
                </Link>
                <button
                    onClick={handleProceedToCheckout}
                    disabled={isLoading || amount <= 0 || amount < MIN_AMOUNT || amount > MAX_AMOUNT}
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
