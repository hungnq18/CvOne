"use client"

import { useState } from "react"
import { X, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FeedbackSuccessPopup() {
    const [isOpen, setIsOpen] = useState(true)
    const handleClose = () => setIsOpen(false)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-amber-100 rounded-full">
                                <Gift className="w-8 h-8 text-amber-600" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Cảm ơn bạn đã gửi Feedback!
                        </h2>

                        <p className="text-gray-600 text-base leading-relaxed">
                            Voucher ưu đãi đã được thêm vào ví của bạn khi hoàn thành.
                        </p>
                    </div>

                    {/* OK button */}
                    <Button
                        onClick={handleClose}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                        Đã hiểu
                    </Button>
                </div>
            </div>
        </div>
    )
}
