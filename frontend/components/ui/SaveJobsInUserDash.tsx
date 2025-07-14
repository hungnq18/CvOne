'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Card } from 'antd';
import { FaHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Job } from '@/api/jobApi';
import { useLanguage } from '@/providers/global-provider';

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

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-gradient-to-r from-blue-100 to-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 relative">
            <div className="flex items-center mb-4">
                <FaHeart className="text-pink-400 mr-2 text-lg" />
                <h2 className="text-xl font-semibold text-blue-600">{t.SaveJobs}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map((job) => (
                    <div
                        key={job._id}
                        className="bg-white border border-blue-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-200 p-5 flex flex-col gap-2 group min-h-[170px]"
                    >
                        <h3 className="text-lg font-semibold text-blue-700 group-hover:text-blue-900 transition-colors">
                            {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 mt-1">
                            <span>{t.location}: <span className="font-medium text-blue-500">{job.location}</span></span>
                            <span>{t.salary}: <span className="font-medium text-green-600">{job.salaryRange}</span></span>
                            <span>{t.workType}: <span className="font-medium text-indigo-500">{job.workType}</span></span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{job.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500 font-medium">{t.savedOn}:</span>
                            <span className="text-xs text-blue-500 font-semibold">{job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : ''}</span>
                        </div>
                    </div>
                ))}
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

export default SaveJobsInUserDash;