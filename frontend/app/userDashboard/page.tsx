'use client';
import ProfileProgress from '@/components/ui/CVProgress';
import AppliedJobs from '@/components/ui/applyJob';
import SuggestedJobs from '@/components/ui/SuggestedJobs';
import SaveJobsInUserDash from '@/components/ui/SaveJobsInUserDash';
import CVList from '@/components/ui/cvList';
import { CV } from '@/api/cvapi';
import { ApplyJob, Job, getAppliedJobsByUser, getSavedJobsByUser, getJobs } from '@/api/jobApi';
import { useEffect, useState } from 'react';
import { getAllCVs } from '@/api/cvapi';

// Xóa mock allJobs và parseBenefitsString

export default function Home() {
  const profileProgress = 75;
  const [cvList, setCvList] = useState<CV[]>([]);
  const [cvImage, setCvImage] = useState<string>('');
  const [appliedJobs, setAppliedJobs] = useState<ApplyJob[]>([]);
  const [appliedLoading, setAppliedLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [suggestedJobs, setSuggestedJobs] = useState<Job[]>([]);
  const [suggestedLoading, setSuggestedLoading] = useState(true);

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

  useEffect(() => {
    async function fetchAppliedJobs() {
      setAppliedLoading(true);
      try {
        const res = await getAppliedJobsByUser(1, 3); // Fetch first 5 applied jobs for dashboard
        setAppliedJobs(res.data || []);
      } catch (err) {
        setAppliedJobs([]);
      } finally {
        setAppliedLoading(false);
      }
    }
    fetchAppliedJobs();
  }, []);

  useEffect(() => {
    async function fetchSavedJobs() {
      setSavedLoading(true);
      try {
        const res = await getSavedJobsByUser(1, 5);
        setSavedJobs((res.data || []).map((item: any) => (typeof item.jobId === 'object' ? item.jobId : null)).filter(Boolean));
      } catch (err) {
        setSavedJobs([]);
      } finally {
        setSavedLoading(false);
      }
    }
    fetchSavedJobs();
  }, []);

  useEffect(() => {
    async function fetchSuggestedJobs() {
      setSuggestedLoading(true);
      try {
        const jobs = await getJobs(1, 2); // Lấy 2 job mới nhất làm suggested
        setSuggestedJobs(jobs);
      } catch (err) {
        setSuggestedJobs([]);
      } finally {
        setSuggestedLoading(false);
      }
    }
    fetchSuggestedJobs();
  }, []);

  // Sort cvList by createdAt descending to get the latest CV
  const latestCV = cvList.length > 0 ? [...cvList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] : undefined;

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 mt-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[80vh]">
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
              <AppliedJobs jobs={appliedLoading ? [] : (appliedJobs as any)} />
            </div>
            <div className="sm:col-span-2">
              <SuggestedJobs jobs={suggestedLoading ? [] : suggestedJobs} />
            </div>
            <div className="sm:col-span-2">
              <SaveJobsInUserDash jobs={savedLoading ? [] : savedJobs} />
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