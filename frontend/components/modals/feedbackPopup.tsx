"use client"

import { useState } from "react"
import { X, Gift, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FeedbackPopupProps {
    feature: "job" | "interview" | "cv" | "cover-letter" | "translate" // truyền đi từ trang chính để đến đúng form feedback
    onClose?: () => void
    // Callback được gọi khi user bấm "Gửi phản hồi"
    onFeedbackSent?: () => void
}

export function FeedbackPopup({ feature, onClose, onFeedbackSent }: FeedbackPopupProps) {
    const [isOpen, setIsOpen] = useState(true)

    const feedbackForms = {
        job: {
            title: "Suggest Job with AI",
            url: "https://docs.google.com/forms/d/e/1FAIpQLSfOcKTSFPWM4lhAxKUKaziilcmJ9EiNOcbrfybh-135jSwCdA/viewform?usp=dialog",
        },
        interview: {
            title: "Interview with AI",
            url: "https://docs.google.com/forms/d/e/1FAIpQLSdQcAPbTMEzKrAp7PqTo0i2yfxcbHA4-jAUugsDtfl1aqU1uA/viewform?usp=dialog",
        },
        cv: {
            title: "Create CV with AI",
            url: "https://docs.google.com/forms/d/e/1FAIpQLScmHewyHgf2Tx0DmGTM5w5OgS16L2UT9asspylbHQW9nR5YnA/viewform?usp=dialog",
        },
        "cover-letter": {
            title: "Create Cover Letter with AI",
            url: "https://docs.google.com/forms/d/e/1FAIpQLSdaDcM-DloJ9RxBYZ1TuXATslLA5Wx57uk3udYYUqUKrfH-2A/viewform?usp=publish-editor",
        },
        translate: {
            title: "AI-Translate",
            url: "https://docs.google.com/forms/d/e/1FAIpQLSeVE4SwFZmsLAn69QvQ-Rt-NEHExYlW46xlTaHLDAXQ-ooobA/viewform?usp=dialog",
        },
    }

    const currentForm = feedbackForms[feature]

    const handleClose = () => {
        setIsOpen(false)
        onClose?.()
    }

    const handleSendFeedback = () => {
        window.open(currentForm.url, "_blank")
        setIsOpen(false)
        onFeedbackSent?.()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 pointer-events-none" />

                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/50"
                    aria-label="Close feedback popup"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="relative p-8 pt-10">
                    <div className="flex items-start gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <MessageSquare className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-1">Phản hồi!</h2>
                            <p className="text-sm text-muted-foreground">Giúp chúng tôi cải thiện {currentForm.title}</p>
                        </div>
                    </div>

                    <p className="text-foreground mb-6 leading-relaxed">
                        Phản hồi của bạn giúp chúng tôi phát triển các công cụ AI tốt hơn. Hãy cho chúng tôi biết suy nghĩ của bạn và
                        nhận một mã giảm giá như lời cảm ơn!
                    </p>

                    <div className="mb-8 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                        <div className="flex items-start gap-3">
                            <Gift className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground mb-1">Phiếu giảm giá độc quyền</p>
                                <p className="text-sm text-muted-foreground">Hoàn thành đánh giá để nhận thưởng</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={handleSendFeedback}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
                        >
                            Gửi phản hồi
                        </Button>
                        <Button onClick={handleClose} variant="outline" className="flex-1 bg-transparent">
                            Để sau
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
