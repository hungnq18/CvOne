"use client";
import { CVTemplate, getCVTemplates } from "@/api/cvapi"; // 💡 gọi từ fakeApi
import { templateComponentMap } from "@/components/cvTemplate/index";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useLanguage } from "@/providers/global_provider";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/navigation";
import { FC, useRef, useState } from "react";
import CardCVTemplate from "../card/card-CVtemplate";
import { notify } from "@/lib/notify";

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
  const { language } = useLanguage();

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
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (token) {
      router.push(`/chooseCreateCV?id=${templateId}`);
    } else {
      notify.error("Bạn cần đăng nhập trước khi tạo CV!");
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
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-100 py-3 px-5 rounded-t-lg border-b">
          <h2 className="text-xl font-bold">{templateTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full p-1 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-grow pt-4 overflow-y-auto bg-gray-50">
          {!TemplateComponent ? (
            <div className="text-red-600">
              Không tìm thấy component cho mẫu "{templateTitle}".
            </div>
          ) : (
            <div className="flex justify-center">
              <div
                style={{
                  width: 794,
                  height: 1123,
                  transform: "scale(0.75)",
                  transformOrigin: "top",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
              >
                <TemplateComponent
                  data={defaultPreviewData}
                  isPdfMode={true}
                  scale={0.75}
                  language={language}
                />
              </div>
            </div>
          )}
        </div>
        {/* Footer */}
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

interface Props {
  initialTemplates: CVTemplate[];
}

const CVSection: React.FC<Props> = ({ initialTemplates }) => {
  const { language } = useLanguage();
  const [cvTemplates] = useState<CVTemplate[]>(initialTemplates);
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] =
    useState<CVTemplate | null>(null);

  const handlePreviewClick = (template: CVTemplate) => {
    setSelectedTemplateForPreview(template);
  };

  const handleClosePreviewModal = () => {
    setSelectedTemplateForPreview(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 1 },
    },
  };

  return (
    <section className="py-20 bg-blue-100">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl font-bold text-center text-blue-800 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {language === "en"
            ? "Explore Our CV Templates"
            : "Khám phá mẫu CV của chúng tôi"}
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 rounded-lg p-6 sm:p-8 shadow-sm border border-blue-100"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {cvTemplates.map((template) => (
            <CardCVTemplate
              key={template._id}
              _id={template._id}
              imageUrl={template.imageUrl}
              title={
                typeof template.title === "string"
                  ? template.title
                  : template.title?.[language] ?? template.title
              }
              onPreviewClick={handlePreviewClick}
            />
          ))}
        </motion.div>
      </div>

      {selectedTemplateForPreview && (
        <TemplatePreviewModal
          templateId={selectedTemplateForPreview._id}
          templateTitle={selectedTemplateForPreview.title}
          onClose={handleClosePreviewModal}
        />
      )}
    </section>
  );
};

export default CVSection;

// ================== SSR ==================
export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const data = await getCVTemplates();
    return { props: { initialTemplates: data } };
  } catch (error) {
    console.error("Error fetching CV templates:", error);
    return { props: { initialTemplates: [] } };
  }
};
