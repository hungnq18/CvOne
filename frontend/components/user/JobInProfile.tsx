import React, { useEffect, useState } from 'react';
import { getAppliedJobsByUser, Job, ApplyJob } from '@/api/jobApi';
import { MapPin, DollarSign, Calendar, Briefcase } from "lucide-react";

const getStatusColor = (status: string) => {
    switch (status) {
        case "pending":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "accepted":
            return "bg-green-100 text-green-800 border-green-200";
        case "rejected":
            return "bg-red-100 text-red-800 border-red-200";
        case "interviewing":
            return "bg-blue-100 text-blue-800 border-blue-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

interface JobInProfileProps {
    initialJobs?: (Job | undefined)[];
    initialApplies?: ApplyJob[];
}

const JobInProfileComponent: React.FC<JobInProfileProps> = ({ initialJobs, initialApplies }) => {
    const [jobs, setJobs] = useState<(Job | undefined)[]>(initialJobs ?? []);
    const [applies, setApplies] = useState<ApplyJob[]>(initialApplies ?? []);
    const [loading, setLoading] = useState(!(initialApplies && initialApplies.length > 0));
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Nếu đã có dữ liệu từ server thì không cần fetch lại
        if (initialApplies && initialApplies.length > 0) {
            setLoading(false);
            return;
        }

        const fetchJobs = async () => {
            setLoading(true);
            try {
                const res = await getAppliedJobsByUser(1, 3);
                const applyList: any[] = res.data || [];
                // Lấy job object trực tiếp từ jobId
                const jobsWithDetails = applyList.map(item => item.jobId);
                setJobs(jobsWithDetails);
                setApplies(applyList);
                setError(null);
            } catch (err) {
                setError('Failed to load applied jobs.');
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [initialApplies]);

    if (loading) {
        return (
            <div className="card bg-white/80 backdrop-blur-sm border border-blue-200 shadow-xl">
                <div className="card-body py-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-blue-100 rounded w-1/3"></div>
                        <div className="space-y-3">
                            <div className="h-20 bg-gray-100 rounded-xl"></div>
                            <div className="h-20 bg-gray-100 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (error) {
        return <div className="flex justify-center items-center text-red-500 py-8">{error}</div>;
    }

    const sortedApplies = applies
        .map((apply, idx) => ({ apply, job: jobs[idx] }))
        .filter(item => item.job)
        .sort((a, b) => {
            const dateA = a.apply.submit_at || (a.apply as any).createdAt || (a.apply as any).appliedAt || '';
            const dateB = b.apply.submit_at || (b.apply as any).createdAt || (b.apply as any).appliedAt || '';
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        })
        .slice(0, 3);

    if (!jobs.length) {
        return <div className="flex justify-center items-center text-gray-500 py-8">No applied jobs found.</div>;
    }

    return (
        <div className="card bg-white/80 backdrop-blur-sm border border-blue-200 shadow-xl">
            <div className="card-body">
                <h5 className="text-lg font-bold mb-6 text-blue-900">Job Applications</h5>
                <div className="space-y-6">
                    {sortedApplies.length === 0 && (
                        <div className="text-gray-500 text-center">No applied jobs found.</div>
                    )}
                    {sortedApplies.map(({ apply, job }, idx) => (
                        !job ? null : (
                            <div
                                key={apply?.id || (apply as any)._id || idx}
                                className="w-full rounded-2xl border border-blue-100 bg-white/90 shadow-md hover:shadow-lg transition-all duration-200 p-5 flex flex-col gap-3"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold text-blue-800 group-hover:text-blue-900 mb-1">{job?.title || 'No title'}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{job?.role || ''}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm border ml-2 flex-shrink-0 ${getStatusColor(apply.status)}`}>{apply.status}</span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-700">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        <span className="truncate">{job?.location || 'N/A'}, {job?.country || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <Briefcase className="h-3 w-3" />
                                            <span>{job?.workType || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-3 w-3" />
                                            <span>{job?.salaryRange || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
                                        <Calendar className="h-3 w-3" />
                                        <span className="font-medium">Applied {formatDate(apply.submit_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 pt-1">
                                        <span className="font-semibold text-purple-700">Required Skills:</span>
                                        <span className="truncate text-gray-700">{Array.isArray(job?.skills) ? job.skills.join(', ') : (job?.skills || 'N/A')}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
};

// Memo để tránh re-render khi parent thay đổi state khác (JobInProfile không nhận props)
const JobInProfile = React.memo(JobInProfileComponent);

export default JobInProfile; 