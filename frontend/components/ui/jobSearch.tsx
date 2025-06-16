'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Job } from '@/api/jobApi';
import { useLanguage } from '@/providers/global-provider';
import { Pagination } from 'antd';

const translations = {
  vi: {
    title: 'Tìm các loại công việc',
    exploreTitle: 'Khám phá các loại công việc',
    placeholder: 'Tìm kiếm công việc theo tiêu đề',
    noJobs: 'Không tìm thấy công việc nào',
    typeOfWork: 'Loại công việc',
  },
  en: {
    title: 'Find various job types',
    exploreTitle: 'Explore Job Types',
    placeholder: 'Search jobs by title',
    noJobs: 'No jobs found',
    typeOfWork: 'Type of work',
  },
};

interface JobSearchProps {
  jobs: Job[];
  jobTypes: string[];
}

const PAGE_SIZE = 9;

export default function JobSearch({ jobs, jobTypes }: JobSearchProps) {
  const { language } = useLanguage();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter jobs based on search query and selected type
  const filteredJobs = jobs.filter(job =>
    (!selectedType || job.workType === selectedType) &&
    job.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType]);

  // Paginate the filtered jobs
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">{t.exploreTitle}</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-1/4 lg:border-r lg:pr-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{t.typeOfWork}</h2>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedType(null)}
              className={`w-full text-left p-2 rounded-lg ${selectedType === null ? 'bg-indigo-100' : 'hover:bg-gray-100'} transition-colors duration-200`}
            >
              <span className="text-gray-800 text-sm font-medium">All Types</span>
            </button>
            {jobTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`w-full text-left p-2 rounded-lg ${selectedType === type ? 'bg-indigo-100' : 'hover:bg-gray-100'} transition-colors duration-200`}
              >
                <span className="text-gray-800 text-sm font-medium">{type}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="w-full lg:w-3/4 space-y-6">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl font-bold text-gray-800">{t.title}</h1>
            <form className="form relative w-full sm:w-auto" onSubmit={(e) => e.preventDefault()}>
              <button type="submit" className="absolute left-2 -translate-y-1/2 top-1/2 p-1">
                <svg
                  width="17"
                  height="16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-labelledby="search"
                  className="w-4 h-4 text-gray-700"
                >
                  <path
                    d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9"
                    stroke="currentColor"
                    strokeWidth="1.333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </button>
              <input
                className="input rounded-full px-8 py-2 text-sm border-2 border-transparent focus:outline-none focus:border-blue-500 placeholder-gray-400 transition-all duration-300 shadow-md w-full"
                placeholder={t.placeholder || "Search..."}
                required={false}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 -translate-y-1/2 top-1/2 p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </form>
          </header>

          <section className="min-h-[300px]">
            {paginatedJobs.length === 0 ? (
              <p className="text-gray-500 text-center py-10">{t.noJobs}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedJobs.map((job) => (
                  <Link
                    key={job._id}
                    href={`/jobPage/${job._id}`}
                  >
                    <div className="p-4 border rounded-lg hover:bg-gray-100 transition-colors duration-200 flex flex-col h-48">
                      <div>
                        <h3 className="text-gray-800 text-md font-medium truncate" title={job.title}>{job.title}</h3>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 items-center">
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded-full">{job.role}</span>
                        <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">{job.workType}</span>
                      </div>

                      <div className="mt-auto pt-2 space-y-2">
                        <p className="text-sm font-semibold text-green-600">{job.salaryRange}</p>
                        <p className="text-xs text-gray-600">{job.location}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
          <div className="flex justify-center mt-8">
            <Pagination
              current={currentPage}
              pageSize={PAGE_SIZE}
              total={filteredJobs.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        </main>
      </div>
    </div>
  );
}