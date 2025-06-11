// components/card/card-template.tsx (Cập nhật)

"use client";

import Image from "next/image";
import { useState } from "react";
import { useLanguage } from "@/providers/global-provider";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation"; // Đã có

// THÊM id vào props
type CVCardProps = {
  id: string; // THÊM DÒNG NÀY: ID của template
  imageUrl: string;
  title: string;
  isRecommended?: boolean;
};

const CVCard: React.FC<CVCardProps> = ({ id, imageUrl, title }) => {
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

  // const handleCreateClick = () => {
  //   // CHỈNH SỬA DÒNG NÀY: Dùng id để điều hướng đến trang chi tiết template
  //   router.push(`/clTemplate/${id}`);
  // };

  const handleCreateClick = () => {
    // CHỈNH SỬA DÒNG NÀY: Dùng id để điều hướng đến trang chi tiết template
    router.push(`/chooseCLTemplate`);
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
      <div className="relative w-full aspect-[210/297] max-h-[420px]">
        <Image
          src={imageUrl}
          alt={title}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
        {isHovered && (
          <motion.div
            className="absolute inset-0 flex items-end justify-center pb-6 bg-black bg-opacity-40" // Thêm overlay nhẹ để nút dễ nhìn hơn
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              className="flex items-center bg-blue-500 text-white px-5 py-3 rounded-lg hover:bg-blue-600"
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              onClick={handleCreateClick} // SỬ DỤNG HÀM MỚI
            >
              <span className="text-lg font-semibold">
                {language === "vi" ? "Tạo" : "Create"}
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