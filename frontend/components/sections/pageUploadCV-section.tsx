"use client";

import { useCV } from "@/providers/cv-provider";
import { useLanguage } from "@/providers/global_provider";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { notify } from "@/lib/notify";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const translations = {
  en: {
    uploadCV: {
      title: "Upload PDF CV",
      buttonBack: "Go Back",
      buttonNext: "Next Step",
      previewTitle: "Review Your Uploaded CV:",
      pdfLoading: "Loading PDF...",
      uploadLabel: "Choose a PDF file",
      alerts: {
        invalidFormat: "Invalid file format. Please select a PDF file.",
        readError: "Could not read the selected file.",
        extractError: "Could not extract content from this PDF file.",
        previewError: (message: string) =>
          `Cannot load PDF preview: ${message}`,
        uploadRequired: "Please upload a PDF file before continuing.",
      },
    },
  },
  vi: {
    uploadCV: {
      title: "Tải lên CV PDF",
      buttonBack: "Quay lại",
      buttonNext: "Bước tiếp theo",
      previewTitle: "Xem Lại CV bạn đã tải lên:",
      pdfLoading: "Đang tải PDF...",
      uploadLabel: "Chọn file PDF",
      alerts: {
        invalidFormat: "Định dạng file không hợp lệ. Vui lòng chọn file PDF.",
        readError: "Không thể đọc file đã chọn.",
        extractError: "Không thể trích xuất nội dung từ file PDF này.",
        previewError: (message: string) =>
          `Không thể tải preview PDF: ${message}`,
        uploadRequired: "Vui lòng tải lên file PDF trước khi tiếp tục.",
      },
    },
  },
};

type OnDocumentLoadSuccess = NonNullable<
  React.ComponentProps<typeof Document>["onLoadSuccess"]
>;

function UploadPDFInput({
  onFileChange,
  disabled,
  label,
}: {
  onFileChange: (file: File) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <label
      htmlFor="file-upload-modal"
      className="w-full flex flex-col justify-center text-center items-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 bg-white p-4 rounded-md shadow-sm"
    >
      <span className="font-normal text-gray-600">{label}</span>
      <input
        type="file"
        id="file-upload-modal"
        className="hidden"
        accept="application/pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileChange(file);
        }}
        disabled={disabled}
      />
    </label>
  );
}

function UploadCVPage() {
  const { language } = useLanguage();
  const t = translations[language].uploadCV;

  const { pdfFile, setPdfFile } = useCV();
  const [output, setOutput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [fileName, setFileName] = useState<string>("");

  const searchParams = useSearchParams();
  const templateId = searchParams.get("id");
  const router = useRouter();

  const memoizedFile = useMemo(() => {
    if (!pdfFile) return null;
    return { data: new Uint8Array(pdfFile) };
  }, [pdfFile]);

  const handleFileUpload = (file: File) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      setOutput(JSON.stringify({ error: t.alerts.invalidFormat }, null, 2));
      setPdfFile(null);
      setNumPages(0);
      setFileName("");
      return;
    }

    setIsLoading(true);
    setOutput("");
    setPdfFile(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        setPdfFile(new Uint8Array(arrayBuffer));
      } catch (error) {
        // console.error("Lỗi khi đọc file:", error);
        setOutput(JSON.stringify({ error: t.alerts.readError }, null, 2));
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onDocumentLoadSuccess: OnDocumentLoadSuccess = async (pdf) => {
    setNumPages(pdf.numPages);
    setIsLoading(false);
  };

  const handleNextStep = () => {
    if (!pdfFile) {
      notify.error(t.alerts.uploadRequired);
      return;
    }

    router.push(`/job-description-cv?id=${templateId}`);
  };

  return (
    <div className="p-6 max-w-7xl mt-10 pt-20 pb-20 mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 flex flex-col">
          <h2 className="text-2xl font-bold mb-4">{t.title}</h2>
          <UploadPDFInput
            onFileChange={handleFileUpload}
            disabled={isLoading}
            label={t.uploadLabel}
          />
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {t.buttonBack}
            </button>
            <button
              onClick={handleNextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {t.buttonNext}
            </button>
          </div>
        </div>
        <div className="w-full md:w-2/3 bg-gray-50">
          <div className="border rounded shadow p-4 ">
            <h3 className="text-lg font-semibold mb-2">{t.previewTitle}</h3>
            {pdfFile && (
              <Document
                file={memoizedFile}
                loading={t.pdfLoading}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) => {
                  // console.error("Lỗi khi tải PDF preview:", error);
                  setOutput(
                    JSON.stringify(
                      { error: t.alerts.previewError(error.message) },
                      null,
                      2
                    )
                  );
                  setIsLoading(false);
                }}
              >
                {Array.from(new Array(numPages), (_, i) => (
                  <Page
                    key={`page_${i + 1}`}
                    pageNumber={i + 1}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                  />
                ))}
              </Document>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadCVPage;
