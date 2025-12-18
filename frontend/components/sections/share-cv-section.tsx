"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { FileDown, Loader2 } from "lucide-react"
import { useLanguage } from "@/providers/global_provider"
import { templateComponentMap } from "@/components/cvTemplate/index"
import { notify } from "@/lib/notify"
import { getDefaultSectionPositions } from "../cvTemplate/defaultSectionPositions"

interface CVShareSectionProps {
  userData?: any
  cvTitle?: string
  cvTemplate?: any
  onDownloadPDF?: () => Promise<void>
  isLoading?: boolean
}

const translations = {
  en: {
    downloadCV: "Download CV",
    shareCV: "Shared CV",
    subtitle: "Your professional profile, ready to share",
    loadingTemplate: "Loading Template...",
    templateComponentNotFound: (title: string) => `Component for "${title}" not found.`,
    pdfCreateEnvError: "Cannot create environment to export PDF.",
    pdfCreateError: "An error occurred while exporting the PDF file.",
  },
  vi: {
    downloadCV: "Tải về CV",
    shareCV: "CV đã được chia sẻ",
    subtitle: "Hồ sơ chuyên nghiệp của bạn, sẵn sàng chia sẻ",
    loadingTemplate: "Đang tải Mẫu...",
    templateComponentNotFound: (title: string) => `Không tìm thấy component cho "${title}".`,
    pdfCreateEnvError: "Không thể tạo môi trường để xuất PDF.",
    pdfCreateError: "Đã có lỗi xảy ra khi xuất file PDF.",
  },
}

export const CVShareSection: React.FC<CVShareSectionProps> = ({
  userData,
  cvTitle,
  cvTemplate: propCvTemplate,
  onDownloadPDF,
  isLoading = false,
}) => {
  const { language } = useLanguage()
  const t = translations[language]
  const currentTemplate = propCvTemplate
  const previewRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [containerWidth, setContainerWidth] = useState<number>(0)

  // Measure available width so the preview scales properly (use actual preview container width)
  useEffect(() => {
    const el = previewRef.current
    if (!el) return
    const measure = () => setContainerWidth(el.clientWidth)
    const ro = new ResizeObserver(measure)
    measure()
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const renderCVForPDF = () => {
    if (!currentTemplate || !userData) return null
    const TemplateComponent = templateComponentMap?.[currentTemplate.title]
    if (!TemplateComponent) return null

    const sectionPositions =
      currentTemplate.data?.sectionPositions ||
      getDefaultSectionPositions(currentTemplate.title)

    const componentData = {
      ...currentTemplate.data,
      userData: userData,
      sectionPositions,
    }

    return (
      <div>
        <TemplateComponent
          data={componentData}
          isPdfMode={true}
          language={language}
        />
      </div>
    )
  }

  const handleDownloadPDF = async () => {
    const iframe = document.createElement("iframe")
    iframe.style.position = "fixed"
    iframe.style.width = "794px"
    iframe.style.height = "1123px"
    iframe.style.left = "-9999px"
    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentWindow?.document
    if (!iframeDoc) {
      notify.error(t.pdfCreateEnvError)
      document.body.removeChild(iframe)
      return
    }

    const head = iframeDoc.head
    document
      .querySelectorAll('style, link[rel="stylesheet"]')
      .forEach((node) => {
        head.appendChild(node.cloneNode(true))
      })

    const mountNode = iframeDoc.createElement("div")
    iframeDoc.body.appendChild(mountNode)

    let root: any = null

    try {
      await new Promise((resolve) => setTimeout(resolve, 300))

      const { createRoot } = await import("react-dom/client")
      root = createRoot(mountNode)
      root.render(renderCVForPDF())

      await new Promise((resolve) => setTimeout(resolve, 500))

      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).default

      const canvas = await html2canvas(iframe.contentWindow.document.body, {
        scale: 2,
        useCORS: true,
        onclone: (clonedDoc) => {
            const elements = clonedDoc.querySelectorAll('.tracking-wider')
            elements.forEach((el) => {
                (el as HTMLElement).style.letterSpacing = 'normal'
            })
        }
      })

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const imgHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, imgHeight)
      pdf.save(`${cvTitle || "cv"}.pdf`)
    } catch (error) {
      console.error(t.pdfCreateError, error)
      notify.error(t.pdfCreateError)
    } finally {
      if (root) {
        root.unmount()
      }
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe)
      }
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await handleDownloadPDF()
    } finally {
      setIsDownloading(false)
    }
  }

  const renderCVPreview = () => {
    if (isLoading || !currentTemplate || !userData) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500">{t.loadingTemplate}</p>
        </div>
      )
    }

    const TemplateComponent = templateComponentMap?.[currentTemplate.title]
    if (!TemplateComponent) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500">{t.templateComponentNotFound(currentTemplate.title)}</p>
        </div>
      )
    }

    const sectionPositions =
      currentTemplate.data?.sectionPositions ||
      getDefaultSectionPositions(currentTemplate.title)

    const componentData = {
      ...currentTemplate.data,
      userData: userData,
      sectionPositions,
    }

    const templateOriginalWidth = 794
    const templateOriginalHeight = templateOriginalWidth * (297 / 210)
    const safeWidth = Math.max(200, Math.min(containerWidth || 0, templateOriginalWidth))
    const scaleFactor = safeWidth / templateOriginalWidth

    return (
      <div className="w-full" ref={previewRef}>
        <div className="relative mx-auto" style={{ width: `${safeWidth}px`, height: `${safeWidth * (297 / 210)}px` }}>
          <div
            className="absolute top-0 left-0 origin-top-left"
            style={{
              width: `${templateOriginalWidth}px`,
              height: `${templateOriginalHeight}px`,
              transform: `scale(${scaleFactor})`,
              transformOrigin: "top left",
            }}
          >
            <TemplateComponent
              data={componentData}
              isPdfMode={true}
              language={language}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px);
            opacity: 0.15;
          }
          50% {
            transform: translateY(-20px);
            opacity: 0.25;
          }
        }

        @keyframes float-slower {
          0%, 100% {
            transform: translateY(0px);
            opacity: 0.1;
          }
          50% {
            transform: translateY(-30px);
            opacity: 0.15;
          }
        }

        .blur-circle-1 {
          animation: float-slow 8s ease-in-out infinite;
        }

        .blur-circle-2 {
          animation: float-slower 12s ease-in-out infinite;
        }

        .blur-circle-3 {
          animation: float-slow 10s ease-in-out infinite;
          animation-delay: 2s;
        }

        .cv-preview-container {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
        }

        .cv-preview-container::-webkit-scrollbar {
          width: 6px;
        }

        .cv-preview-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .cv-preview-container::-webkit-scrollbar-thumb {
          background-color: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
        }

        .cv-preview-container::-webkit-scrollbar-thumb:hover {
          background-color: rgba(148, 163, 184, 0.5);
        }
      `}</style>

      <section className="relative w-full overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50" />

        {/* Decorative blur circles with custom animations */}
        <div className="blur-circle-1 absolute top-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="blur-circle-2 absolute bottom-32 left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="blur-circle-3 absolute top-1/2 left-1/3 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center px-4 py-12 md:py-16 lg:py-24">
          <div className="w-full max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Left Content Section */}
              <div className="flex flex-col justify-center">
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 text-balance leading-tight">
                      {t.shareCV}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 text-balance">{t.subtitle}</p>
                  </div>

                  {/* Download Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading || isLoading}
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-8 rounded-xl hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          {language === "en" ? "Downloading..." : "Đang tải..."}
                        </>
                      ) : (
                        <>
                          <FileDown size={20} />
                          {t.downloadCV}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Info text */}
                  <div className="pt-8 text-slate-600">
                    <p className="text-base leading-relaxed">
                      {language === "en"
                        ? "Download your CV as a PDF and share it with potential employers or clients. Your professional profile is ready to make an impression."
                        : "Tải về CV của bạn dưới dạng PDF và chia sẻ với các nhà tuyển dụng hoặc khách hàng tiềm năng. Hồ sơ chuyên nghiệp của bạn sẵn sàng để tạo ấn tượng."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right CV Preview Section - Full height with proper A4 aspect ratio */}
              <div className="lg:col-span-1 w-full">
                <div className="flex justify-center">
                  <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-100">
                    <div className="cv-preview-container bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-6 flex justify-center items-start min-h-screen md:min-h-[900px] lg:min-h-[1000px] max-h-[90vh] overflow-y-auto">
                      {renderCVPreview()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default CVShareSection
