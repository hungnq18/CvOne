"use client";
import React, { useState } from 'react';
import SearchBar from '../../components/ui/jobSearch';
import FilterPanel from '../../components/ui/FilterJob';
import JobList from '../../components/ui/jobList';
import PromoSlider from '../../components/ui/jobSlide';
import PopularCompanies from '../../components/ui/populateCompany';
import { Job } from '../../types/index';

const jobsData: Job[] = [
    {
        id: '1',
        title: 'Kỹ sư phần mềm',
        company: 'Công ty Tech',
        location: 'Hà Nội',
        category: 'Kỹ thuật',
        description: 'Phát triển và bảo trì ứng dụng web.',
        imageUrl: 'https://cdn.haitrieu.com/wp-content/uploads/2023/07/Logo-Vinamilk-1024x1024.png',
        salary: '20 - 40 triệu',
    },
    {
        id: '2',
        title: 'Chuyên viên Marketing',
        company: 'Công ty Marketing',
        location: 'TP. Hồ Chí Minh',
        category: 'Marketing',
        description: 'Tạo và thực hiện các chiến dịch marketing.',
        imageUrl: 'https://cdn.haitrieu.com/wp-content/uploads/2023/07/Logo-Vinamilk-1024x1024.png',
        salary: '15 - 30 triệu',
    },
    {
        id: '3',
        title: 'Nhà thiết kế UI/UX',
        company: 'Công ty Design',
        location: 'Hà Nội',
        category: 'Thiết kế',
        description: 'Thiết kế giao diện người dùng cho ứng dụng.',
        imageUrl: 'https://via.placeholder.com/400x200?text=UI+UX+Designer+1',
        salary: '18 - 35 triệu',
    },
    {
        id: '4',
        title: 'Nhà thiết kế UI/UX',
        company: 'Công ty Design',
        location: 'Hà Nội',
        category: 'Thiết kế',
        description: 'Thiết kế giao diện người dùng cho ứng dụng.',
        imageUrl: 'https://via.placeholder.com/400x200?text=UI+UX+Designer+2',
        salary: '18 - 35 triệu',
    },
    {
        id: '5',
        title: 'Nhà thiết kế UI/UX',
        company: 'Công ty Design',
        location: 'Hà Nội',
        category: 'Thiết kế',
        description: 'Thiết kế giao diện người dùng cho ứng dụng.',
        imageUrl: 'https://via.placeholder.com/400x200?text=UI+UX+Designer+3',
        salary: '18 - 35 triệu',
    },
    {
        id: '6',
        title: 'Nhà thiết kế UI/UX',
        company: 'Công ty Design',
        location: 'Hà Nội',
        category: 'Thiết kế',
        description: 'Thiết kế giao diện người dùng cho ứng dụng.',
        imageUrl: 'https://via.placeholder.com/400x200?text=UI+UX+Designer+4',
        salary: '18 - 35 triệu',
    },
    {
        id: '7',
        title: 'Nhà thiết kế UI/UX',
        company: 'Công ty Design',
        location: 'Hà Nội',
        category: 'Thiết kế',
        description: 'Thiết kế giao diện người dùng cho ứng dụng.',
        imageUrl: 'https://via.placeholder.com/400x200?text=UI+UX+Designer+5',
        salary: '18 - 35 triệu',
    },
];

// Sample data for popular companies
const popularCompanies = [
    { name: 'Holico', logo: 'https://cdn.haitrieu.com/wp-content/uploads/2023/07/Logo-Vinamilk-1024x1024.png', jobsCount: 10 },
    { name: 'BYD Việt Nam', logo: 'https://cdn.haitrieu.com/wp-content/uploads/2023/07/Logo-Vinamilk-1024x1024.png', jobsCount: 8 },
    { name: 'Transcosmos', logo: 'https://via.placeholder.com/50?text=Transcosmos', jobsCount: 6 },
    { name: 'Gia Minh', logo: 'https://via.placeholder.com/50?text=Gia+Minh', jobsCount: 5 },
    { name: 'SO Natural', logo: 'https://via.placeholder.com/50?text=SO+Natural', jobsCount: 4 },
];

const JobsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ categories: [] as string[], locations: [] as string[] });

    const filteredJobs = jobsData.filter((job) => {
        const matchesSearch =
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filters.categories.length === 0 || filters.categories.includes(job.category);
        const matchesLocation = filters.locations.length === 0 || filters.locations.includes(job.location);
        return matchesSearch && matchesCategory && matchesLocation;
    });

    const updateCategories = (newCategories: string[]) =>
        setFilters((prev) => ({ ...prev, categories: newCategories }));
    const updateLocations = (newLocations: string[]) =>
        setFilters((prev) => ({ ...prev, locations: newLocations }));

    return (
        <div className="container mx-auto p-4 mt-20">
            <PromoSlider />

            <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/4">
                    <FilterPanel
                        selectedCategories={filters.categories}
                        selectedLocations={filters.locations}
                        updateCategories={updateCategories}
                        updateLocations={updateLocations}
                    />
                </div>
                <div className="md:w-3/4">
                    <SearchBar onSearch={setSearchQuery} />
                    <JobList jobs={filteredJobs} />
                </div>

            </div>
            <div className="mb-8 mt-20">
                <PopularCompanies companies={popularCompanies} />
            </div>
        </div>
    );
};

export default JobsPage;