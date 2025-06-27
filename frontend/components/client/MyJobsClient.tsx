"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/providers/global-provider';
import JobTable from '@/components/sections/JobTable';
import JobSearch from '@/components/sections/JobSearch';
import JobTabs from '@/components/sections/JobTabs';
import '@/styles/myDocuments.css';
import { Job, translations } from '../../app/myJobs/page';
import { getJobById, getSavedJobsByUser, getAppliedJobsByUser } from '@/api/jobApi';
import { getAccountIdFromToken } from '@/api/userApi';

export default function MyJobsClient() {
    const [activeTab, setActiveTab] = useState('1');
    const [searchValue, setSearchValue] = useState('');
    const { language } = useLanguage();
    const t = translations[language];

    const [savedJobs, setSavedJobs] = useState<Job[]>([]);
    const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);
    const [archivedJobs, setArchivedJobs] = useState<Job[]>([]);
    const userId = getAccountIdFromToken();

    useEffect(() => {
        async function fetchJobs() {
            if (!userId) return;
            // Lấy danh sách job đã lưu từ jobApi
            const saved = await getSavedJobsByUser();
            // Lấy danh sách job đã ứng tuyển từ jobApi (nếu backend cũng populate jobId)
            // const applied = await getAppliedJobsByUser();

            // saved là mảng object, mỗi object có jobId là object job đã populate
            const savedWithDetails = (saved || []).map((item: any) => ({
                ...item.jobId,
                status: 'saved',
                savedId: item._id,
                savedAt: item.createdAt,
            }));
            setSavedJobs(savedWithDetails);
            // Nếu muốn làm tương tự cho appliedJobs, cần kiểm tra backend có populate jobId không
        }
        fetchJobs();
    }, [userId]);

    const onTabChange = (key: string) => setActiveTab(key);
    const onSearch = (value: string) => setSearchValue(value);

    const getFilteredJobs = (jobs: Job[]) => {
        return jobs.filter(job =>
            job.title.toLowerCase().includes(searchValue.toLowerCase()) ||
            job.location.toLowerCase().includes(searchValue.toLowerCase()) ||
            job.country.toLowerCase().includes(searchValue.toLowerCase()) ||
            job.skills.some(skill => skill.toLowerCase().includes(searchValue.toLowerCase()))
        );
    };

    return (
        <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 mt-16">
            <div className="max-w-7xl mx-auto">
                <div className="p-2 mb-6">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <JobTabs
                            activeTab={activeTab}
                            onTabChange={onTabChange}
                            savedJobs={savedJobs}
                            appliedJobs={appliedJobs}
                            archivedJobs={archivedJobs}
                            translations={translations}
                        />
                        <div className="flex items-center space-x-4">
                            <JobSearch
                                searchValue={searchValue}
                                onSearch={onSearch}
                                translations={translations}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    {activeTab === '1' && (
                        <JobTable
                            jobs={getFilteredJobs(savedJobs)}
                            translations={translations}
                        />
                    )}
                    {activeTab === '2' && (
                        <JobTable
                            jobs={getFilteredJobs(appliedJobs)}
                            translations={translations}
                        />
                    )}
                    {activeTab === '3' && (
                        <JobTable
                            jobs={getFilteredJobs(archivedJobs)}
                            translations={translations}
                        />
                    )}
                </div>
            </div>
        </div>
    );
} 