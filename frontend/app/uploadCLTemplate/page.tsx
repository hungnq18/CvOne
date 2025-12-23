"use client";

import { useLanguage } from "@/providers/global_provider";
import { ArrowLeft, ArrowRight, FileText, UploadCloud } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Document, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { toast } from "react-hot-toast";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const uploadCLTranslations = {
  en: {
    title: "Upload Your Cover Letter",
    subtitle: "Upload your existing cover letter to get started.",
    clickToUpload: "Click to upload",
    orDrag: "or drag and drop",
    note: "DOCX, PDF (MAX. 5MB)",
    uploading: "Uploading...",
    continue: "Continue",
    back: "Back",
    error: "Please upload your cover letter first.",
    success: "File uploaded successfully!",
  },
  vi: {
    title: "Tải lên thư xin việc",
    subtitle: "Tải lên thư xin việc hiện tại của bạn để bắt đầu.",
    clickToUpload: "Nhấn để tải lên",
    orDrag: "hoặc kéo và thả",
    note: "Định dạng DOCX, PDF (TỐI ĐA 5MB)",
    uploading: "Đang tải lên...",
    continue: "Tiếp tục",
    back: "Quay lại",
    error: "Vui lòng tải lên thư xin việc trước.",
    success: "Tải tệp thành công!",
  },
};

function UploadCLTemplateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = uploadCLTranslations[language];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExtractedText(null); // Reset text on new file
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === "application/pdf") {
        setUploadedFile(file);
      } else {
        toast.error("Vui lòng chỉ chọn file PDF.");
        setUploadedFile(null);
      }
    }
  };

  const onDocumentLoadSuccess = async (pdf: any) => {
    let textContent = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      textContent += text.items.map((s: any) => s.str).join(" ");
    }
    setExtractedText(textContent);
    toast.success("Trích xuất nội dung PDF thành công!");
  };

  const handleContinue = async () => {
    if (!uploadedFile) {
      toast.error(t.error);
      return;
    }

    if (uploadedFile.type === "application/pdf" && !extractedText) {
      toast.error("Đang xử lý file PDF, vui lòng đợi hoặc thử upload lại.");
      return;
    }

    // Since text extraction is async, we simulate the loading state for it as well
    setIsUploading(true);

    // For now, let's simulate success and move on
    // The actual API call will be in the JD upload page.
    setIsUploading(false);

    if (!extractedText) {
      toast.error("Không thể trích xuất nội dung từ file. Vui lòng thử lại.");
      return;
    }

    toast.success(
      "Đã lưu nội dung CL, bạn sẽ được chuyển đến trang tải lên JD."
    );

    // Store text in localStorage to pass to the next page
    localStorage.setItem("clText", extractedText);

    const params = new URLSearchParams();
    if (templateId) {
      params.append("templateId", templateId);
    }
    // Note: clFilename is no longer available.
    // We can pass a flag instead.
    params.append("clFromText", "true");

    router.push(`/uploadJD?${params.toString()}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="bg-white flex flex-col items-center justify-center py-12 min-h-screen">
      <div className="w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{t.title}</h1>
        <p className="text-gray-600 mb-12">{t.subtitle}</p>

        <div className="w-full max-w-lg mb-16">
          <label
            htmlFor="cover-letter-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            {uploadedFile ? (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileText className="w-10 h-10 mb-3 text-blue-500" />
                <p className="mb-2 text-sm text-gray-700 font-semibold">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">{t.clickToUpload}</span>{" "}
                  {t.orDrag}
                </p>
                <p className="text-xs text-gray-500">{t.note}</p>
              </div>
            )}
            <input
              id="cover-letter-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf"
            />
          </label>
          {/* Hidden Document component for processing */}
          {uploadedFile && (
            <div style={{ display: "none" }}>
              <Document
                file={uploadedFile}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) => {
                  toast.error(`Lỗi khi xử lý file PDF: ${error.message}`);
                }}
              />
            </div>
          )}
        </div>

        <div className="flex w-full justify-between max-w-2xl">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-gray-700 bg-white border border-gray-400 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
            {t.back}
          </button>
          <button
            onClick={handleContinue}
            disabled={!uploadedFile || isUploading || !extractedText}
            className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isUploading ? t.uploading : t.continue}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UploadCLTemplatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UploadCLTemplateContent />
    </Suspense>
  );
}
