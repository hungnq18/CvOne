"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getOrderByOrderCode, updateOrderStatus, Order } from "@/api/apiOrder"
import { updateToken } from "@/api/apiCredit"

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const orderCode = searchParams.get("orderCode") || ""

    useEffect(() => {
        const fetchAndProcessOrder = async () => {
            try {
                setLoading(true)

                if (!orderCode) {
                    setError("Không tìm thấy mã đơn hàng.")
                    return
                }

                //  Lấy chi tiết đơn hàng
                const response = await getOrderByOrderCode(orderCode)
                console.log("Order API response:", response)

                // Hỗ trợ cả 2 dạng trả về: trực tiếp hoặc { data } hoặc { order }
                const orderDetail: Order | undefined =
                    response?.data ?? response?.order ?? response

                if (!orderDetail || !orderDetail.status) {
                    setError("Không tìm thấy đơn hàng hợp lệ.")
                    return
                }

                setOrder(orderDetail)

                // 2️⃣ Nếu chưa completed thì cập nhật
                if (orderDetail.status !== "completed") {
                    await updateOrderStatus(orderCode.toString(), "completed")

                    const updatedResponse = await getOrderByOrderCode(orderCode)
                    const updatedOrder: Order | undefined =
                        updatedResponse?.data ?? updatedResponse?.order ?? updatedResponse

                    if (updatedOrder) setOrder(updatedOrder)
                }

                // 3️⃣ Cộng token cho user
                if (orderDetail.totalToken && orderDetail.totalToken > 0) {

                    const credit = await updateToken({ token: orderDetail.totalToken })
                    console.log("Credit:", credit)

                }
            } catch (err) {
                console.error("❌ Error fetching order:", err)
                setError("Không thể xử lý đơn hàng.")
            } finally {
                setLoading(false)
            }
        }

        fetchAndProcessOrder()
    }, [orderCode])

    const handleCopyOrderCode = () => {
        if (!order) return
        navigator.clipboard.writeText(order.orderCode.toString())
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleGoHome = () => router.push("/")

    if (loading)
        return <p className="text-center mt-10 text-gray-700 dark:text-gray-300">Đang xử lý...</p>
    if (error)
        return <p className="text-center mt-10 text-red-600">{error}</p>
    if (!order)
        return <p className="text-center mt-10 text-gray-600">Không có thông tin đơn hàng.</p>

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 mt-10">
            <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
                <div className="w-full max-w-2xl">
                    {/* Icon */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 shadow-2xl">
                            <CheckCircle className="w-14 h-14 text-white" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-green-800 dark:text-green-400 mb-2">
                            Thanh toán thành công!
                        </h1>
                        <p className="text-lg text-green-600 dark:text-green-300">
                            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xử lý.
                        </p>
                    </div>

                    {/* Order Card */}
                    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-green-200 dark:border-green-900/30 shadow-xl mb-8">
                        <div className="px-6 py-4 border-b border-green-200 dark:border-green-900/30">
                            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                                Mã đơn hàng
                            </h2>
                            <div className="flex items-center justify-between gap-4">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                                    {order.orderCode}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopyOrderCode}
                                    className="border-green-200 dark:border-green-900/30 hover:bg-green-50 dark:hover:bg-slate-800 bg-transparent"
                                >
                                    {copied ? "✓ Đã sao chép" : "Sao chép"}
                                </Button>
                            </div>
                        </div>

                        <div className="px-6 py-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Tổng tiền
                                    </p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {order.totalAmount?.toLocaleString("vi-VN")}đ
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Phương thức thanh toán
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {order.paymentMethod}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Trạng thái
                                </p>
                                <div
                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${order.status === "completed"
                                        ? "bg-green-100 dark:bg-green-900/30"
                                        : order.status === "pending"
                                            ? "bg-yellow-100 dark:bg-yellow-900/30"
                                            : "bg-red-100 dark:bg-red-900/30"
                                        }`}
                                >
                                    <div
                                        className={`w-2 h-2 rounded-full ${order.status === "completed"
                                            ? "bg-green-600 dark:bg-green-400"
                                            : order.status === "pending"
                                                ? "bg-yellow-600 dark:bg-yellow-400"
                                                : "bg-red-600 dark:bg-red-400"
                                            }`}
                                    ></div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>

                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Ngày giao dịch:{" "}
                                {order.createdAt
                                    ? new Date(order.createdAt).toLocaleDateString("vi-VN", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })
                                    : new Date().toLocaleDateString("vi-VN")}
                            </p>


                        </div>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">

                        <Button
                            size="lg"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleGoHome}
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Về trang chủ
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
