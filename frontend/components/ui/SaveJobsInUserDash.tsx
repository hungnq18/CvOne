'use client';

import { Job } from '@/api/jobApi';
import { useLanguage } from '@/providers/global_provider';
import React, { useEffect, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaHeart } from 'react-icons/fa';

const translations = {
    vi: {
        SaveJobs: "Các công việc đã lưu",
        company: "Công ty",
        description: "Mô tả",
        location: "Địa điểm",
        salary: "Lương",
        workType: "Loại việc",
        savedOn: "Ngày lưu",
    },
    en: {
        SaveJobs: "Saved Jobs",
        company: "Company",
        description: "Description",
        location: "Location",
        salary: "Salary",
        workType: "Work Type",
        savedOn: "Saved on",
    }
};

interface FavoriteJobsProps {
    jobs: Job[];
}

const SaveJobsInUserDash: React.FC<FavoriteJobsProps> = ({ jobs }) => {
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

    const CARD_WIDTH = 320; // px, phải khớp với min-w bên dưới
    const VISIBLE_CARDS = 3;

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -CARD_WIDTH * VISIBLE_CARDS : CARD_WIDTH * VISIBLE_CARDS;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-gradient-to-r from-blue-100 to-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 relative">
            <div className="flex items-center mb-4 relative">
                <FaHeart className="text-pink-400 mr-2 text-lg" />
                <h2 className="text-xl font-semibold text-blue-600">{t.SaveJobs}</h2>
                <button
                    className="absolute right-0 top-0 flex items-center px-5 py-1.5 overflow-hidden font-medium transition-all bg-blue-500 rounded-md group mb-1 text-xs"
                    onClick={() => window.location.href = '/myJobs'}
                    title={language === 'vi' ? 'Xem tất cả công việc đã lưu' : 'View all saved jobs'}
                    style={{ zIndex: 1 }}
                >
                    <span
                        className="absolute top-0 right-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-blue-600 rounded group-hover:-mr-4 group-hover:-mt-4"
                    >
                        <span
                            className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white"
                        ></span>
                    </span>
                    <span
                        className="absolute bottom-0 rotate-180 left-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-blue-600 rounded group-hover:-ml-4 group-hover:-mb-4"
                    >
                        <span
                            className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white"
                        ></span>
                    </span>
                    <span
                        className="absolute bottom-0 left-0 w-full h-full transition-all duration-500 ease-in-out delay-200 -translate-x-full bg-blue-400 rounded-md group-hover:translate-x-0"
                    ></span>
                    <span
                        className="relative w-full text-left text-white transition-colors duration-200 ease-in-out group-hover:text-white font-semibold"
                    >
                        {language === 'vi' ? 'Xem tất cả' : 'View all'}
                    </span>
                </button>
            </div>
            <div
                className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth"
                ref={scrollRef}
                style={{ scrollBehavior: 'smooth' }}
            >
                {jobs.map((job) => (
                    <div
                        key={job._id}
                        className="bg-white border border-blue-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-200 p-5 flex flex-col gap-2 group min-h-[170px] min-w-[320px] max-w-[320px] flex-shrink-0"
                    >
                        <h3 className="text-lg font-semibold text-blue-700 group-hover:text-blue-900 transition-colors">
                            {job.title}
                        </h3>
                        <div className="flex flex-col gap-y-1 text-sm text-gray-600 mt-1">
                            <span>
                                {t.location}: <span className="font-medium text-blue-500">{job.location}</span>
                            </span>
                            <span>
                                {t.salary}: <span className="font-medium text-green-600">{job.salaryRange}</span>
                            </span>
                            <span>
                                {t.workType}: <span className="font-medium text-indigo-500">{job.workType}</span>
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{job.description}</p>
                        <div className="flex items-center gap-2 mt-2">

                            <span className="text-xs text-blue-500 font-semibold">{job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : ''}</span>
                        </div>
                    </div>
                ))}
            </div>
            {showLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 z-10"
                >
                    <FaChevronLeft className="text-blue-600" />
                </button>
            )}
            {showRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 z-10"
                >
                    <FaChevronRight className="text-blue-600" />
                </button>
            )}
        </div>
    );
};

export default SaveJobsInUserDash;