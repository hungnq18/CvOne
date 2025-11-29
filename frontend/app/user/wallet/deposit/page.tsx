'use client';
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import DepositForm from "@/components/wallet/deposit-form";
import { useLanguage } from "@/providers/global_provider";

const depositTranslations = {
    en: {
        back: "Back",
        title: "Deposit Money",
        description: "Add funds to your account",
    },
    vi: {
        back: "Quay lại",
        title: "Nạp Tiền",
        description: "Thêm tiền vào tài khoản của bạn",
    },
};

export default function DepositPage() {
    const { language } = useLanguage();
    const t = depositTranslations[language];

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <Link
                    href="/user/wallet"
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t.back}
                </Link>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-lg">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.title}</h1>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">{t.description}</p>
                        </div>
                    </div>

                    <DepositForm />
                </div>
            </div>
        </main>
    );
}
