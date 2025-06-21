"use client";

import { CVTemplate, getCVTemplates } from "@/api/cvapi";
import CardCVTemplate from "@/components/card/card-CVtemplate";
import { useLanguage } from "@/providers/global-provider";
import { motion } from "framer-motion";
import { useEffect, useState, FC, ReactNode, useRef } from "react";
import { templateComponentMap } from "@/components/cvTemplate/index";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

// --- THÊM COMPONENT TemplatePreviewModal TRỰC TIẾP VÀO FILE NÀY ---
interface TemplatePreviewModalProps {
  templateId: string;
  templateTitle: string;
  onClose: () => void;
}

const TemplatePreviewModal: FC<TemplatePreviewModalProps> = ({
  templateId,
  templateTitle,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(modalRef, onClose);

  const router = useRouter();

  const defaultPreviewData = {
    userData: {
      firstName: "Hoàng Văn",
      lastName: "Bách",
      professional: "Kỹ sư phần mềm",
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUbcmERWWtK-cjIiojfIK-Ee857Ld-GshI2g&s",
      email: "email@example.com",
      phone: "0123456789",
      city: "Thành phố",
      country: "Quốc gia",
      summary:
        "Là một kỹ sư phần mềm năng động với hơn 5 năm kinh nghiệm trong việc phát triển các ứng dụng web phức tạp. ",
      workHistory: [
        {
          title: "Kỹ sư phần mềm cấp cao",
          company: "Công ty ABC Tech",
          startDate: "2022-01",
          endDate: "Hiện tại",
          description:
            "Dẫn dắt phát triển các module backend sử dụng Node.js và MongoDB, cải thiện hiệu suất API 30%. Triển khai giao diện người dùng bằng React và Redux, tăng trải nghiệm người dùng. Hướng dẫn nhóm 3 lập trình viên cấp dưới trong các dự án quan trọng.",
        },
        {
          title: "Quản lý dự án",
          company: "Công ty TechSolutions",
          startDate: "2024-01",
          endDate: "Hiện tại",
          description:
            "Quản Lý dự án Kyomatcha và là người phụ trách chính trong việc phát triển ứng dụng web. Tạo và duy trì tài liệu dự án, bao gồm kế hoạch dự án, báo cáo tiến độ và tài liệu kỹ thuật. Phối hợp với các nhóm khác để đảm bảo tiến độ dự án và chất lượng sản phẩm.",
        },
      ],
      education: [
        {
          institution: "Trường Đại Học Quốc Gia",
          major: "Kỹ thuật phần mềm",
          degree: "Bằng Giỏi",
          startDate: "2018-09",
          endDate: "2022-06",
        },
      ],
      skills: [
        { name: "Frontend: React, Next.js, TypeScript, Tailwind CSS" },
        { name: "Công cụ: Git, Docker, Jira" },
      ],
    },
    templateSpecificData: {},
  };

  const TemplateComponent = templateComponentMap[templateTitle];

  const handleUseTemplate = () => {
    // Bước 1: Lấy token từ cookie của trình duyệt
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (token) {
      router.push(`/chooseCreateCV?id=${templateId}`);
    } else {
      alert("Bạn cần đăng nhập trước khi tạo CV!");
      router.push("/login");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        ref={modalRef}
      >
        {/* Header của Modal */}
        <div className="flex justify-between items-center bg-gray-100 py-3 px-5 rounded-t-lg border-b">
          <h2 className="text-xl font-bold">{templateTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full p-1 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Nội dung Preview Template */}
        <div className="flex-grow pt-4 overflow-y-auto flex justify-center items-start">
          {/* items-start để nội dung ở trên cùng */}
          {!TemplateComponent ? (
            <div className=" text-red-600">
              Không tìm thấy component cho mẫu "{templateTitle}".
            </div>
          ) : (
            <div className="mt-8 w-full max-w-[1050px] shadow-2xl origin-top scale-[0.6] md:scale-[0.7] lg:scale-[0.8]">
              <TemplateComponent data={defaultPreviewData} />
            </div>
          )}
        </div>

        {/* Footer của Modal */}
        <div className="flex justify-center items-center py-4 px-5 rounded-b-lg border-t bg-gray-100">
          <button
            onClick={handleUseTemplate}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <span className="text-lg">Dùng mẫu này</span>
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Kết thúc TemplatePreviewModal ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const CvTemplatesPage: React.FC = () => {
  const { language } = useLanguage();
  const [cvTemplates, setCvTemplates] = useState<CVTemplate[]>([]);
  const [viewMode, setViewMode] = useState<"recommended" | "all">(
    "recommended"
  );

  const [selectedTemplateForPreview, setSelectedTemplateForPreview] =
    useState<CVTemplate | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCVTemplates();
      const parsedData = data.map((template) => {
        if (typeof template.data === "string") {
          try {
            return { ...template, content: JSON.parse(template.data) };
          } catch (e) {
            console.error("Failed to parse CV content in template list:", e);
            return { ...template, content: {} }; // Fallback
          }
        }
        return template;
      });
      setCvTemplates(parsedData);
    };
    fetchData();
  }, []);

  const recommendedTemplates = cvTemplates.filter(
    (template) => template.isRecommended
  );
  const displayedTemplates =
    viewMode === "recommended" ? recommendedTemplates : cvTemplates;

  const handleCardPreviewClick = (template: CVTemplate) => {
    // Đổi tên hàm để rõ ràng hơn
    setSelectedTemplateForPreview(template);
  };

  const handleClosePreviewModal = () => {
    setSelectedTemplateForPreview(null);
  };

  return (
    <>
      <motion.div
        className="flex justify-center gap-4 mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <button
          onClick={() => setViewMode("recommended")}
          className={`w-40 h-12 rounded-lg border font-medium transition-all duration-200 text-base shadow-sm
            ${
              viewMode === "recommended"
                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                : "bg-blue-50 text-blue-600 border-blue-600 hover:bg-blue-100"
            }`}
        >
          {language === "vi" ? "Được Đề Xuất" : "Recommended"}
        </button>
        <button
          onClick={() => setViewMode("all")}
          className={`w-40 h-12 rounded-lg border font-medium transition-all duration-200 text-base shadow-sm
            ${
              viewMode === "all"
                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                : "bg-blue-50 text-blue-600 border-blue-600 hover:bg-blue-100"
            }`}
        >
          {language === "vi" ? "Tất Cả" : "All"}
        </button>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-blue-100"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={viewMode}
      >
        {displayedTemplates.map((template) => (
          // Không thêm onClick trực tiếp vào div ngoài CardCVTemplate
          // để CardCVTemplate tự quản lý các nút click của nó
          <CardCVTemplate
            key={template.id}
            id={template.id}
            imageUrl={template.imageUrl}
            title={template.title}
            onPreviewClick={handleCardPreviewClick} // Truyền hàm callback cho nút Preview
          />
        ))}
      </motion.div>

      {/* Render TemplatePreviewModal nếu có template được chọn */}
      {selectedTemplateForPreview && (
        <TemplatePreviewModal
          templateId={selectedTemplateForPreview.id}
          templateTitle={selectedTemplateForPreview.title}
          onClose={handleClosePreviewModal}
        />
      )}
    </>
  );
};

export default CvTemplatesPage;
