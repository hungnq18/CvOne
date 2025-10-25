'use client';

import { Job } from '@/api/jobApi';
import { useLanguage } from '@/providers/global_provider';
import React, { useEffect, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaLightbulb } from 'react-icons/fa';

const translations = {
    vi: {
        suggestedJobs: "Các công việc được gợi ý",
        company: "Công ty",
        description: "Mô tả",
        viewDetail: "Xem chi tiết",
        suggested: "Gợi ý",
    },
    en: {
        suggestedJobs: "Suggested Jobs",
        company: "Company",
        description: "Description",
        viewDetail: "View details",
        suggested: "Suggested",
    }
};

interface SuggestedJobsProps {
    jobs: Job[];
}

const SuggestedJobs: React.FC<SuggestedJobsProps> = ({ jobs }) => {
    const { language } = useLanguage();
    const t = translations[language];

    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);

    const checkScrollPosition = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeft(scrollLeft > 0);
            setShowRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        checkScrollPosition();
        if (scrollRef.current) {
            scrollRef.current.addEventListener('scroll', checkScrollPosition);
        }
        return () => {
            if (scrollRef.current) {
                scrollRef.current.removeEventListener('scroll', checkScrollPosition);
            }
        };
    }, [jobs]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-gradient-to-r from-blue-100 to-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 relative">
            <div className="flex items-center mb-4">
                <FaLightbulb className="text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-blue-600">{t.suggestedJobs}</h2>
            </div>
            <div className="flex gap-6 pb-2" ref={scrollRef}>
                {jobs.map((job) => {
                    // Xử lý hiển thị company nếu có
                    let companyNode: React.ReactNode = null;

                    return (
                        <div
                            key={job._id}
                            className="flex-1 min-w-0 max-w-full bg-white rounded-2xl shadow-md border border-blue-100 hover:shadow-xl hover:border-blue-300 transition-all duration-200 p-5 flex flex-col gap-2 group relative"
                            style={{ minWidth: 0 }}
                        >
                            <h3 className="text-lg font-semibold text-blue-700 group-hover:text-blue-900 transition-colors mb-1 truncate" title={job.title}>{job.title}</h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-1">
                                {companyNode}
                                {job.location && <span><span className="font-medium text-blue-500">{job.location}</span></span>}
                            </div>
                            {job.salaryRange && (
                                <div className="text-sm text-green-600 font-medium mb-1">{job.salaryRange}</div>
                            )}
                            <p className="text-xs text-gray-500 line-clamp-3 mb-2">{job.description}</p>
                            <button
                                className="mt-auto px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors text-sm font-semibold"
                                onClick={() => window.open(`/jobPage/${job._id}`, '_blank')}
                            >
                                {t.viewDetail}
                            </button>
                            <div className="absolute top-2 right-2">
                                <span className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-500 rounded-full border border-blue-100">{t.suggested}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            {showLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                    <FaChevronLeft className="text-blue-600" />
                </button>
            )}
            {showRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                    <FaChevronRight className="text-blue-600" />
                </button>
            )}
        </div>
    );
};

export default SuggestedJobs;