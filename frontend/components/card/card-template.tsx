// components/card/card-template.tsx (Cập nhật)

"use client";

import { useLanguage } from "@/providers/global_provider";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Đã có
import { useState } from "react";

// THÊM id vào props
type CVCardProps = {
  id: string; // THÊM DÒNG NÀY: ID của template
  imageUrl: string;
  title: string;
  isRecommended?: boolean;
  onPreviewClick: () => void;
};

const CVCard: React.FC<CVCardProps> = ({ id, imageUrl, title, onPreviewClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { language } = useLanguage();
  const router = useRouter();

  // Hiệu ứng cho card
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Hiệu ứng cho nút
  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 0 15px rgba(34, 197, 94, 0.5)",
      transition: { duration: 0.2 },
    },
  };

  const handleUseTemplateClick = () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (token) {
      router.push(`/chooseOption?templateId=${id}`);
    } else {
      router.push("/login");
    }
  };

  return (
    <motion.div
      className="bg-white shadow-lg overflow-hidden transform"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full aspect-[210/297] max-h-[420px]">
        <Image
          src={imageUrl}
          alt={title}
          layout="fill"
          objectFit="contain"
        />
        {isHovered && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              className="bg-white text-gray-800 px-5 py-3 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-colors w-full max-w-xs mb-4"
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              onClick={onPreviewClick}
            >
              {language === "vi" ? "Xem trước" : "Preview"}
            </motion.button>
            <motion.button
              className="flex items-center justify-center bg-blue-500 text-white px-5 py-3 rounded-lg font-semibold text-lg hover:bg-blue-600 transition-colors w-full max-w-xs"
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              onClick={handleUseTemplateClick}
            >
              {language === "vi" ? "Sử dụng mẫu này" : "Use this template"}
            </motion.button>
          </motion.div>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800 p-4">{title}</h3>
      </div>
    </motion.div>
  );
};

export default CVCard;