"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation"; // <-- Bước 1: Import useRouter

export default function PageChooseUploadCreateCVSection() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("id");
  const router = useRouter();
  const handleMyTemplateCreate = () => {
    router.push(`/createCV?id=${templateId}`);
  };
  const handleTemplateCreate = () => {
    router.push(`/createCV-AI?id=${templateId}`);
  };

  return (
    <div className="bg-white pt-10 pb-10 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Bạn muốn dùng mẫu nào?
        </h2>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          Hãy chọn một phương pháp để bắt đầu hành trình của bạn.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button
            type="button"
            onClick={handleMyTemplateCreate}
            className="rounded-md border border-gray-300 bg-white 
            w-3/4 h-40 px-8 py-10 text-base font-semibold text-blue-600
            shadow-sm 
            transition-all duration-300 ease-in-out
            hover:bg-blue-100 hover:scale-105 
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Dùng mẫu bạn đã chọn
          </button>
          <button
            type="button"
            onClick={handleTemplateCreate}
            className="rounded-md border border-gray-300 bg-white 
            w-3/4 h-40 px-8 py-10 text-base font-semibold text-blue-600
            shadow-sm 
            transition-all duration-300 ease-in-out
            hover:bg-blue-100 hover:scale-105 
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Dùng mẫu bạn đăng tải
          </button>
        </div>
      </div>
    </div>
  );
}
