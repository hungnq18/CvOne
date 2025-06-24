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
  const {pdfFile, setPdfFile } = useCV();
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
          <label
            htmlFor="file"
            className="w-full h-[200px] flex flex-col justify-center text-center items-center gap-5 cursor-pointer border-2 border-dashed border-gray-300 bg-white p-6 rounded-[10px] shadow-[0_48px_35px_-48px_rgba(0,0,0,0.1)]"
          >
            <div className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-20 fill-gray-600"
              >
                <path
                  d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z"
                  clipRule="evenodd"
                  fillRule="evenodd"
                ></path>
              </svg>
            </div>
            <div className="flex items-center justify-center">
              <span className="font-normal text-gray-600">
                Nhấn để tải lên file PDF
              </span>
            </div>
            <input
              type="file"
              id="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
          </label>

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


export default UploadCVPage;