// components/card/card-CVtemplate.tsx

"use client";

import { CVTemplate } from "@/api/cvapi";
import { templateComponentMap } from "@/components/cvTemplate/index"; // Import nếu bạn đang dùng renderTemplatePreview
import { useLanguage } from "@/providers/global_provider";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { notify } from "@/lib/notify";

type CardCVTemplateProps = CVTemplate & {
  onPreviewClick: (template: CVTemplate) => void;
};

const CardCVTemplate: React.FC<CardCVTemplateProps> = ({
  _id,
  imageUrl,
  title,
  onPreviewClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { language } = useLanguage();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    hover: { scale: 1.05, backgroundColor: "#0066FF", color: "white" },
  };
  const TemplateComponent = templateComponentMap[title];

  const previewData = {
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

  const renderTemplatePreview = () => {
    if (!TemplateComponent) {
      return (
        <Image
          src={imageUrl}
          alt={title}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
      );
    }

    const containerWidth = 300;
    const templateOriginalWidth = 794;
    const scaleFactor = containerWidth / templateOriginalWidth;

    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "2.4%",
          width: `${templateOriginalWidth}px`,
          height: `${templateOriginalWidth * (297 / 210)}px`,
          transformOrigin: "top left",
          transform: `scale(${scaleFactor})`,
          boxShadow: "0 0 5px rgba(0,0,0,0.1)",
        }}
      >
        <TemplateComponent
          data={previewData}
          language={language}
          isPdfMode={true}
        />
      </div>
    );
  };
  // --- END: Phần renderTemplatePreview và previewData ---

  // Bên trong component của bạn
  const router = useRouter();

  const handleCreateCVClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    // Kiểm tra token
    if (token) {
      router.push(`/chooseCreateCV?id=${_id}`);
    } else {
      notify.error("Bạn cần đăng nhập để tạo CV!");
      router.push("/login");
    }
  };
  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg overflow-hidden transform"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full aspect-[210/297] max-h-[420px] overflow-hidden flex justify-center items-center">
        {/* Render ảnh preview hoặc template component */}
        {renderTemplatePreview()}

        {isHovered && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center pb-6 bg-black bg-opacity-40 space-y-4" // Dùng flex-col và space-y để xếp chồng
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Nút Preview */}
            <motion.button
              className="flex items-center bg-gray-200 text-gray-800 px-5 py-3 rounded-lg hover:bg-gray-300 font-semibold"
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              onClick={() => onPreviewClick({ _id, imageUrl, title })} // Gọi callback
              style={{
                width: "84%",
                textAlign: "center",
              }}
            >
              <span
                className="text-lg"
                style={{
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {language === "vi" ? "Xem trước" : "Preview"}
              </span>
            </motion.button>

            {/* Nút Sử dụng mẫu này (có Link riêng) */}
            <a
              href={`/createCV?id=${_id}`}
              onClick={handleCreateCVClick}
              className="your-styling-classes" // Thêm các class CSS để nó trông giống một liên kết hoặc nút bấm
            >
              <motion.button
                className="flex items-center bg-blue-500 text-white px-5 py-3 transition-all duration-300 rounded-lg hover:bg-blue-600 hover:scale-105"
                initial="hidden"
                animate="visible"
                whileHover="hover"
              >
                <span className="text-lg font-semibold">
                  {language === "vi" ? "Sử dụng mẫu này" : "Use this template"}
                </span>
                <motion.svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  animate={{ x: isHovered ? 5 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </motion.svg>
              </motion.button>
            </a>
          </motion.div>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800 p-4">{title}</h3>
      </div>
    </motion.div>
  );
};

export default CardCVTemplate;
