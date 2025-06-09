"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/providers/global-provider';
import JobTable from '@/components/sections/JobTable';
import JobSearch from '@/components/sections/JobSearch';
import JobTabs from '@/components/sections/JobTabs';
import '@/styles/myDocuments.css';
import { Job, translations } from '../../app/myJobs/page';

export default function MyJobsClient() {
    const [activeTab, setActiveTab] = useState('1');
    const [searchValue, setSearchValue] = useState('');
    const { language } = useLanguage();
    const t = translations[language];

    // Mock data - replace with actual API calls
    const savedJobs: Job[] = [
        {
            _id: '1',
            company_id: 'comp1',
            account_id: 'acc1',
            title: 'Senior React Developer',
            description: 'Looking for an experienced React developer...',
            workType: 'Full-time',
            postingDate: new Date('2024-03-15'),
            experience: '3-5 years',
            location: 'Ho Chi Minh City',
            qualifications: 'Bachelor\'s degree in Computer Science',
            salaryRange: '$2000 - $3000',
            country: 'Vietnam',
            skills: ['React', 'TypeScript', 'Node.js'],
            benefits: 'Health insurance, 13th month salary',
            responsibilities: 'Lead frontend development...',
            status: 'saved'
        },
        {
            _id: '2',
            company_id: 'comp2',
            account_id: 'acc1',
            title: 'Frontend Developer',
            description: 'Join our team as a Frontend Developer...',
            workType: 'Full-time',
            postingDate: new Date('2024-03-14'),
            experience: '1-3 years',
            location: 'Hanoi',
            qualifications: 'Bachelor\'s degree in related field',
            salaryRange: '$1500 - $2500',
            country: 'Vietnam',
            skills: ['JavaScript', 'Vue.js', 'CSS'],
            benefits: 'Remote work, flexible hours',
            responsibilities: 'Develop user interfaces...',
            status: 'saved'
        }
    ];

    const appliedJobs: Job[] = [
        {
            _id: '3',
            company_id: 'comp3',
            account_id: 'acc1',
            title: 'Full Stack Developer',
            description: 'Full stack position with modern tech stack...',
            workType: 'Full-time',
            postingDate: new Date('2024-03-13'),
            experience: '2-4 years',
            location: 'Da Nang',
            qualifications: 'Bachelor\'s degree in Computer Science',
            salaryRange: '$2500 - $3500',
            country: 'Vietnam',
            skills: ['React', 'Node.js', 'MongoDB'],
            benefits: 'Health insurance, annual bonus',
            responsibilities: 'Full stack development...',
            status: 'applied'
        }
    ];

    const archivedJobs: Job[] = [
        {
            _id: '4',
            company_id: 'comp4',
            account_id: 'acc1',
            title: 'Backend Developer',
            description: 'Backend developer position...',
            workType: 'Full-time',
            postingDate: new Date('2024-03-12'),
            experience: '2-3 years',
            location: 'Ho Chi Minh City',
            qualifications: 'Bachelor\'s degree in Computer Science',
            salaryRange: '$1800 - $2800',
            country: 'Vietnam',
            skills: ['Node.js', 'Express', 'MongoDB'],
            benefits: 'Health insurance, training budget',
            responsibilities: 'Backend API development...',
            status: 'archived'
        }
    ];

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