'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import CVCard from '@/components/card/card-template';
import { useLanguage } from '@/providers/global-provider';
import { Button, Typography } from 'antd';

// Định nghĩa type cho CV template
type CVTemplate = {
    id: number;
    imageUrl: string;
    title: string;
    isRecommended?: boolean;
};

// Danh sách dữ liệu mẫu cho CV templates
const cvTemplates: CVTemplate[] = [
    {
        id: 1,
        imageUrl: '/template-cv/0e5fda43-6a21-439c-9148-7780278cba2c.jpg',
        title: 'Modern CV Template',
        isRecommended: true,
    },
    {
        id: 2,
        imageUrl: '/template-cv/0e5fda43-6a21-439c-9148-7780278cba2c.jpg',
        title: 'Professional CV Template',
        isRecommended: true,
    },
    {
        id: 3,
        imageUrl: '/template-cv/0e5fda43-6a21-439c-9148-7780278cba2c.jpg',
        title: 'Creative CV Template',
    },
    {
        id: 4,
        imageUrl: '/template-cv/0e5fda43-6a21-439c-9148-7780278cba2c.jpg',
        title: 'Minimalist CV Template',
    },
];

// Hiệu ứng cho container
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const CVTemplatePage: React.FC = () => {
    const { language } = useLanguage();
    const [viewMode, setViewMode] = useState<'recommended' | 'all'>('recommended');

    // Lọc các mẫu được đề xuất
    const recommendedTemplates = cvTemplates.filter((template) => template.isRecommended);
    const displayedTemplates = viewMode === 'recommended' ? recommendedTemplates : cvTemplates;

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                {/* Header Section */}
                <motion.div
                    className="mb-12 text-center bg-white rounded-lg shadow-sm p-6 sm:p-8 border border-blue-100"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Typography.Title
                        level={2}
                        className="text-blue-900 font-semibold text-3xl sm:text-4xl mb-3"
                    >
                        {language === 'vi' ? 'Chọn Mẫu CV Dành Cho Bạn' : 'Choose Your CV Template'}
                    </Typography.Title>
                    <Typography.Paragraph className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
                        {language === 'vi'
                            ? 'Khám phá bộ sưu tập mẫu CV được thiết kế chuyên nghiệp để tạo ấn tượng mạnh mẽ với nhà tuyển dụng.'
                            : 'Discover our collection of professionally designed CV templates to make a lasting impression on employers.'}
                    </Typography.Paragraph>
                </motion.div>

                {/* Filter Buttons */}
                <motion.div
                    className="flex justify-center gap-4 mb-10"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <button
                        onClick={() => setViewMode('recommended')}
                        className={`w-40 h-12 rounded-lg border font-medium transition-all duration-200 text-base shadow-sm
      ${viewMode === 'recommended'
                                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                                : 'bg-blue-50 text-blue-600 border-blue-600 hover:bg-blue-100'}
    `}
                    >
                        {language === 'vi' ? 'Được Đề Xuất' : 'Recommended'}
                    </button>

                    <button
                        onClick={() => setViewMode('all')}
                        className={`w-40 h-12 rounded-lg border font-medium transition-all duration-200 text-base shadow-sm
                                 ${viewMode === 'all'
                                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                                : 'bg-blue-50 text-blue-600 border-blue-600 hover:bg-blue-100'}
                                `}>
                        {language === 'vi' ? 'Tất Cả' : 'All'}
                    </button>
                </motion.div>

                {/* Template Grid */}
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-blue-100"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    key={viewMode}
                >
                    {displayedTemplates.map((template) => (
                        <CVCard
                            key={template.id}
                            imageUrl={template.imageUrl}
                            title={template.title}
                        />
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default CVTemplatePage;