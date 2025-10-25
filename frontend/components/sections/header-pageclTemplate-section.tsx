'use client';

import { useLanguage } from '@/providers/global_provider';
import { Typography } from 'antd';
import { motion } from 'framer-motion';

const HeaderCLSection: React.FC = () => {
    const { language } = useLanguage();
    return (
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
                {language === 'vi' ? 'Chọn Mẫu thư ngỏ Dành Cho Bạn' : 'Choose Your Cover Letter Template'}
            </Typography.Title>
            <Typography.Paragraph className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
                {language === 'vi'
                    ? 'Khám phá bộ sưu tập mẫu thư ngỏ được thiết kế chuyên nghiệp để tạo ấn tượng mạnh mẽ với nhà tuyển dụng.'
                    : 'Discover our collection of professionally designed Cover Letter templates to make a lasting impression on employers.'}
            </Typography.Paragraph>
        </motion.div>
    );
};

export default HeaderCLSection;