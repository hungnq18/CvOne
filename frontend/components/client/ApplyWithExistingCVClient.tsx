"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllCVs, CV } from "@/api/cvapi";
import { useCV } from "@/providers/cv-provider";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ApplyWithExistingCVPage() {
  const [cvList, setCvList] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const { jobDescription } = useCV();

  useEffect(() => {
    async function fetchCVs() {
      setLoading(true);
      try {
        const res = await getAllCVs();
        const cvs = Array.isArray(res) ? res : res.data || [];
        setCvList(cvs);
        setCurrentPage(1);
      } catch (err) {
        setCvList([]);
        setCurrentPage(1);
      } finally {
        setLoading(false);
      }
    }
    fetchCVs();
  }, [jobDescription]);

  const totalPages = Math.ceil(cvList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCvList = cvList.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="pt-20 min-h-screen flex flex-col items-center justify-center bg-white py-10">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">
        Select a CV to Apply
      </h1>

      {loading ? (
        <div className="text-gray-500">Loading CVs...</div>
      ) : cvList.length === 0 ? (
        <div className="text-gray-500">
          You have no CVs.{" "}
          <Link href="/createCV" className="text-blue-600 underline">
            Create one now
          </Link>
          .
        </div>
      ) : (
        <div className="w-full max-w-2xl space-y-4">
          {currentCvList.map((cv) => (
            <div
              key={cv._id}
              className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-6 py-4 shadow-sm"
            >
              <div>
                <div className="font-semibold text-blue-800">
                  {cv.title || "Untitled CV"}
                </div>
                <div className="text-xs text-gray-500">
                  Last updated:{" "}
                  {cv.updatedAt
                    ? new Date(cv.updatedAt).toLocaleDateString()
                    : "-"}
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/myDocuments"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
                >
                  View Detail
                </Link>
                <Link
                  href={`/updateCV?id=${cv._id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                >
                  Edit with AI
                </Link>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          <div className="text-center text-sm text-gray-500 mt-4">
            Showing {startIndex + 1} to {Math.min(endIndex, cvList.length)} of{" "}
            {cvList.length} CVs
          </div>
        </div>
      )}
    </div>
  );
}
