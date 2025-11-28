"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAllFeedback, type Feedback } from "@/api/feedbackApi"
import { toast } from "@/components/ui/use-toast"
import { MessageSquare } from "lucide-react"

const featureLabels: Record<string, string> = {
  translate_cv: "Translate CV with AI",
  generate_cv: "Generate CV with AI",
  generate_cl: "Generate Cover Letter with AI",
  rebuild_cv_pdf: "Rebuild CV from PDF",
  ai_interview: "AI Interview",
}

const featureColors: Record<string, string> = {
  translate_cv: "bg-blue-100 text-blue-700",
  generate_cv: "bg-emerald-100 text-emerald-700",
  generate_cl: "bg-pink-100 text-pink-700",
  rebuild_cv_pdf: "bg-purple-100 text-purple-700",
  ai_interview: "bg-orange-100 text-orange-700",
}

const getEmailFromFeedback = (feedback: Feedback): string | undefined => {
  const emailAnswer = feedback.answers.find(
    (a) => a.title.toLowerCase().includes("email") || a.title.toLowerCase().includes("mail"),
  )
  if (!emailAnswer) return undefined
  if (typeof emailAnswer.answer === "string") return emailAnswer.answer
  if (Array.isArray(emailAnswer.answer)) return emailAnswer.answer.join(", ")
  try {
    return JSON.stringify(emailAnswer.answer)
  } catch {
    return String(emailAnswer.answer)
  }
}

const formatDateTime = (value?: string | Date) => {
  if (!value) return "N/A"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "N/A"
  return d.toLocaleString("vi-VN")
}

export function ManageFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [featureFilter, setFeatureFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchFeedback = async () => {
    setIsLoading(true)
    try {
      const data = await getAllFeedback()
      // sort mới nhất lên trước
      const sorted = [...data].sort((a, b) => {
        const da = new Date(a.submittedAt || a.createdAt || 0).getTime()
        const db = new Date(b.submittedAt || b.createdAt || 0).getTime()
        return db - da
      })
      setFeedbacks(sorted)
    } catch (error) {
      console.error("Failed to fetch feedback", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách feedback.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedback()
  }, [])

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((fb) => {
      if (featureFilter !== "all" && fb.feature !== featureFilter) {
        return false
      }
      if (!searchTerm.trim()) return true
      const email = getEmailFromFeedback(fb) || ""
      const answersText = fb.answers
        .map((a) => `${a.title}: ${typeof a.answer === "string" ? a.answer : JSON.stringify(a.answer)}`)
        .join(" ")
      const haystack = (email + " " + answersText).toLowerCase()
      return haystack.includes(searchTerm.toLowerCase())
    })
  }, [feedbacks, featureFilter, searchTerm])

  const openDetail = (fb: Feedback) => {
    setSelectedFeedback(fb)
    setIsDialogOpen(true)
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            Manage Feedback
          </h1>
          <p className="text-muted-foreground">
            Xem và phân tích phản hồi người dùng từ các tính năng AI.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Input
            placeholder="Tìm theo email hoặc nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:w-64"
          />
          <Select value={featureFilter} onValueChange={setFeatureFilter}>
            <SelectTrigger className="sm:w-52">
              <SelectValue placeholder="Lọc theo tính năng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tính năng</SelectItem>
              <SelectItem value="translate_cv">{featureLabels.translate_cv}</SelectItem>
              <SelectItem value="generate_cv">{featureLabels.generate_cv}</SelectItem>
              <SelectItem value="generate_cl">{featureLabels.generate_cl}</SelectItem>
              <SelectItem value="rebuild_cv_pdf">{featureLabels.rebuild_cv_pdf}</SelectItem>
              <SelectItem value="ai_interview">{featureLabels.ai_interview}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Đang tải danh sách feedback...</p>
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chưa có feedback nào phù hợp.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredFeedbacks.map((fb) => {
            const email = getEmailFromFeedback(fb) || "Không rõ email"
            const label = featureLabels[fb.feature] ?? fb.feature
            const colorClass = featureColors[fb.feature] ?? "bg-slate-100 text-slate-700"
            return (
              <Card key={fb._id} className="flex flex-col">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge className={colorClass}>{label}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(fb.submittedAt || fb.createdAt)}
                    </span>
                  </div>
                  <CardTitle className="text-sm font-medium break-all">
                    {email}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-3">
                  <div className="text-sm text-muted-foreground line-clamp-3">
                    {fb.answers.length > 0 ? (
                      <>
                        <span className="font-medium">{fb.answers[0].title}:</span>{" "}
                        <span>
                          {typeof fb.answers[0].answer === "string"
                            ? fb.answers[0].answer
                            : JSON.stringify(fb.answers[0].answer)}
                        </span>
                      </>
                    ) : (
                      <span>Không có nội dung chi tiết.</span>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" onClick={() => openDetail(fb)}>
                      Xem chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setSelectedFeedback(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết feedback</DialogTitle>
            <DialogDescription>
              Xem đầy đủ các câu hỏi và câu trả lời từ biểu mẫu Google Form.
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge className={featureColors[selectedFeedback.feature] ?? "bg-slate-100 text-slate-700"}>
                  {featureLabels[selectedFeedback.feature] ?? selectedFeedback.feature}
                </Badge>
                <span className="text-muted-foreground">
                  Thời gian: {formatDateTime(selectedFeedback.submittedAt || selectedFeedback.createdAt)}
                </span>
              </div>
              {getEmailFromFeedback(selectedFeedback) && (
                <p className="text-sm">
                  <span className="font-medium">Email:&nbsp;</span>
                  <span>{getEmailFromFeedback(selectedFeedback)}</span>
                </p>
              )}
              <div className="space-y-3">
                {selectedFeedback.answers.map((ans, idx) => (
                  <div
                    key={idx}
                    className="rounded-md border bg-muted/40 px-3 py-2 text-sm space-y-1"
                  >
                    <p className="font-medium">{ans.title}</p>
                    <p className="text-muted-foreground whitespace-pre-wrap break-words">
                      {typeof ans.answer === "string"
                        ? ans.answer
                        : JSON.stringify(ans.answer, null, 2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}



