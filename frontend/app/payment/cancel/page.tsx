"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { updateOrderStatus } from "@/api/apiOrder";
import { useLanguage } from "@/providers/global_provider";

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderCode = searchParams.get("orderCode") || "";

  useEffect(() => {
    const updateStatus = async () => {
      try {
        setLoading(true);
        await updateOrderStatus(orderCode, "cancelled");
      } catch (err) {
        setError(
          language === "vi"
            ? "Cập nhật trạng thái đơn hàng thất bại."
            : "Failed to update order status."
        );
      } finally {
        setLoading(false);
      }
    };

    if (orderCode) {
      updateStatus();
    } else {
      setError(
        language === "vi"
          ? "Không tìm thấy orderCode."
          : "Order code not found."
      );
      setLoading(false);
    }
  }, [orderCode, language]);

  const handleGoWallet = () => router.push("/user/wallet");

  if (loading)
    return (
      <p className="text-center mt-10">
        {language === "vi" ? "Đang xử lý..." : "Processing..."}
      </p>
    );

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 text-center">
      <h1 className="text-3xl font-bold text-red-600">
        {language === "vi" ? "Thanh toán bị huỷ" : "Payment Cancelled"}
      </h1>
      <p className="mt-2">
        {language === "vi" ? "Thanh toán cho đơn hàng" : "Payment for order"}{" "}
        <span className="font-semibold">{orderCode}</span>{" "}
        {language === "vi"
          ? "không thành công hoặc đã bị huỷ."
          : "was unsuccessful or cancelled."}
      </p>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      <button
        onClick={handleGoWallet}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {language === "vi" ? "Quay về ví" : "Go to Wallet"}
      </button>
    </div>
  );
}
