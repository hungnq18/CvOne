"use client";

import ProfileProgress from "@/components/ui/CVProgress";
import AppliedJobs from "@/components/ui/applyJob";
import SuggestedJobs from "@/components/ui/SuggestedJobs";
import SaveJobsInUserDash from "@/components/ui/SaveJobsInUserDash";
import CVList from "@/components/ui/cvList";
import { CV, getAllCVs } from "@/api/cvapi";
import {
  ApplyJob,
  Job,
  getAppliedJobsByUser,
  getSavedJobsByUser,
  getJobs,
} from "@/api/jobApi";
import { useEffect, useState } from "react";

export default function HomeClient() {
  const profileProgress = 75;
  const [cvList, setCvList] = useState<CV[]>([]);
  const [cvImage, setCvImage] = useState<string>("");
  const [appliedJobs, setAppliedJobs] = useState<ApplyJob[]>([]);
  const [appliedLoading, setAppliedLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [suggestedJobs, setSuggestedJobs] = useState<Job[]>([]);
  const [suggestedLoading, setSuggestedLoading] = useState(true);

  // Fetch CVs
  useEffect(() => {
    async function fetchCVs() {
      try {
        const res = await getAllCVs();
        const cvs = Array.isArray(res) ? res : res.data || [];
        setCvList(cvs);
        setCvImage(cvs[0]?.content?.userData?.avatar || "");
      } catch {
        setCvList([]);
        setCvImage("");
      }
    }
    fetchCVs();
  }, []);

  // Fetch applied jobs
  useEffect(() => {
    async function fetchAppliedJobs() {
      setAppliedLoading(true);
      try {
        const res = await getAppliedJobsByUser(1, 3);
        setAppliedJobs(res.data || []);
      } catch {
        setAppliedJobs([]);
      } finally {
        setAppliedLoading(false);
      }
    }
    fetchAppliedJobs();
  }, []);

  // Fetch saved jobs
  useEffect(() => {
    async function fetchSavedJobs() {
      setSavedLoading(true);
      try {
        const res = await getSavedJobsByUser(1, 5);
        setSavedJobs(
          (res.data || [])
            .map((item: any) =>
              typeof item.jobId === "object" ? item.jobId : null
            )
            .filter(Boolean)
        );
      } catch {
        setSavedJobs([]);
      } finally {
        setSavedLoading(false);
      }
    }
    fetchSavedJobs();
  }, []);

  // Fetch suggested jobs
  useEffect(() => {
    async function fetchSuggestedJobs() {
      setSuggestedLoading(true);
      try {
        const jobs = await getJobs(1, 2);
        setSuggestedJobs(jobs);
      } catch {
        setSuggestedJobs([]);
      } finally {
        setSuggestedLoading(false);
      }
    }
    fetchSuggestedJobs();
  }, []);

  // Get latest CV
  const latestCV =
    cvList.length > 0
      ? [...cvList].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]
      : undefined;

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 mt-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[80vh]">
          {/* Left column: ProfileProgress */}
          <div className="lg:col-span-1">
            <div className="sticky top-12 space-y-6">
              <ProfileProgress
                cvId={latestCV?._id}
                progress={profileProgress}
                cvTemplateId={latestCV?.cvTemplateId}
                cvUserData={latestCV?.content?.userData}
              />
            </div>
          </div>

          {/* Right column: sections */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <AppliedJobs jobs={appliedLoading ? [] : (appliedJobs as any)} />
            </div>
            {/* <div className="sm:col-span-2">
              <SuggestedJobs jobs={suggestedLoading ? [] : suggestedJobs} />
            </div> */}
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
