'use client';

import Link from 'next/link';
import { Job, JobCategory } from '@/app/jobPage/page'; // Import interfaces từ file jobPage
import { useLanguage } from '@/providers/global-provider';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const translations = {
  vi: {
    title: 'Tìm các loại công việc',
    exploreTitle: 'Khám phá các loại công việc',
    placeholder: 'Tìm kiếm công việc theo tiêu đề',
    noJobs: 'Không tìm thấy công việc nào',
    noRoles: 'Không tìm thấy vai trò nào',
    typeOfWork: 'Loại công việc',
    jobRoles: 'Vai trò công việc',
    search: 'Tìm kiếm',
    selectType: 'Vui lòng chọn một loại công việc',
  },
  en: {
    title: 'Find various job types',
    exploreTitle: 'Explore Job Types',
    placeholder: 'Search jobs by title',
    noJobs: 'No jobs found',
    noRoles: 'No roles found',
    typeOfWork: 'Type of work',
    jobRoles: 'Job roles',
    search: 'Search',
    selectType: 'Please select a job type',
  },
};

interface JobSearchProps {
  jobData: Record<string, JobCategory>;
  jobTypes: string[];
}

export default function JobSearch({ jobData, jobTypes }: JobSearchProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedType, setSelectedType] = useState<string | null>(searchParams.get('type') || null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Update URL when selectedType changes
  useEffect(() => {
    const params = new URLSearchParams();
    console.log('jobData:', jobData);
    // if (selectedType) params.set('type', selectedType);
    router.push(`/jobPage?${params.toString()}`, { scroll: false });
  }, [selectedType, router]);

  const t = translations[language];

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;
    setSearchQuery(search);
  };

  return (
    <div className="space-y-8">
      {/* Tiêu đề chính */}
      <h1 className="text-3xl font-bold text-indigo-900 mb-6 text-center">{t.exploreTitle}</h1>

      {/* Container chính cho sidebar và danh sách công việc */}
      <div className="flex flex-col lg:flex-row gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Sidebar for job types */}
        <aside className="w-full lg:w-1/4 p-4 border-r border-gray-300">
          <h2 className="text-lg font-semibold text-indigo-800 mb-4">{t.typeOfWork}</h2>
          <div className="space-y-3">
            {jobTypes.map((type) => (
              <Link
                key={type}
                href={`/jobs?type=${encodeURIComponent(type)}`}
                onClick={() => setSelectedType(type)}
                className={`block p-2 rounded-lg ${selectedType === type ? 'bg-indigo-100' : 'hover:bg-indigo-50'} transition-colors duration-200`}
              >
                <span className="text-gray-800 text-sm font-medium">{type}</span>
              </Link>
            ))}
          </div>
        </aside>

        {/* Main content for jobs */}
        <main className="w-full lg:w-3/4 p-4 space-y-6">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl font-bold text-indigo-900">{t.title}</h1>
            <form onSubmit={handleSearch} className="flex items-center w-full sm:w-auto">
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder={t.placeholder}
                className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-l-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors duration-200"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300 transition-colors duration-200 flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z"
                  />
                </svg>
                <span className="text-sm font-medium">{t.search}</span>
              </button>
            </form>
          </header>

          <section className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            {selectedType ? (
              jobData[selectedType]?.jobs.length === 0 ? (
                <p className="text-gray-500 text-center py-2">{t.noJobs}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jobData[selectedType].jobs
                    .filter((job) => job.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((job) => (
                      <Link
                        key={job.id}
                        href={`/jobs/${encodeURIComponent(selectedType)}/${job.id}`}
                      >
                        <div className="p-4 border border-gray-300 rounded-lg bg-white hover:bg-indigo-50 hover:shadow-sm transition-all duration-200 flex flex-col h-40">
                          <h3 className="text-gray-800 text-md font-medium">{job.title}</h3>

                        </div>
                      </Link>
                    ))}
                </div>
              )
            ) : (
              <p className="text-gray-500 text-center py-2">{t.selectType}</p>
            )}
          </section>
        </main>
      </div>

      {/* Hiển thị danh sách subTypes nếu selectedType tồn tại */}
      {selectedType && jobData[selectedType] && (
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-indigo-800 mb-4">
            {t.jobRoles} - {selectedType}
          </h2>
          {jobData[selectedType].subTypes.length === 0 ? (
            <p className="text-gray-500 text-center py-2">{t.noRoles}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobData[selectedType].subTypes
                .filter((role) => role.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((role) => (
                  <Link
                    key={role}
                    href={`/jobs/${encodeURIComponent(selectedType)}/${encodeURIComponent(role)}`}
                  >
                    <div className="p-4 border border-gray-300 rounded-lg bg-white hover:bg-indigo-50 hover:shadow-sm transition-all duration-200">
                      <h3 className="text-gray-800 text-md font-medium">{role}</h3>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}