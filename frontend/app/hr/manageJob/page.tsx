"use client"

import { getApplyJobByHR } from '@/api/apiApplyJob'
import { createJob, deleteJob, getJobsByHR, updateJob } from '@/api/jobApi'
import JobDeleteDialog from '@/components/hr/JobDeleteDialog'
import JobTableInmanageJob from '@/components/hr/JobTableInManageJob'
import SearchInmanageJob from '@/components/hr/searchInManageJob'
import JobEditModel from '@/components/modals/JobEditModel'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"

// Định nghĩa interface cho Job
interface Job {
    _id: string
    "Job Title": string
    Role: string
    Experience: string
    Qualifications: string
    "Salary Range": string
    location: string
    Country: string
    "Work Type": string
    "Job Posting Date": string
    "Job Description": string
    Benefits: string
    skills: string
    Responsibilities: string
    user_id: string
    status?: "Active" | "Inactive"
    applications?: number
}


export default function ManageJobPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [newJob, setNewJob] = useState<Partial<Job>>({
        "Job Title": "",
        Role: "",
        Experience: "",
        Qualifications: "",
        "Salary Range": "",
        location: "",
        Country: "",
        "Work Type": "",
        "Job Description": "",
        Benefits: "",
        skills: "",
        Responsibilities: ""
    })
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    // State cho filter và sort
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [workTypeFilter, setWorkTypeFilter] = useState<string>('all');
    const [sortOption, setSortOption] = useState<string>('newest');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Lấy dữ liệu thật từ API khi load trang
    useEffect(() => {
        async function fetchData() {
            // Lấy jobs
            const jobsData = await getJobsByHR();
            let jobsArr = Array.isArray(jobsData) ? jobsData : ((jobsData as any)?.data ? (jobsData as any).data : []);

            // Lấy apply jobs
            const applyJobsData = await getApplyJobByHR();
            let applyArr = Array.isArray(applyJobsData) ? applyJobsData : ((applyJobsData as any)?.data ? (applyJobsData as any).data : []);

            // Đếm số lượng apply cho từng job_id
            const applyCountMap: Record<string, number> = {};
            applyArr.forEach((apply: any) => {
                const jobId = apply.job_id || (apply.jobId && apply.jobId._id);
                if (jobId) {
                    applyCountMap[jobId] = (applyCountMap[jobId] || 0) + 1;
                }
            });

            // Gán lại số lượng applications cho từng job
            if (Array.isArray(jobsArr)) {
                setJobs(jobsArr.map((job: any) => ({
                    _id: job._id,
                    "Job Title": job.title || job["Job Title"] || '',
                    Role: job.role || '',
                    Experience: job.experience || '',
                    Qualifications: job.qualifications || '',
                    "Salary Range": job.salaryRange || job["Salary Range"] || '',
                    location: job.location || '',
                    Country: job.country || '',
                    "Work Type": job.workType || job["Work Type"] || '',
                    "Job Posting Date": job.postingDate || job["Job Posting Date"] || '',
                    "Job Description": job.description || job["Job Description"] || '',
                    Benefits: Array.isArray(job.benefits) ? job.benefits.join(', ') : (job.benefits || ''),
                    skills: job.skills || '',
                    Responsibilities: job.responsibilities || '',
                    user_id: job.user_id || '',
                    status: job.status || 'Active',
                    applications: applyCountMap[job._id] || 0
                })));
            }
        }
        fetchData();
    }, []);

    // Filter jobs
    const filteredJobs = jobs.filter(job => {
        const matchSearch =
            (job["Job Title"] || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (job.Role || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (job.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (job.Country || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'all' || (job.status || 'Active') === statusFilter;
        const matchWorkType = workTypeFilter === 'all' || job["Work Type"] === workTypeFilter;
        return matchSearch && matchStatus && matchWorkType;
    });

    // Sort jobs
    const sortedJobs = [...filteredJobs].sort((a, b) => {
        if (sortOption === 'newest') {
            // Ưu tiên ngày đăng mới nhất
            const dateA = new Date(a["Job Posting Date"]).getTime();
            const dateB = new Date(b["Job Posting Date"]).getTime();
            return dateB - dateA;
        } else if (sortOption === 'oldest') {
            const dateA = new Date(a["Job Posting Date"]).getTime();
            const dateB = new Date(b["Job Posting Date"]).getTime();
            return dateA - dateB;
        } else if (sortOption === 'mostApplicants') {
            return (b.applications || 0) - (a.applications || 0);
        } else if (sortOption === 'leastApplicants') {
            return (a.applications || 0) - (b.applications || 0);
        } else if (sortOption === 'activeFirst') {
            return (b.status === 'Active' ? 1 : 0) - (a.status === 'Active' ? 1 : 0);
        }
        return 0;
    });

    // Pagination logic
    const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
    const paginatedJobs = sortedJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleAddJob = async () => {
        const salary = newJob["Salary Range"] || "";
        const salaryRegex = /^\$\d{1,3}K-\$\d{1,3}K$/;
        let newErrors: { [key: string]: string } = {};
        // Validate required fields
        const requiredFields = [
            { key: "Job Title", label: "Job Title" },
            { key: "Job Description", label: "Job Description" },
            { key: "Role", label: "Role" },
            { key: "Work Type", label: "Work Type" },
            { key: "Experience", label: "Experience" },
            { key: "Qualifications", label: "Qualifications" },
            { key: "Salary Range", label: "Salary Range" },
            { key: "location", label: "Location" },
            { key: "Country", label: "Country" },
            { key: "skills", label: "Skills" },
            { key: "Responsibilities", label: "Responsibilities" },
        ];
        requiredFields.forEach(f => {
            const value = (newJob as any)[f.key];
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                newErrors[f.key] = `${f.label} is required.`;
            }
        });
        // Validate salary format
        if (salary && !salaryRegex.test(salary)) {
            newErrors["Salary Range"] = 'Salary Range must be in format: $56K-$116K';
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            return;
        }
        try {
            await createJob({
                title: newJob["Job Title"] || "",
                description: newJob["Job Description"] || "",
                role: newJob.Role || "",
                workType: newJob["Work Type"] || "",
                postingDate: new Date().toISOString(),
                experience: newJob.Experience || "",
                qualifications: newJob.Qualifications || "",
                salaryRange: salary,
                location: newJob.location || "",
                country: newJob.Country || "",
                benefits: typeof newJob.Benefits === 'string'
                    ? newJob.Benefits.split(',').map(b => b.trim()).filter(Boolean)
                    : [],
                skills: newJob.skills || "",
                responsibilities: newJob.Responsibilities || "",
            });
            // Sau khi tạo thành công, reload lại danh sách jobs
            const jobsData = await getJobsByHR();
            let jobsArr = Array.isArray(jobsData) ? jobsData : ((jobsData as any)?.data ? (jobsData as any).data : []);
            setJobs(jobsArr);
            // Reset form
            setNewJob({
                "Job Title": "",
                Role: "",
                Experience: "",
                Qualifications: "",
                "Salary Range": "",
                location: "",
                Country: "",
                "Work Type": "",
                "Job Description": "",
                Benefits: "",
                skills: "",
                Responsibilities: ""
            });
            setErrors({});
            setIsAddDialogOpen(false);
            window.location.reload();
        } catch (error) {
            setErrors({ general: 'Failed to add job' });
        }
    }
    const handleEditJob = async () => {
        if (selectedJob) {
            try {
                // Gọi API updateJob
                await updateJob(selectedJob._id, {
                    title: selectedJob["Job Title"],
                    role: selectedJob.Role,
                    experience: selectedJob.Experience,
                    qualifications: selectedJob.Qualifications,
                    salaryRange: selectedJob["Salary Range"],
                    location: selectedJob.location,
                    country: selectedJob.Country,
                    workType: selectedJob["Work Type"],
                    description: selectedJob["Job Description"],
                    benefits: selectedJob.Benefits?.split(',').map(b => b.trim()),
                    skills: selectedJob.skills,
                    responsibilities: selectedJob.Responsibilities,
                });
                setJobs(jobs.map(job => job._id === selectedJob._id ? { ...selectedJob } : job));
                toast({ title: "Success", description: "Job updated successfully!" });
            } catch (error) {
                alert('Failed to update job');
            }
            setIsEditDialogOpen(false);
            setSelectedJob(null);
        }
    }

    const handleDeleteJob = async () => {
        if (selectedJob) {
            try {
                // Gọi API deleteJob
                await deleteJob(selectedJob._id);
                setJobs(jobs.filter(job => job._id !== selectedJob._id));
                toast({ title: "Success", description: "Job deleted successfully!" });
            } catch (error) {
                alert('Failed to delete job');
            }
            setIsDeleteDialogOpen(false);
            setSelectedJob(null);
        }
    }

    const getStatusColor = (status: string) => {
        return status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
    }

    const getWorkTypeColor = (workType: string) => {
        switch (workType) {
            case "Full-time":
                return "bg-blue-100 text-blue-800"
            case "Part-time":
                return "bg-purple-100 text-purple-800"
            case "Intern":
                return "bg-orange-100 text-orange-800"
            case "Contract":
                return "bg-yellow-100 text-yellow-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <div className="p-2 sm:p-4 md:p-6 space-y-6 max-w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Manage Jobs</h1>
                <JobEditModel
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                    job={newJob}
                    onChange={setNewJob}
                    onSave={handleAddJob}
                    isEdit={false}
                    errors={errors}
                />
            </div>

            <Card>
                <CardHeader className="space-y-2">
                    <CardTitle>Job Listings</CardTitle>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
                        {/* Filter by status */}
                        <select
                            className="border rounded px-2 py-1 text-sm"
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="all">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        {/* Filter by work type */}
                        <select
                            className="border rounded px-2 py-1 text-sm"
                            value={workTypeFilter}
                            onChange={e => { setWorkTypeFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="all">All Work Types</option>
                            <option value="Full-Time">Full-time</option>
                            <option value="Part-Time">Part-time</option>
                            <option value="Intern">Intern</option>
                            <option value="Temporary">Temporary</option>
                        </select>
                        {/* Sort options */}
                        <select
                            className="border rounded px-2 py-1 text-sm"
                            value={sortOption}
                            onChange={e => setSortOption(e.target.value)}
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="mostApplicants">Most Applicants</option>
                            <option value="leastApplicants">Least Applicants</option>
                            <option value="activeFirst">Active First</option>
                        </select>
                        <Button className="w-full mt-2 sm:ml-auto sm:w-auto sm:mt-0 flex items-center gap-2" onClick={() => setIsAddDialogOpen(true)}>
                            <Plus className="h-4 w-4" />
                            Add New Job
                        </Button>
                    </div>
                    <SearchInmanageJob searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
                </CardHeader>
                <CardContent className="overflow-x-auto p-0">
                    <JobTableInmanageJob
                        jobs={paginatedJobs}
                        onEdit={(job: Job) => {
                            setSelectedJob(job);
                            setIsEditDialogOpen(true);
                        }}
                        onDelete={(job: Job) => {
                            setSelectedJob(job);
                            setIsDeleteDialogOpen(true);
                        }}
                        getStatusColor={getStatusColor}
                        getWorkTypeColor={getWorkTypeColor}
                    />
                    {/* Pagination controls */}
                    <div className="flex justify-center items-center gap-1 mt-2">
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded-md border text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            &lt;
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                className={`w-8 h-8 flex items-center justify-center rounded-md border text-xs ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded-md border text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            &gt;
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <JobEditModel
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                job={selectedJob || {}}
                onChange={(job) => setSelectedJob(job as any)}
                onSave={handleEditJob}
                isEdit={true}
            />

            {/* Delete Dialog */}
            <JobDeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onDelete={handleDeleteJob}
                job={selectedJob}
            />
        </div>
    )
}
