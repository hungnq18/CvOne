'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/providers/global-provider';
import { motion } from 'framer-motion';

const heroTranslations = {
  en: {
    title: 'Professional CV & Cover Letter',
    subtitle: 'Trusted by Thousands of Job Seekers',
    description: 'Create a beautiful and impressive CV in just a few minutes.',
    button: 'Create Your CV Now',
  },
  vi: {
    title: 'CV & Thư ngỏ chuyên nghiệp',
    subtitle: 'Được tin dùng bởi hàng ngàn ứng viên',
    description: 'Tạo CV ấn tượng chỉ trong vài phút.',
    button: 'Tạo CV ngay',
  },
};

export function HeroSection() {
  const { language } = useLanguage();
  const slide = heroTranslations[language];

  // Hiệu ứng cho text
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  // Hiệu ứng cho ảnh
  const imageVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  return (
    <section className="bg-gradient-to-r from-blue-100 to-white py-32 min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2 text-left">
            <motion.div
              variants={textVariants}
              initial="hidden"
              animate="visible"
            >
              <span className="inline-block bg-blue-800 text-white text-base font-semibold px-4 py-2 rounded-full mb-4">
                {slide.subtitle}
              </span>
              <h1 className="text-4xl md:text-7xl font-bold text-blue-900 mb-4">
                {slide.title}
              </h1>
              <p className="text-lg md:text-3xl text-gray-700 mb-8 mt-7">
                {slide.description}
              </p>
            </motion.div>
            <Link
              href="/create-cv"
              className="inline-flex items-center justify-center bg-green-500 text-white w-[300px] h-[70px] rounded-md text-xl font-semibold hover:bg-green-600 transition-colors duration-200"
            >
              {slide.button}
            </Link>
          </div>
          <motion.div
            className="md:w-1/2 mt-10 md:mt-0 flex justify-center"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="relative rounded-lg shadow-xl overflow-hidden">
              <Image
                src="https://cv.timviec.com.vn/images/cv/ccv-online-41.jpg"
                alt="Home Image"
                width={1000}
                height={500}
                className="w-full max-w-3xl h-auto transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}