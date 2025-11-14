"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { updateOrderStatus } from "@/api/apiOrder"

export default function PaymentCancelPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const orderCode = searchParams.get("orderCode") || ""

    useEffect(() => {
        const updateStatus = async () => {
            try {
                setLoading(true)
                await updateOrderStatus(orderCode, "cancelled")
            } catch (err) {
                console.error("Error updating order status:", err)
                setError("Cập nhật trạng thái đơn hàng thất bại.")
            } finally {
                setLoading(false)
            }
        }

        if (orderCode) {
            updateStatus()
        } else {
            setError("Không tìm thấy orderCode.")
            setLoading(false)
        }
    }, [orderCode])

    const handleGoWallet = () => router.push("/user/wallet")

    if (loading) return <p className="text-center mt-10">Đang xử lý...</p>

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-6 text-center">
            <h1 className="text-3xl font-bold text-red-600">Thanh toán bị huỷ</h1>
            <p className="mt-2">
                Thanh toán cho đơn hàng <span className="font-semibold">{orderCode}</span> không thành công hoặc đã bị huỷ.
            </p>
            {error && <p className="text-red-600 mt-2">{error}</p>}
            <button
                onClick={handleGoWallet}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Quay về ví
            </button>
        </div>
    )
}
