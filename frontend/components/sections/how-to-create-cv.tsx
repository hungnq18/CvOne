'use client';

import { useLanguage } from '@/providers/global_provider';
import { motion } from 'framer-motion';


const stepsTranslations = {
    en: [
        {
            id: 1,
            title: 'Choose a Template',
            description: 'Select from our professional CV templates to match your style and industry.',
            icon: '📋',
        },
        {
            id: 2,
            title: 'Fill in Your Details',
            description: 'Easily input your personal information, education, and work experience.',
            icon: '✍️',
        },
        {
            id: 3,
            title: 'Customize Your Design',
            description: 'Adjust colors, fonts, and layouts to make your CV stand out.',
            icon: '🎨',
        },
        {
            id: 4,
            title: 'Download and Apply',
            description: 'Download your polished CV as a PDF and start applying for jobs!',
            icon: '⬇️',
        },
    ],
    vi: [
        {
            id: 1,
            title: 'Chọn Mẫu CV',
            description: 'Chọn từ các mẫu CV chuyên nghiệp phù hợp với phong cách và ngành nghề của bạn.',
            icon: '📋',
        },
        {
            id: 2,
            title: 'Điền Thông Tin',
            description: 'Dễ dàng nhập thông tin cá nhân, học vấn và kinh nghiệm làm việc.',
            icon: '✍️',
        },
        {
            id: 3,
            title: 'Tùy Chỉnh Thiết Kế',
            description: 'Điều chỉnh màu sắc, phông chữ và bố cục để CV nổi bật.',
            icon: '🎨',
        },
        {
            id: 4,
            title: 'Tải Xuống và Nộp Đơn',
            description: 'Tải CV hoàn thiện dưới dạng PDF và bắt đầu ứng tuyển!',
            icon: '⬇️',
        },
    ],
};

export function HowToBuildCVSection() {
    const { language } = useLanguage();
    const steps = stepsTranslations[language];

    // Hiệu ứng cho container
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3, // Card xuất hiện tuần tự
            },
        },
    };

    // Hiệu ứng cho mỗi card
    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    };

    return (
        <section className="py-16 bg-blue-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.h2
                    className="text-4xl font-bold text-center text-blue-800 mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {language === 'en' ? 'How to Build CV' : 'Cách Tạo CV'}
                </motion.h2>
                <motion.div
                    className="flex flex-col gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {steps.map((step) => (
                        <motion.div
                            key={step.id}
                            className="bg-white rounded-lg shadow-lg p-6 flex items-start gap-6 hover:shadow-xl transition-shadow duration-300"
                            variants={cardVariants}
                            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                        >
                            <div className="flex-shrink-0 bg-green-500 text-white text-3xl w-12 h-12 rounded-full flex items-center justify-center">
                                {step.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-blue-900 mb-2">{step.title}</h3>
                                <p className="text-gray-600">{step.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}