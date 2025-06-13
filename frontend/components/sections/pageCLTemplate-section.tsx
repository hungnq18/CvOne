'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import CVCard from '@/components/card/card-template';
import { useLanguage } from '@/providers/global-provider';

// Cập nhật kiểu CLTemplate: id là string
type CLTemplate = {
    id: string; // Đã đổi từ number sang string
    imageUrl: string;
    title: string;
    isRecommended?: boolean;
    // Có thể thêm một trường 'type' nếu bạn muốn phân biệt CV và Cover Letter trong CVCard
    type: string;
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
        },
    },
};

interface TemplateSectionProps {
    cvTemplates: CLTemplate[]; // Đổi tên prop này nếu bạn muốn nó bao gồm cả CV và CL
}

const TemplateSection: React.FC<TemplateSectionProps> = ({ cvTemplates }) => {
    const { language } = useLanguage();
    const [viewMode, setViewMode] = useState<'recommended' | 'all'>('recommended');

    const recommendedTemplates = cvTemplates.filter((template) => template.isRecommended);
    const displayedTemplates = viewMode === 'recommended' ? recommendedTemplates : cvTemplates;

    return (
        <>
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
                    `}
                >
                    {language === 'vi' ? 'Tất Cả' : 'All'}
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
                    // Truyền thêm template.id vào CVCard
                    <CVCard
                        key={template.id}
                        id={template.id} 
                        imageUrl={template.imageUrl}
                        title={template.title}
                        isRecommended={template.isRecommended} // THÊM NẾU CVCard có props này
                    />
                ))}
            </motion.div>
        </>
    );
};

export default TemplateSection;