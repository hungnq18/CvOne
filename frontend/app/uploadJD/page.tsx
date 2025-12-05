"use client";

import { API_ENDPOINTS, API_URL } from "@/api/apiConfig";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/providers/global_provider";
import Cookies from "js-cookie";
import { ArrowLeft, ArrowRight, FileText, UploadCloud } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Document, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { toast } from "react-hot-toast";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const uploadJDTranslations = {
  en: {
    title: "Upload The Job Description",
    subtitle: "Provide the job description for the role you're applying for.",
    clickToUpload: "Click to upload",
    orDrag: "or drag and drop",
    note: "DOCX, PDF (MAX. 5MB)",
    processing: "Processing...",
    finish: "Finish",
    back: "Back",
    error: "Please upload the job description first.",
    success: "JD uploaded successfully!",
    enterText: "Enter Job Description",
    placeholder: "Paste the job description here...",
  },
  vi: {
    title: "Tải lên mô tả công việc",
    subtitle:
      "Vui lòng cung cấp mô tả công việc cho vị trí bạn đang ứng tuyển.",
    clickToUpload: "Nhấn để tải lên",
    orDrag: "hoặc kéo thả tệp vào đây",
    note: "Định dạng DOCX, PDF (TỐI ĐA 5MB)",
    processing: "Đang xử lý...",
    finish: "Hoàn tất",
    back: "Quay lại",
    error: "Vui lòng tải lên mô tả công việc trước.",
    success: "Tải JD thành công!",
    enterText: "Nhập mô tả công việc",
    placeholder: "Dán nội dung mô tả công việc vào đây...",
  },
};

function UploadJDContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");
  const clFilename = searchParams.get("clFilename");

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [manualJdText, setManualJdText] = useState("");


  const { language } = useLanguage();
  const t = uploadJDTranslations[language];

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
    toast.success("Trích xuất nội dung JD PDF thành công!");
  };

  const handleContinue = async () => {
    if (!uploadedFile && !manualJdText) {
      toast.error(t.error);
      return;
    }

    if (uploadedFile && uploadedFile.type === "application/pdf" && !extractedText) {
      toast.error("Đang xử lý file PDF, vui lòng đợi hoặc thử upload lại.");
      return;
    }

    setIsUploading(true);

    const token = Cookies.get("token");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      // Retrieve CL text from localStorage
      const clText = localStorage.getItem("clText");
      if (!clText) {
        throw new Error("Không tìm thấy nội dung Cover Letter. Vui lòng thử lại từ bước trước.");
      }

      const coverLetterDataString = localStorage.getItem("coverLetterData");
      const coverLetterData = coverLetterDataString
        ? JSON.parse(coverLetterDataString)
        : {};
      const finalTemplateId = templateId || coverLetterData.templateId;

      if (!finalTemplateId) {
        throw new Error("Không tìm thấy template ID. Vui lòng chọn một template.");
      }

      const payload = {
        coverLetter: clText,
        jobDescription: extractedText || manualJdText,
        templateId: finalTemplateId,
      };

      const response = await fetch(
        `${API_URL}${API_ENDPOINTS.CL.EXTRACT_AI}`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Xử lý JD và CL thất bại");
      }

      toast.success("Xử lý CL và JD thành công!");

      // Clear localStorage after use
      localStorage.removeItem("clText");
      localStorage.removeItem("jdText");

      // Save the result for the next page
      localStorage.setItem("coverLetterData", JSON.stringify(responseData));

      const params = new URLSearchParams();
      if (finalTemplateId) params.append("templateId", finalTemplateId);
      // We are navigating to the creation page, maybe pass an ID from the response?
      // Assuming responseData contains info to proceed
      if (responseData.id) { // Or whatever identifier the backend returns
          params.append("clId", responseData.id);
      }

      router.push(`/createCLTemplate?${params.toString()}`);

    } catch (error: any) {
      console.error("Error during JD/CL processing:", error);
      toast.error(error.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="bg-white flex flex-col items-center justify-center py-12 min-h-screen">
      <div className="w-full max-w-6xl flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{t.title}</h1>
        <p className="text-gray-600 mb-12">{t.subtitle}</p>

        <div className="flex flex-col md:flex-row w-full gap-8 mb-16 px-4">
          {/* Left side: Manual Text Input */}
          <div className="flex-1">
            <Label htmlFor="manual-jd" className="mb-2 block text-lg font-semibold text-gray-700">
              {(t as any).enterText}
            </Label>
            <Textarea
              id="manual-jd"
              placeholder={(t as any).placeholder}
              className="h-64 resize-none bg-gray-50"
              value={manualJdText}
              onChange={(e) => setManualJdText(e.target.value)}
            />
          </div>

          {/* Right side: File Upload */}
          <div className="flex-1">
            <Label className="mb-2 block text-lg font-semibold text-gray-700">
              {language === 'vi' ? 'Tải lên file' : 'Upload file'}
            </Label>
            <label
              htmlFor="jd-upload"
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
                  <p className="mb-2 text-sm text-gray-500 text-center">
                    <span className="font-semibold">{t.clickToUpload}</span>{" "}
                    {t.orDrag}
                  </p>
                  <p className="text-xs text-gray-500">{t.note}</p>
                </div>
              )}
              <input
                id="jd-upload"
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
                    console.error("Error loading PDF for text extraction:", error);
                    toast.error(`Lỗi khi xử lý file PDF: ${error.message}`);
                  }}
                />
              </div>
            )}
          </div>
        </div>
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
          disabled={isUploading || (!manualJdText && !extractedText)}
          className="flex items-center gap-2 px-8 py-3 text-lg font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isUploading ? t.processing : t.finish}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default function UploadJDPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UploadJDContent />
    </Suspense>
  );
}
