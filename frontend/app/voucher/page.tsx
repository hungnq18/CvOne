'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Calendar, CheckCircle2, Loader, TicketPercent, Copy, ArrowRight } from "lucide-react";
import { getVouchersForUser, type Voucher } from "@/api/apiVoucher";
import { getCredit, saveVoucher } from "@/api/apiCredit";
import { useLanguage } from '@/providers/global_provider';

interface VoucherWithStatus extends Voucher {
  _id: string;
  isSaved?: boolean;
}

export default function VoucherPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [vouchers, setVouchers] = useState<VoucherWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [voucherData, creditData] = await Promise.all([
        getVouchersForUser(),
        getCredit().catch(() => null),
      ]);

      const savedIds = new Set<string>();
      if (creditData && Array.isArray((creditData as any).vouchers)) {
        (creditData as any).vouchers.forEach((v: any) => {
          if (!v || !v.voucherId) return;
          if (typeof v.voucherId === "string") {
            savedIds.add(v.voucherId);
          } else if (typeof v.voucherId === "object") {
            const id = v.voucherId._id || v.voucherId.id;
            if (id) savedIds.add(id);
          }
        });
      }

      const normalized: VoucherWithStatus[] = (Array.isArray(voucherData) ? voucherData : []).map(
        (v: Voucher | any) => {
          const id = v._id || v.id;
          return {
            ...v,
            _id: id,
            isSaved: savedIds.has(id),
          };
        },
      );

      setVouchers(normalized);
    } catch (err: any) {
      console.error("Error loading vouchers:", err);
      setError(err.message || (language === 'vi' ? "Không thể tải danh sách voucher" : "Failed to load vouchers"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVoucher = async (voucherId: string) => {
    try {
      setSavingId(voucherId);
      await saveVoucher(voucherId);
      setVouchers((prev) =>
        prev.map((v) => (v._id === voucherId ? { ...v, isSaved: true } : v)),
      );
    } catch (err: any) {
      console.error("Error saving voucher:", err);
      setError(err.message || (language === 'vi' ? "Không thể lưu voucher. Vui lòng thử lại." : "Failed to save voucher. Please try again."));
    } finally {
      setSavingId(null);
    }
  };

  const handleCopyCode = (voucher: VoucherWithStatus) => {
    navigator.clipboard.writeText(voucher.name);
    setCopiedId(voucher._id);
  };

  const getDiscountText = (voucher: VoucherWithStatus) => {
    if (voucher.discountType === "percent") {
      return language === 'vi'
        ? `Giảm ${voucher.discountValue}%`
        : `Discount ${voucher.discountValue}%`;
    }
    return language === 'vi'
      ? `Giảm ${voucher.discountValue.toLocaleString("vi-VN")}đ`
      : `Discount ${voucher.discountValue}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return language === 'vi'
      ? date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
      : date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

  const isExpired = (voucher: VoucherWithStatus) => {
    return new Date(voucher.endDate) < new Date();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4 mt-16">
        <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              {language === 'vi' ? "Đang tải voucher ưu đãi..." : "Loading vouchers..."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4 mt-16">
      <div className="max-w-5xl mx-auto">
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <TicketPercent className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                {language === 'vi' ? "Ưu đãi cho bạn" : "Vouchers for you"}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
                {language === 'vi'
                  ? "Lưu voucher vào ví để sử dụng khi nạp tiền hoặc thanh toán dịch vụ."
                  : "Save vouchers to your wallet to use for deposits or service payments."}
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              <button
                onClick={loadData}
                className="mt-2 text-sm font-semibold underline text-red-700 hover:text-red-800 dark:text-red-300"
              >
                {language === 'vi' ? "Thử tải lại" : "Retry"}
              </button>
            </div>
          </div>
        )}

        {vouchers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <p className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
              {language === 'vi'
                ? "Hiện chưa có voucher nào dành cho bạn"
                : "No vouchers available for you"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {language === 'vi'
                ? "Theo dõi các chương trình khuyến mãi để nhận thêm nhiều ưu đãi hấp dẫn."
                : "Follow promotions to get more great deals."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {vouchers.map((voucher) => {
              const expired = isExpired(voucher);
              const remaining =
                voucher.usageLimit && typeof voucher.usageLimit === "number"
                  ? Math.max((voucher.usageLimit || 0) - (voucher.usedCount || 0), 0)
                  : null;

              const usedPercent =
                voucher.usageLimit && voucher.usedCount
                  ? Math.min(Math.round((voucher.usedCount / voucher.usageLimit) * 100), 100)
                  : null;

              const isSaveable = voucher.type === "saveable";
              const canSave = isSaveable && !expired && !voucher.isSaved;

              return (
                <div
                  key={voucher._id}
                  className="flex overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
                >
                  {/* Left colored strip */}
                  <div className="relative flex w-28 flex-col items-center justify-center gap-2 bg-gradient-to-b from-blue-500 to-blue-600 p-3 text-center text-white">
                    <TicketPercent className="h-6 w-6" />
                    <p className="text-sm font-extrabold leading-tight uppercase tracking-wide">
                      {getDiscountText(voucher)}
                    </p>
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold">
                      Xử Lý - Choice
                    </span>
                    <div className="absolute inset-y-0 -right-3 flex flex-col justify-between py-3">
                      <span className="h-3 w-3 rounded-full bg-slate-50 dark:bg-slate-900" />
                      <span className="h-3 w-3 rounded-full bg-slate-50 dark:bg-slate-900" />
                    </div>
                  </div>

                  {/* Right content */}
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div className="mb-2">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <h3 className="flex-1 text-sm font-bold text-slate-900 dark:text-white">
                          {voucher.name}
                        </h3>
                        {expired ? (
                          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-300">
                            {language === 'vi' ? "Hết hạn" : "Expired"}
                          </span>
                        ) : voucher.isSaved ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            {language === 'vi' ? "Đã lưu" : "Saved"}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {voucher.description}
                      </p>
                    </div>

                    <div className="mb-2 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}
                        </span>
                      </div>
                      {remaining !== null && (
                        <span>
                          {language === 'vi' ? "Còn lại" : "Remaining"}:{" "}
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {remaining.toLocaleString(language === 'vi' ? "vi-VN" : "en-US")}
                          </span>
                        </span>
                      )}
                    </div>

                    {usedPercent !== null && (
                      <div className="mb-2">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${usedPercent}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          {language === 'vi'
                            ? `Đã dùng ${usedPercent}% tổng số lượt`
                            : `${usedPercent}% used`}
                        </p>
                      </div>
                    )}

                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <div>
                        <p className="font-medium">{language === 'vi' ? "Đơn tối thiểu" : "Min order"}</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {voucher.minOrderValue
                            ? language === 'vi'
                              ? `${voucher.minOrderValue.toLocaleString("vi-VN")}đ`
                              : `${voucher.minOrderValue}`
                            : language === 'vi'
                              ? "Không giới hạn"
                              : "No limit"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{language === 'vi' ? "Giảm tối đa" : "Max discount"}</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {voucher.maxDiscountValue
                            ? language === 'vi'
                              ? `${voucher.maxDiscountValue.toLocaleString("vi-VN")}đ`
                              : `${voucher.maxDiscountValue}`
                            : language === 'vi'
                              ? "Không giới hạn"
                              : "No limit"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      {savingId === voucher._id ? (
                        <button
                          disabled
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <Loader className="h-4 w-4 animate-spin" />
                          {language === 'vi' ? "Đang lưu..." : "Saving..."}
                        </button>
                      ) : expired ? (
                        <button
                          disabled
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-300 py-2 text-sm font-semibold text-slate-600 cursor-not-allowed"
                        >
                          {language === 'vi' ? "Voucher đã hết hạn" : "Voucher expired"}
                        </button>
                      ) : !isSaveable ? (
                        copiedId === voucher._id ? (
                          <button
                            onClick={() => router.push("/user/wallet/deposit")}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors animate-in fade-in zoom-in duration-300"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {language === 'vi' ? "Đã copy - Nạp tiền ngay" : "Copied - Deposit now"}
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCopyCode(voucher)}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                            {language === 'vi' ? "Sao chép mã" : "Copy code"}
                          </button>
                        )
                      ) : voucher.isSaved ? (
                        <button
                          disabled
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-200 py-2 text-sm font-semibold text-slate-600 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {language === 'vi' ? "Đã lưu vào ví" : "Saved to wallet"}
                        </button>
                      ) : (
                        <button
                          disabled={!canSave}
                          onClick={() => handleSaveVoucher(voucher._id)}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors disabled:bg-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed"
                        >
                          {language === 'vi' ? "Lưu" : "Save"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
