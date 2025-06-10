'use client';

import React from 'react';
import { Table, Tag, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Job, translations } from '@/app/myJobs/page';
import { useLanguage } from '@/providers/global-provider';
import '@/styles/jobButtons.css';

interface JobTableProps {
    jobs: Job[];
    translations: typeof translations;
}

const JobTable: React.FC<JobTableProps> = ({ jobs, translations }) => {
    const { language } = useLanguage();
    const t = translations[language];

    const handleDelete = (jobId: string) => {
        // TODO: Implement delete functionality
        console.log('Delete job:', jobId);
    };

    const handleArchive = (jobId: string) => {
        // TODO: Implement archive functionality
        console.log('Archive job:', jobId);
    };

    const handleView = (jobId: string) => {
        // TODO: Implement view functionality
        console.log('View job:', jobId);
    };

    const columns: ColumnsType<Job> = [
        {
            title: t.table.title,
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <a>{text}</a>,
        },
        {
            title: t.table.workType,
            dataIndex: 'workType',
            key: 'workType',
        },
        {
            title: t.table.location,
            dataIndex: 'location',
            key: 'location',
        },
        {
            title: t.table.country,
            dataIndex: 'country',
            key: 'country',
        },
        {
            title: t.table.experience,
            dataIndex: 'experience',
            key: 'experience',
        },
        {
            title: t.table.salaryRange,
            dataIndex: 'salaryRange',
            key: 'salaryRange',
        },
        // {
        //     title: t.table.postingDate,
        //     dataIndex: 'postingDate',
        //     key: 'postingDate',
        //     render: (date: Date) => date.toLocaleDateString(),
        // },
        {
            title: t.table.skills,
            key: 'skills',
            dataIndex: 'skills',
            render: (skills: string[]) => (
                <>
                    {skills.map((skill) => (
                        <Tag color="blue" key={skill}>
                            {skill}
                        </Tag>
                    ))}
                </>
            ),
        },
        {
            title: t.table.actions,
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <button
                        className="job-button view-button"
                        onClick={() => handleView(record._id)}
                    >
                        <span className="text">{t.actions.view}</span>
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                        </span>
                    </button>
                    <button
                        className="job-button archive-button"
                        onClick={() => handleArchive(record._id)}
                    >
                        <span className="text">{t.actions.archive}</span>
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
                            </svg>
                        </span>
                    </button>
                    <button
                        className="job-button delete-button"
                        onClick={() => handleDelete(record._id)}
                    >
                        <span className="text">{t.actions.remove}</span>
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                            </svg>
                        </span>
                    </button>
                </Space>
            ),
        },
    ];

    return <Table columns={columns} dataSource={jobs} rowKey="_id" />;
};

export default JobTable; 