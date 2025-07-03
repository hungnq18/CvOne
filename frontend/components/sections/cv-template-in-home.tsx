'use client';

import { CVTemplate, getCVTemplates } from '@/api/cvapi'; // 💡 gọi từ fakeApi
import { useLanguage } from '@/providers/global-provider';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import CardCVTemplate from '../card/card-CVtemplate';

const CVSection: React.FC = () => {
  const { language } = useLanguage();
  const [cvTemplates, setCvTemplates] = useState<CVTemplate[]>([]);

  // Gọi fake API khi component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      const data = await getCVTemplates();
      setCvTemplates(data);
    };
    fetchTemplates();
  }, []);

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
          {language === 'en'
            ? 'Explore Our CV Templates'
            : 'Khám phá mẫu CV của chúng tôi'}
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {cvTemplates.map((template) => (
            <CardCVTemplate
              key={template._id}
              _id={template._id}
              imageUrl={template.imageUrl}
              title={
                typeof template.title === 'string'
                  ? template.title
                  : template.title?.[language] ?? template.title
              }
              onPreviewClick={(template) => {


              }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CVSection;
