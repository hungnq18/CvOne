'use client';
import ProfileProgress from '@/components/ui/CVProgress';
import AppliedJobs from '@/components/ui/applyJob';
import SuggestedJobs from '@/components/ui/SuggestedJobs';
import FavoriteJobs from '@/components/ui/FavoriteJobs';
import CVList from '@/components/ui/cvList';
import { CV } from '@/api/cvapi';
import { ApplyJob, Job } from '@/api/jobApi';
import db from '@/api/db.json';
import { useEffect, useState } from 'react';
import { getAllCVs } from '@/api/cvapi';

// Helper to parse the inconsistent benefits string into a string array
const parseBenefitsString = (benefits: string): string[] => {
  if (!benefits || typeof benefits !== 'string') return [];
  // Removes outer {' and '} and then splits the string into an array
  return benefits.replace(/^{'(.*)'}$/, '$1').split(', ');
};

// Map the raw 'jobs' array to conform to our existing 'Job' interface
const allJobs: Job[] = Array.isArray((db as any).jobs)
  ? (db as any).jobs.map((job: any, index: number) => ({
    _id: `job_raw_${index}`,
    title: job['Job Title'],
    description: job['Job Description'],
    role: job['Role'],
    workType: job['Work Type'],
    postingDate: new Date(job['Job Posting Date']).toISOString(),
    experience: job['Experience'],
    qualifications: job['Qualifications'],
    salaryRange: job['Salary Range'],
    location: job['location'],
    country: job['Country'],
    benefits: parseBenefitsString(job['Benefits']),
    skills: job['skills'],
    responsibilities: job['Responsibilities'],
    company_id: 'N/A', // No data available in source
    user_id: 'N/A',   // No data available in source
    createdAt: new Date(job['Job Posting Date']).toISOString(),
    updatedAt: new Date(job['Job Posting Date']).toISOString(),
  }))
  : [];

export default function Home() {
  const profileProgress = 75;
  const appliedJobs: ApplyJob[] = db.appliedJobs;
  // Take a slice of the mapped jobs for the dashboard
  const suggestedJobs: Job[] = allJobs.slice(0, 2);
  const favoriteJobs: Job[] = allJobs.slice(2, 4);
  const [cvList, setCvList] = useState<CV[]>([]);
  const [cvImage, setCvImage] = useState<string>('');
  useEffect(() => {
    async function fetchCVs() {
      try {
        const res = await getAllCVs();
        // If API returns { data: [...] }
        const cvs = Array.isArray(res) ? res : res.data || [];
        setCvList(cvs);
        setCvImage(cvs[0]?.content?.userData?.avatar || '');
      } catch (err) {
        setCvList([]);
        setCvImage('');
      }
    }
    fetchCVs();
  }, []);

  // Sort cvList by createdAt descending to get the latest CV
  const latestCV = cvList.length > 0 ? [...cvList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] : undefined;

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 mt-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Cột bên trái: ProfileProgress và ảnh CV */}
          <div className="lg:col-span-1">
            <div className="sticky top-12 space-y-6">
              <ProfileProgress
                progress={profileProgress}
                cvTemplateId={latestCV?.cvTemplateId}
                cvUserData={latestCV?.content?.userData}
              />
            </div>
          </div>

          {/* Cột bên phải: Các section khác */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <AppliedJobs jobs={appliedJobs} />
            </div>
            <div className="sm:col-span-2">
              <SuggestedJobs jobs={suggestedJobs} />
            </div>
            <div className="sm:col-span-2">
              <FavoriteJobs jobs={favoriteJobs} />
            </div>
            <div className="sm:col-span-2">
              <CVList cvList={cvList} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}