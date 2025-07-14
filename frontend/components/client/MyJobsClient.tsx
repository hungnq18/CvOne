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
import { TablePaginationConfig } from 'antd';

export default function MyJobsClient() {
    const [activeTab, setActiveTab] = useState('1');
    const [searchValue, setSearchValue] = useState('');
    const { language } = useLanguage();
    const t = translations[language];

    // Pagination state for saved jobs
    const [savedJobs, setSavedJobs] = useState<Job[]>([]);
    const [savedTotal, setSavedTotal] = useState(0);
    const [savedPage, setSavedPage] = useState(1);
    const [savedPageSize, setSavedPageSize] = useState(7);
    const [loading, setLoading] = useState(false);

    // Pagination state for applied jobs
    const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);
    const [appliedTotal, setAppliedTotal] = useState(0);
    const [appliedPage, setAppliedPage] = useState(1);
    const [appliedPageSize, setAppliedPageSize] = useState(7);
    const [appliedLoading, setAppliedLoading] = useState(false);
    const userId = getAccountIdFromToken();

    useEffect(() => {
        async function fetchJobs() {
            if (!userId) return;
            setLoading(true);
            const res = await getSavedJobsByUser(savedPage, savedPageSize);
            const savedWithDetails = (res.data || []).map((item: any) => ({
                ...item.jobId,
                status: 'saved',
                savedId: item._id,
                savedAt: item.createdAt,
            }));
            setSavedJobs(savedWithDetails);
            setSavedTotal(res.total || 0);
            setLoading(false);
        }
        if (activeTab === '1') fetchJobs();
    }, [userId, savedPage, savedPageSize, activeTab]);

    useEffect(() => {
        async function fetchAppliedJobs() {
            if (!userId) return;
            setAppliedLoading(true);
            const res = await getAppliedJobsByUser(appliedPage, appliedPageSize);
            const appliedWithDetails = (res.data || []).map((item: any) => ({
                ...item.jobId,
                status: 'applied',
                appliedId: item._id,
                appliedAt: item.createdAt,
            }));
            setAppliedJobs(appliedWithDetails);
            setAppliedTotal(res.total || 0);
            setAppliedLoading(false);
        }
        if (activeTab === '2') fetchAppliedJobs();
    }, [userId, appliedPage, appliedPageSize, activeTab]);

    const onTabChange = (key: string) => setActiveTab(key);
    const onSearch = (value: string) => setSearchValue(value);

    // Filter only on client for search (optional: can be moved to backend if supported)
    const getFilteredJobs = (jobs: Job[]) => {
        if (!searchValue) return jobs;
        return jobs.filter(job =>
            job.title.toLowerCase().includes(searchValue.toLowerCase()) ||
            job.location.toLowerCase().includes(searchValue.toLowerCase()) ||
            job.country.toLowerCase().includes(searchValue.toLowerCase()) ||
            (Array.isArray(job.skills) && job.skills.some(skill => skill.toLowerCase().includes(searchValue.toLowerCase())))
        );
    };

    // Pagination config for Ant Design Table
    const pagination: TablePaginationConfig = {
        current: savedPage,
        pageSize: savedPageSize,
        total: savedTotal,
        onChange: (page) => {
            setSavedPage(page);
        },
    };
    const appliedPagination: TablePaginationConfig = {
        current: appliedPage,
        pageSize: appliedPageSize,
        total: appliedTotal,
        onChange: (page) => {
            setAppliedPage(page);
        },
    };

    // Handler to remove a job from savedJobs state directly (cách 2)
    const handleRemoveSavedJob = (jobId: string) => {
        setSavedJobs(jobs => jobs.filter(job => job._id !== jobId));
    };

    return (
        <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 mt-16">
            <div className="max-w-7xl mx-auto">
                <div className="p-2 mb-6">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <JobTabs
                            activeTab={activeTab}
                            onTabChange={onTabChange}
                            savedJobs={[]}
                            appliedJobs={[]}
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
                            pagination={pagination}
                            loading={loading}
                            onRemove={handleRemoveSavedJob}
                        />
                    )}
                    {activeTab === '2' && (
                        <JobTable
                            jobs={getFilteredJobs(appliedJobs)}
                            translations={translations}
                            pagination={appliedPagination}
                            loading={appliedLoading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
} 