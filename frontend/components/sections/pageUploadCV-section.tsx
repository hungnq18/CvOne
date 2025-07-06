"use client";

import { useState } from "react";
import React from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { useCV } from "@/providers/cv-provider";
import { useSearchParams, useRouter } from "next/navigation";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type OnDocumentLoadSuccess = NonNullable<
  React.ComponentProps<typeof Document>["onLoadSuccess"]
>;

function UploadCVPage() {
  const { pdfFile, setPdfFile } = useCV();
  const [output, setOutput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [fileName, setFileName] = useState<string>("");

  const searchParams = useSearchParams();
  const templateId = searchParams.get("id");
  const router = useRouter();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setOutput(
        JSON.stringify(
          { error: "Định dạng file không hợp lệ. Vui lòng chọn file PDF." },
          null,
          2
        )
      );
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
        const uint8Array = new Uint8Array(arrayBuffer);
        setPdfFile(uint8Array);
      } catch (error) {
        console.error("Lỗi khi đọc file:", error);
        setOutput(
          JSON.stringify({ error: "Không thể đọc file đã chọn." }, null, 2)
        );
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onDocumentLoadSuccess: OnDocumentLoadSuccess = async (pdf) => {
    setNumPages(pdf.numPages);
    let fullText = "";

    try {
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => ("str" in item ? item.str : ""))
          .join(" ");
        fullText += pageText + "\n\n";
      }

      const result = {
        fileName: fileName,
        totalPages: pdf.numPages,
        extractedText: fullText.trim(),
      };

      setOutput(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Lỗi khi trích xuất nội dung từ PDF:", error);
      setOutput(
        JSON.stringify(
          { error: "Không thể trích xuất nội dung từ file PDF này." },
          null,
          2
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (!pdfFile) {
      alert("Vui lòng tải lên file PDF trước khi tiếp tục.");
      return;
    }
    router.push(`/job-description-cv?id=${templateId}`)
  };

  return (
    <div className="p-6 max-w-7xl mt-10 pt-20 pb-20 mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 flex flex-col">
          <h2 className="text-2xl font-bold mb-4">Tải lên CV PDF</h2>
          <UploadPDFInput onFileChange={handleFileUpload} disabled={isLoading} />

          {/* Nhóm nút điều hướng */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Quay lại
            </button>
            <button
              onClick={handleNextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Bước tiếp theo
            </button>
          </div>
        </div>

        {/* === CỘT BÊN PHẢI === */}
        <div className="w-full md:w-2/3 bg-gray-50">
          <div className="border rounded shadow p-4 ">
            <h3 className="text-lg font-semibold mb-2">
              Xem Lại CV bạn đã tải lên:
            </h3>
            {pdfFile && (
              <Document
                file={{ data: new Uint8Array(pdfFile) }}
                loading="Đang tải PDF..."
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) => {
                  console.error("Lỗi khi tải PDF preview:", error);
                  setOutput(
                    JSON.stringify(
                      { error: `Không thể tải preview PDF: ${error.message}` },
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

// Thêm component nhỏ gọn cho upload PDF
export function UploadPDFInput({ onFileChange, disabled }: { onFileChange: (file: File) => void, disabled?: boolean }) {
  return (
    <label
      htmlFor="file-upload-modal"
      className="w-full flex flex-col justify-center text-center items-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 bg-white p-4 rounded-md shadow-sm"
    >
      <span className="font-normal text-gray-600">Chọn file PDF</span>
      <input
        type="file"
        id="file-upload-modal"
        className="hidden"
        accept="application/pdf"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onFileChange(file);
        }}
        disabled={disabled}
      />
    </label>
  );
}

export default UploadCVPage;