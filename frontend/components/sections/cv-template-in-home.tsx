'use client';

import CVCard from '../card/card-template';
import { useLanguage } from '@/providers/global-provider';
import { motion } from 'framer-motion';

type CVTemplate = {
    id: number;
    imageUrl: string;
    title: {
        en: string;
        vi: string;
    };
};

const cvTemplates: CVTemplate[] = [
    {
        id: 1,
        imageUrl: 'https://th.bing.com/th/id/OIP.GdDZiF0OCgYG8FQ7_yoxUwHaKi?rs=1&pid=ImgDetMain',
        title: { en: 'Professional CV', vi: 'CV Chuyên nghiệp' },
    },
    {
        id: 2,
        imageUrl: 'https://cdn1.vieclam24h.vn/images/assets/img/cv6-246b81.png',
        title: { en: 'Modern CV', vi: 'CV Hiện đại' },
    },
    {
        id: 3,
        imageUrl: 'https://th.bing.com/th/id/OIP.GdDZiF0OCgYG8FQ7_yoxUwHaKi?rs=1&pid=ImgDetMain',
        title: { en: 'Creative CV', vi: 'CV Sáng tạo' },
    },
    {
        id: 4,
        imageUrl: 'https://cdn1.vieclam24h.vn/images/assets/img/cv6-246b81.png',
        title: { en: 'Minimalist CV', vi: 'CV Tối giản' },
    },
];

const CVSection: React.FC = () => {
    const { language } = useLanguage();

    // Hiệu ứng cho container
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 1,
            },
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
                    {language === 'en' ? 'Explore Our CV Templates' : 'Khám phá mẫu CV của chúng tôi'}
                </motion.h2>
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {cvTemplates.map((template) => (
                        <CVCard
                            key={template.id}
                            imageUrl={template.imageUrl}
                            title={template.title[language]}
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default CVSection;