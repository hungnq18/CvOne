import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MapPin, DollarSign, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Job {
    _id: string;
    "Job Title": string;
    Role: string;
    Experience: string;
    Qualifications: string;
    "Salary Range": string;
    location: string;
    Country: string;
    "Work Type": string;
    "Job Posting Date": string;
    "Job Description": string;
    Benefits: string;
    skills: string;
    Responsibilities: string;
    user_id: string;
    status?: "Active" | "Inactive";
    applications?: number;
}

interface JobTableProps {
    jobs: Job[];
    onEdit: (job: Job) => void;
    onDelete: (job: Job) => void;
    getStatusColor: (status: string) => string;
    getWorkTypeColor: (workType: string) => string;
}

const JobTable: React.FC<JobTableProps> = ({ jobs, onEdit, onDelete, getStatusColor, getWorkTypeColor }) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead className="hidden md:table-cell">Role</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="hidden lg:table-cell">Experience</TableHead>
                    <TableHead className="hidden md:table-cell">Salary Range</TableHead>
                    <TableHead>Work Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Applications</TableHead>
                    <TableHead className="hidden lg:table-cell">Posted Date</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {jobs.map((job) => (
                    <TableRow key={job._id}>
                        <TableCell className="font-medium">{job["Job Title"]}</TableCell>
                        <TableCell className="hidden md:table-cell">{job.Role}</TableCell>
                        <TableCell>
                            <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{job.location}, {job.Country}</span>
                            </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{job.Experience}</TableCell>
                        <TableCell className="hidden md:table-cell">
                            <div className="flex items-center space-x-1">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span>{job["Salary Range"]}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <span
                                className={
                                    getWorkTypeColor(job["Work Type"]) +
                                    " transition-colors duration-150 px-2 py-1 rounded font-semibold cursor-pointer border border-transparent hover:border-gray-300 hover:bg-opacity-80 shadow-sm"
                                }
                                title={job["Work Type"]}
                            >
                                {job["Work Type"]}
                            </span>
                        </TableCell>
                        <TableCell>
                            <span
                                className={
                                    getStatusColor(job.status || "Active") +
                                    " transition-colors duration-150 px-2 py-1 rounded font-semibold cursor-pointer border border-transparent hover:border-gray-300 hover:bg-opacity-80 shadow-sm"
                                }
                                title={job.status || "Active"}
                            >
                                {job.status || "Active"}
                            </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{job.applications || 0}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{job["Job Posting Date"]}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={() => onEdit(job)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => onDelete(job)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default JobTable; 