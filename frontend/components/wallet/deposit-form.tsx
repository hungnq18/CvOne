"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Loader,
  DollarSign,
  AlertCircle,
  Tag,
  X,
  Check,
  QrCode,
  CreditCard,
} from "lucide-react";
import { vndToToken, formatVnd } from "@/utils/currency";
import { createOrder, type Order } from "@/api/apiOrder";
import {
  getVoucherById,
  getVouchersForUser,
  type Voucher,
} from "@/api/apiVoucher";
import { useLanguage } from "@/providers/global_provider";

const DEPOSIT_PACKAGES = [
  { id: 1, amount: 20000, label: "20.000đ" },
  { id: 2, amount: 50000, label: "50.000đ" },
  { id: 3, amount: 100000, label: "100.000đ" },
  { id: 4, amount: 200000, label: "200.000đ" },
  { id: 5, amount: 500000, label: "500.000đ" },
  { id: 6, amount: 1000000, label: "1.000.000đ" },
];

const MIN_AMOUNT = 10000;
const MAX_AMOUNT = 10000000;
const TRANSACTION_FEE_RATE = 0.02;

// Song ngữ
const translations = {
  vi: {
    selectPackage: "Chọn gói nạp",
    customAmount: "Nhập số tiền khác",
    minAmount: "Số tiền tối thiểu",
    maxAmount: "tối đa",
    paymentMethod: "Phương thức thanh toán",
    qr: "QR Code",
    qrDesc: "Quét mã để thanh toán",
    card: "Thẻ tín dụng",
    cardDesc: "Thanh toán bằng thẻ (Tạm khóa)",
    voucher: "Mã giảm giá (nếu có)",
    apply: "Áp dụng",
    checking: "Đang kiểm tra...",
    orderSummary: "Tóm tắt đơn hàng",
    depositAmount: "Số tiền nạp",
    discount: "Giảm giá",
    amountAfterDiscount: "Số tiền sau giảm",
    transactionFee: "Phí giao dịch (2%)",
    total: "Tổng cộng",
    cancel: "Hủy",
    proceed: "Tiếp tục thanh toán",
    voucherInvalid: "Mã voucher không hợp lệ",
    voucherInactive: "Voucher không còn hoạt động",
    voucherNotStarted: "Voucher chưa đến thời gian sử dụng",
    voucherExpired: "Voucher đã hết hạn",
    voucherMinOrder: "Đơn hàng tối thiểu {min} để sử dụng voucher này",
    amountInvalid: "Vui lòng chọn hoặc nhập số tiền hợp lệ",
    amountTooSmall: "Số tiền tối thiểu là {min}",
    amountTooLarge: "Số tiền tối đa là {max}",
    processing: "Đang xử lý...",
  },
  en: {
    selectPackage: "Select Deposit Package",
    customAmount: "Enter custom amount",
    minAmount: "Minimum amount",
    maxAmount: "Maximum",
    paymentMethod: "Payment Method",
    qr: "QR Code",
    qrDesc: "Scan QR to pay",
    card: "Credit Card",
    cardDesc: "Pay by card (Temporarily locked)",
    voucher: "Voucher code (optional)",
    apply: "Apply",
    checking: "Checking...",
    orderSummary: "Order Summary",
    depositAmount: "Deposit amount",
    discount: "Discount",
    amountAfterDiscount: "Amount after discount",
    transactionFee: "Transaction fee (2%)",
    total: "Total",
    cancel: "Cancel",
    proceed: "Proceed to Checkout",
    voucherInvalid: "Invalid voucher code",
    voucherInactive: "Voucher is inactive",
    voucherNotStarted: "Voucher not valid yet",
    voucherExpired: "Voucher expired",
    voucherMinOrder: "Minimum order {min} to use this voucher",
    amountInvalid: "Please select or enter a valid amount",
    amountTooSmall: "Minimum amount is {min}",
    amountTooLarge: "Maximum amount is {max}",
    processing: "Processing...",
  },
};

export default function DepositForm() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];

  const [selectedPackage, setSelectedPackage] = useState<number | null>(1);
  const [customAmount, setCustomAmount] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [validatingVoucher, setValidatingVoucher] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "card">("qr");

  const amount = useCustom
    ? Number.parseInt(customAmount) || 0
    : DEPOSIT_PACKAGES.find((p) => p.id === selectedPackage)?.amount || 0;

  const calculateDiscount = (baseAmount: number, voucher: Voucher | null) => {
    if (!voucher || !voucher.isActive) return 0;
    const now = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);
    if (now < startDate || now > endDate) return 0;
    if (voucher.minOrderValue && baseAmount < voucher.minOrderValue) return 0;

    let discount = 0;
    if (voucher.discountType === "percent") {
      discount = baseAmount * (voucher.discountValue / 100);
      if (voucher.maxDiscountValue && discount > voucher.maxDiscountValue) {
        discount = voucher.maxDiscountValue;
      }
    } else if (voucher.discountType === "amount") {
      discount = voucher.discountValue;
    }

    return Math.min(discount, baseAmount);
  };

  const discount = calculateDiscount(amount, voucher);
  const amountAfterDiscount = Math.max(amount - discount, 0);
  const transactionFee = amountAfterDiscount * TRANSACTION_FEE_RATE;
  const totalAmount = amountAfterDiscount + transactionFee;
  const tokens = vndToToken(amountAfterDiscount);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError(t.voucherInvalid);
      return;
    }
    try {
      setValidatingVoucher(true);
      setVoucherError(null);
      const allVouchers = await getVouchersForUser();
      const voucherName = voucherCode.trim().toLowerCase();
      const foundVoucher = allVouchers.find(
        (v: Voucher) => v.name.toLowerCase() === voucherName
      );

      if (!foundVoucher || !foundVoucher._id) {
        setVoucherError(t.voucherInvalid);
        setVoucher(null);
        return;
      }

      const voucherData = await getVoucherById(foundVoucher._id);
      const now = new Date();
      const startDate = new Date(voucherData.startDate);
      const endDate = new Date(voucherData.endDate);

      if (!voucherData.isActive) {
        setVoucherError(t.voucherInactive);
        setVoucher(null);
        return;
      }
      if (now < startDate) {
        setVoucherError(t.voucherNotStarted);
        setVoucher(null);
        return;
      }
      if (now > endDate) {
        setVoucherError(t.voucherExpired);
        setVoucher(null);
        return;
      }
      if (voucherData.minOrderValue && amount < voucherData.minOrderValue) {
        setVoucherError(
          t.voucherMinOrder.replace(
            "{min}",
            formatVnd(voucherData.minOrderValue)
          )
        );
        setVoucher(null);
        return;
      }

      setVoucher(voucherData);
    } catch (err: any) {
      // console.error(err)
      setVoucherError(err.message || t.voucherInvalid);
      setVoucher(null);
    } finally {
      setValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucher(null);
    setVoucherCode("");
    setVoucherError(null);
  };

  const handleProceedToCheckout = async () => {
    if (amount <= 0) {
      setError(t.amountInvalid);
      return;
    }
    if (amount < MIN_AMOUNT) {
      setError(t.amountTooSmall.replace("{min}", formatVnd(MIN_AMOUNT)));
      return;
    }
    if (amount > MAX_AMOUNT) {
      setError(t.amountTooLarge.replace("{max}", formatVnd(MAX_AMOUNT)));
      return;
    }
    if (voucher && voucher.minOrderValue && amount < voucher.minOrderValue) {
      setError(
        t.voucherMinOrder.replace("{min}", formatVnd(voucher.minOrderValue))
      );
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const orderData: Partial<Order> = {
        totalToken: tokens,
        price: amount,
        voucherId: voucher?._id,
        paymentMethod: paymentMethod === "qr" ? "payos" : "card",
      };

      const response = await createOrder(orderData as Order);
      if (paymentMethod === "qr") {
        if (response.paymentLink) window.location.href = response.paymentLink;
        else {
          setError("Cannot create payment link");
          setIsLoading(false);
        }
      } else {
        const orderId = response.order?._id || response.order?.orderCode;
        router.push(
          `/payWithCard?orderId=${orderId}&amount=${Math.ceil(
            totalAmount
          )}&tokens=${tokens}`
        );
      }
    } catch (err: any) {
      // console.error(err)
      setError(err.message || "Checkout error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            ×
          </button>
        </div>
      )}

      {/* Deposit Packages */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t.selectPackage}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DEPOSIT_PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => {
                setSelectedPackage(pkg.id);
                setUseCustom(false);
                setError(null);
              }}
              className={`p-4 rounded-lg font-semibold transition-all border-2 ${
                !useCustom && selectedPackage === pkg.id
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
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t.customAmount}
        </h2>
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-600 dark:text-slate-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <input
            type="number"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            maxLength={50}
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setUseCustom(true);
              setError(null);
              if (
                voucher &&
                voucher.minOrderValue &&
                Number.parseInt(e.target.value) < voucher.minOrderValue
              ) {
                handleRemoveVoucher();
              }
            }}
            placeholder={t.customAmount}
            className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-blue-500 dark:focus:border-blue-500 outline-none text-slate-900 dark:text-white dark:bg-slate-700 transition-colors"
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          {t.minAmount}: {formatVnd(MIN_AMOUNT)}, {t.maxAmount}:{" "}
          {formatVnd(MAX_AMOUNT)}
        </p>
      </div>

      {/* Payment Method */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t.paymentMethod}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {["qr", "card"].map((method) => {
            const isDisabled = method === "card"; // Khóa thẻ
            return (
              <button
                key={method}
                type="button"
                onClick={() =>
                  !isDisabled && setPaymentMethod(method as "qr" | "card")
                }
                disabled={isDisabled}
                className={`p-6 rounded-lg border-2 transition-all 
                        ${
                          paymentMethod === method && !isDisabled
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                        }
                        ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`p-3 rounded-lg 
                            ${
                              paymentMethod === method && !isDisabled
                                ? "bg-blue-600 text-white"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                            }`}
                  >
                    {method === "qr" ? (
                      <QrCode className="w-6 h-6" />
                    ) : (
                      <CreditCard className="w-6 h-6" />
                    )}
                  </div>
                  <div className="text-center">
                    <p
                      className={`font-semibold ${
                        paymentMethod === method && !isDisabled
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {method === "qr" ? t.qr : t.card}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {method === "qr" ? t.qrDesc : t.cardDesc}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voucher Code */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t.voucher}
        </h2>
        {voucher ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="font-semibold text-green-800 dark:text-green-200">
                    {voucher.name}
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                  {voucher.description}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Giảm:{" "}
                  {voucher.discountType === "percent"
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
                maxLength={50}
                value={voucherCode}
                onChange={(e) => {
                  setVoucherCode(e.target.value);
                  setVoucherError(null);
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleApplyVoucher();
                }}
                placeholder={t.voucher}
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
                  {t.checking}
                </>
              ) : (
                t.apply
              )}
            </button>
          </div>
        )}
        {voucherError && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            {voucherError}
          </p>
        )}
      </div>

      {/* Order Summary */}
      {amount > 0 && (
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            {t.orderSummary}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">
                {t.depositAmount}
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatVnd(amount)}đ
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">
                  {t.discount}
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  -{formatVnd(discount)}đ
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">
                {t.amountAfterDiscount}
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatVnd(amountAfterDiscount)}đ
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">
                {t.transactionFee}
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatVnd(Math.ceil(transactionFee))}đ
              </span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                {t.total}
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatVnd(Math.ceil(totalAmount))}đ
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/user/wallet"
          className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
        >
          {t.cancel}
        </Link>
        <button
          onClick={handleProceedToCheckout}
          disabled={
            isLoading ||
            amount <= 0 ||
            amount < MIN_AMOUNT ||
            amount > MAX_AMOUNT
          }
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              {t.processing}
            </>
          ) : (
            <>
              {t.proceed}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
