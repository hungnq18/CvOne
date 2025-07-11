"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, Search, MapPin, Calendar, DollarSign, Briefcase, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getJobsByHR, Job as JobApi, updateJob, deleteJob } from '@/api/jobApi';
import { getApplyJobByHR } from '@/api/apiApplyJob';
import JobTableInmanageJob from '@/components/hr/JobTableInmanageJob';
import JobEditModel from '@/components/modals/JobEditModel';
import JobDeleteDialog from '@/components/hr/JobDeleteDialog';
import SearchInmanageJob from '@/components/hr/searchInmanageJob';

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

    const filteredJobs = jobs.filter(job =>
        job["Job Title"].toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.Role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.Country.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleAddJob = () => {
        const job: Job = {
            _id: `job_${Date.now()}`,
            "Job Title": newJob["Job Title"] || "",
            Role: newJob.Role || "",
            Experience: newJob.Experience || "",
            Qualifications: newJob.Qualifications || "",
            "Salary Range": newJob["Salary Range"] || "",
            location: newJob.location || "",
            Country: newJob.Country || "",
            "Work Type": newJob["Work Type"] || "",
            "Job Posting Date": new Date().toLocaleDateString(),
            "Job Description": newJob["Job Description"] || "",
            Benefits: newJob.Benefits || "",
            skills: newJob.skills || "",
            Responsibilities: newJob.Responsibilities || "",
            user_id: "current_user_id",
            status: "Active",
            applications: 0
        }
        setJobs([...jobs, job])
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
        })
        setIsAddDialogOpen(false)
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
                />
                <Button className="flex items-center gap-2 w-full sm:w-auto" onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add New Job
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Job Listings</CardTitle>
                    <SearchInmanageJob searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
                </CardHeader>
                <CardContent className="overflow-x-auto p-0">
                    <JobTableInmanageJob
                        jobs={filteredJobs}
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
