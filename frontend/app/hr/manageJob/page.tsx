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
    isActive: boolean
    applications?: number
    applicationDeadline: string
}

export default function ManageJobPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
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
        Responsibilities: "",
        applicationDeadline: ""
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
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
                    _id: job._id || '',
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
                    isActive: job.isActive !== undefined ? job.isActive : true,
                    applications: applyCountMap[job._id] || 0,
                    applicationDeadline: job.applicationDeadline || ''
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
        const matchStatus = statusFilter === 'all' || (job.isActive ? 'Active' : 'Inactive') === statusFilter;
        const matchWorkType = workTypeFilter === 'all' || job["Work Type"] === workTypeFilter;
        return matchSearch && matchStatus && matchWorkType;
    });

    // Sort jobs
    const sortedJobs = [...filteredJobs].sort((a, b) => {
        if (sortOption === 'newest') {
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
            return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
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
            { key: "Benefits", label: "Benefits" },
            { key: "skills", label: "Skills" },
            { key: "Responsibilities", label: "Responsibilities" },
            { key: "applicationDeadline", label: "Application Deadline" }
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

        // Validate applicationDeadline format and future date
        if (!newJob.applicationDeadline) {
            newErrors["applicationDeadline"] = "Application Deadline is required";
        } else {
            const deadlineDate = new Date(newJob.applicationDeadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time part for date comparison

            if (!/^\d{4}-\d{2}-\d{2}$/.test(newJob.applicationDeadline)) {
                newErrors["applicationDeadline"] = "Application Deadline must be in format YYYY-MM-DD";
            } else if (deadlineDate < today) {
                newErrors["applicationDeadline"] = "Application Deadline cannot be in the past";
            }
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            return;
        }

        try {
            const benefitsArray = typeof newJob.Benefits === 'string'
                ? newJob.Benefits.split(',').map(b => b.trim()).filter(Boolean)
                : [];
            if (benefitsArray.length === 0) {
                newErrors["Benefits"] = "At least one benefit is required";
                setErrors(newErrors);
                return;
            }

            // Format date string to match ISO format expected by backend
            const now = new Date();
            const formattedDate = now.toISOString().split('T')[0];

            const jobData = {
                title: newJob["Job Title"],
                description: newJob["Job Description"],
                role: newJob.Role,
                workType: newJob["Work Type"],
                postingDate: formattedDate,
                experience: newJob.Experience,
                qualifications: newJob.Qualifications,
                salaryRange: salary,
                location: newJob.location,
                country: newJob.Country,
                benefits: benefitsArray,
                skills: newJob.skills,
                responsibilities: newJob.Responsibilities,
                applicationDeadline: newJob.applicationDeadline
            };

            await createJob(jobData);

            // Reload jobs
            const jobsData = await getJobsByHR();
            let jobsArr = Array.isArray(jobsData) ? jobsData : ((jobsData as any)?.data ? (jobsData as any).data : []);
            const applyJobsData = await getApplyJobByHR();
            let applyArr = Array.isArray(applyJobsData) ? applyJobsData : ((applyJobsData as any)?.data ? (applyJobsData as any).data : []);
            const applyCountMap: Record<string, number> = {};
            applyArr.forEach((apply: any) => {
                const jobId = apply.job_id || (apply.jobId && apply.jobId._id);
                if (jobId) {
                    applyCountMap[jobId] = (applyCountMap[jobId] || 0) + 1;
                }
            });

            setJobs(jobsArr.map((job: any) => ({
                _id: job._id || '',
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
                isActive: job.isActive !== undefined ? job.isActive : true,
                applications: applyCountMap[job._id] || 0,
                applicationDeadline: job.applicationDeadline || ''
            })));

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
                Responsibilities: "",
                applicationDeadline: ""
            });
            setErrors({});
            setIsAddDialogOpen(false);
            toast({ title: "Success", description: "Job added successfully!" });
        } catch (error) {
            setErrors({ general: 'Failed to add job' });
            toast({ title: "Error", description: "Failed to add job", variant: "destructive" });
        }
    };

    const handleEditJob = async () => {
        if (!selectedJob) {
            toast({ title: "Error", description: "No job selected", variant: "destructive" });
            return;
        }

        // Chuẩn bị dữ liệu và xử lý định dạng
        const benefitsArray = selectedJob.Benefits?.split(',')
            .map(b => b.trim().replace(/^'|'$/g, '')) // Loại bỏ dấu nháy đơn thừa
            .filter(Boolean) || [];

        // Xử lý applicationDeadline
        let applicationDeadlineISO = selectedJob.applicationDeadline; // Giá trị mặc định
        if (applicationDeadlineISO) {
            try {
                const date = new Date(applicationDeadlineISO);
                if (isNaN(date.getTime())) {
                    throw new Error("Invalid date");
                }
                applicationDeadlineISO = date.toISOString(); // Chuyển thành ISO 8601
            } catch (error) {
                toast({ title: "Error", description: "Invalid application deadline format", variant: "destructive" });
                return;
            }
        } else {
            toast({ title: "Error", description: "Application deadline is required", variant: "destructive" });
            return;
        }

        const jobData = {
            title: selectedJob["Job Title"],
            role: selectedJob.Role,
            experience: selectedJob.Experience,
            qualifications: selectedJob.Qualifications,
            salaryRange: selectedJob["Salary Range"],
            location: selectedJob.location,
            country: selectedJob.Country,
            workType: selectedJob["Work Type"],
            description: selectedJob["Job Description"],
            benefits: benefitsArray,
            skills: selectedJob.skills,
            responsibilities: selectedJob.Responsibilities,
            applicationDeadline: applicationDeadlineISO, // Đảm bảo có giá trị
            isActive: selectedJob.isActive
        };

        try {
            console.log('Data sent to updateJob:', jobData); // Log dữ liệu để kiểm tra

            // Gọi API update
            await updateJob(selectedJob._id, jobData);

            // Lấy lại danh sách jobs từ API để đồng bộ
            const jobsData = await getJobsByHR();
            const applyJobsData = await getApplyJobByHR();
            const applyCountMap: Record<string, number> = {};
            applyJobsData.forEach((apply: any) => {
                const jobId = apply.job_id || (apply.jobId && apply.jobId._id);
                if (jobId) applyCountMap[jobId] = (applyCountMap[jobId] || 0) + 1;
            });

            setJobs(jobsData.map((job: any) => ({
                _id: job._id || '',
                "Job Title": job.title || '',
                Role: job.role || '',
                Experience: job.experience || '',
                Qualifications: job.qualifications || '',
                "Salary Range": job.salaryRange || '',
                location: job.location || '',
                Country: job.country || '',
                "Work Type": job.workType || '',
                "Job Posting Date": job.postingDate || '',
                "Job Description": job.description || '',
                Benefits: Array.isArray(job.benefits) ? job.benefits.join(', ') : (job.benefits || ''),
                skills: job.skills || '',
                Responsibilities: job.responsibilities || '',
                user_id: job.user_id || '',
                isActive: job.isActive !== undefined ? job.isActive : true,
                applications: applyCountMap[job._id] || 0,
                applicationDeadline: job.applicationDeadline || ''
            })));

            toast({ title: "Success", description: "Job updated successfully!" });
            setIsEditDialogOpen(false);
            setSelectedJob(null);
        } catch (error: any) {
            console.error('Error updating job:', error.response?.data, error.message);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to update job";
            toast({ title: "Error", description: errorMessage, variant: "destructive" });
        }
    };

    const handleDeleteJob = async () => {
        if (selectedJob) {
            try {
                await deleteJob(selectedJob._id);
                setJobs(jobs.filter(job => job._id !== selectedJob._id));
                toast({ title: "Success", description: "Job deleted successfully!" });
            } catch (error) {
                toast({ title: "Error", description: "Failed to delete job", variant: "destructive" });
            }
            setIsDeleteDialogOpen(false);
            setSelectedJob(null);
        }
    };

    const getStatusColor = (status: string) => {
        return status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
    };

    const getWorkTypeColor = (workType: string) => {
        switch (workType) {
            case "Full-time":
                return "bg-blue-100 text-blue-800";
            case "Part-time":
                return "bg-purple-100 text-purple-800";
            case "Intern":
                return "bg-orange-100 text-orange-800";
            case "Temporary":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="p-2 sm:p-4 md:p-6 space-y-6 max-w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Manage Jobs</h1>

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
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
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

            {/* Add/Edit Dialog */}
            <JobEditModel
                open={isAddDialogOpen || isEditDialogOpen}
                onOpenChange={(open) => {
                    if (isAddDialogOpen) setIsAddDialogOpen(open);
                    if (isEditDialogOpen) setIsEditDialogOpen(open);
                }}
                job={isEditDialogOpen && selectedJob ? selectedJob : newJob}
                onChange={(job) => isEditDialogOpen ? setSelectedJob(job as Job) : setNewJob(job)}
                onSave={isEditDialogOpen ? handleEditJob : handleAddJob}
                isEdit={isEditDialogOpen}
                errors={errors}
            />

            {/* Delete Dialog */}
            <JobDeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onDelete={handleDeleteJob}
                job={selectedJob}
            />
        </div>
    );
}