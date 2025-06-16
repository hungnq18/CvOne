// components/card/card-CVtemplate.tsx

"use client";

import Image from "next/image";
import { useState } from "react";
import { useLanguage } from "@/providers/global-provider";
import { motion } from "framer-motion";
import Link from "next/link"; // Import Link

type CardCVTemplateProps = {
  id: string;
  imageUrl: string;
  title: string;
  isRecommended?: boolean;
};

const CardCVTemplate: React.FC<CardCVTemplateProps> = ({ id, imageUrl, title }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { language } = useLanguage();

  const cardVariants = { /* ...hiệu ứng không đổi... */ };
  const buttonVariants = { /* ...hiệu ứng không đổi... */ };

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
            className="absolute inset-0 flex items-end justify-center pb-6 bg-black bg-opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Dùng Link để điều hướng */}
            <Link href={`/createCV?id=${id}&title=${encodeURIComponent(title)}`}>
              <motion.button
                className="flex items-center bg-green-500 text-white px-5 py-3 rounded-lg hover:bg-green-600" // Màu xanh lá
                variants={buttonVariants}
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
            </Link>
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