'use client';
import React, { useState } from 'react';
import { Tabs } from 'antd';
import CVList from '@/components/sections/listMyCV';
import CoverLetterList from '@/components/sections/listMyCL';
import '@/styles/myDocuments.css';

export interface CV {
    _id: string;
    title?: string;
    image?: string;
    user_id: string;
    description?: string;
    languages?: string[];
    create_at: Date;
    is_public: boolean;
    templateCV_id: string;
    heading?: string;
    education?: string[];
    work_history?: string[];
    skill?: string[];
    summary?: string;
    finalize: boolean;
}

export interface Resume {
    _id: string;
    title: string;
    createdAt: Date;
    status: string;
    image?: string;
}

export interface CoverLetter {
    _id: string;
    user_id: string;
    cl_template_id: string;
    title: string;
    company_address: string;
    introduction: string;
    body?: string;
    closing?: string;
    signature?: string;
    created_at: Date;
    updated_at?: Date;
}

export default function Page() {
    const [activeTab, setActiveTab] = useState('1');
    const [searchValue, setSearchValue] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const cvList: CV[] = [
        {
            _id: 'cv1',
            title: 'CV - Web Developer',
            image: 'https://via.placeholder.com/150x200',
            user_id: 'user1',
            description: 'CV for web developer role',
            languages: ['English', 'Vietnamese'],
            create_at: new Date('2025-06-07'),
            is_public: true,
            templateCV_id: 'template1',
            heading: 'Web Developer Resume',
            education: ['BSc Computer Science - XYZ University'],
            work_history: ['Web Developer at Tech Corp (2023-2025)'],
            skill: ['React', 'Node.js', 'TypeScript'],
            summary: 'Experienced web developer with 3+ years in React and Node.js',
            finalize: true,
        },
        {
            _id: 'cv2',
            title: 'CV - Designer',
            image: 'https://via.placeholder.com/150x200',
            user_id: 'user2',
            description: 'CV for UI/UX designer role',
            languages: ['English'],
            create_at: new Date('2025-06-06'),
            is_public: false,
            templateCV_id: 'template2',
            heading: 'UI/UX Designer Resume',
            education: ['BA Design - ABC University'],
            work_history: ['Designer at Design Studio (2022-2025)'],
            skill: ['Figma', 'Adobe XD'],
            summary: 'Creative designer with expertise in UI/UX',
            finalize: false,
        },
    ];

    const coverLetterList: CoverLetter[] = [
        {
            _id: 'cl1',
            user_id: 'user1',
            cl_template_id: 'template_cl1',
            title: 'Cover Letter - Web Dev',
            company_address: '123 Tech Street, Silicon Valley',
            introduction: 'I am excited to apply for the React Developer position.',
            body: 'With 3 years of experience in web development...',
            closing: 'I look forward to discussing my application.',
            signature: 'Mart Pedunn',
            created_at: new Date('2025-06-07'),
            updated_at: new Date('2025-06-07'),
        },
    ];

    const onTabChange = (key: string) => {
        setActiveTab(key);
    };

    const onSearch = (value: string) => {
        setSearchValue(value);
    };

    const filteredCVList = cvList.filter(cv =>
        cv.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
        cv.description?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const filteredCoverLetterList = coverLetterList.filter(cl =>
        cl.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        cl.company_address.toLowerCase().includes(searchValue.toLowerCase())
    );

    const items = [
        {
            key: '1',
            label: `CV (${filteredCVList.length})`,
            children: null,
        },
        {
            key: '2',
            label: `Cover Letters (${filteredCoverLetterList.length})`,
            children: null,
        },
    ];

    return (
        <div
            className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8 mt-16"
            style={{
                backgroundSize: 'cover',
                backgroundPosition: 'bottom',
            }}
        >
            <div className="max-w-7xl mx-auto">
                <div className="bg-white p-4 shadow-md mb-6">
                    <div className="flex items-center justify-between gap-4">
                        <Tabs
                            activeKey={activeTab}
                            onChange={onTabChange}
                            items={items}
                            className="flex-1 min-w-0"
                        />
                        <div className="flex items-center space-x-4">
                            <div className="custom-search">
                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                />
                                <button id="search-icon">
                                    <div id="search-icon-circle"></div>
                                    <span></span>
                                </button>
                            </div>
                            <select
                                value={viewMode}
                                onChange={(e) => setViewMode(e.target.value as 'grid' | 'list')}
                                style={{ width: 100, height: 40, padding: '0 10px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                            >
                                <option value="grid">Grid</option>
                                <option value="list">List</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    {activeTab === '1' && <CVList cvList={filteredCVList} viewMode={viewMode} />}
                    {activeTab === '2' && <CoverLetterList coverLetters={filteredCoverLetterList} viewMode={viewMode} />}
                </div>
            </div>
        </div>
    );
}