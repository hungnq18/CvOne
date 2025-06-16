/**
 * Job API Module
 *
 * This module provides functions for managing Job data:
 * - Getting all jobs
 * - Getting job by ID
 * - Creating a new job
 * - Updating a job
 * - Deleting a job
 */

import { fetchWithAuth } from "./apiClient";
import { API_ENDPOINTS } from "./apiConfig";
import db from './db.json';

export interface Job {
  _id: string;
  title: string;
  description: string;
  role: string;
  workType: string;
  postingDate: string;
  experience: string;
  qualifications: string;
  salaryRange: string;
  location: string;
  country: string;
  benefits: string[];
  skills: string;
  responsibilities: string;
  company_id: string;
  user_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardJob {
  id: number;
  title: string;
  company: string;
  description: string;
  status?: string;
}

export interface ApplyJob {
  id: string;
  job_id: string;
  user_id: string;
  cv_id: string;
  coverletter_id?: string;
  status: string;
  submit_at: string;
}

/**
 * Get all jobs
 * @returns Promise with array of jobs
 */
export const getJobs = async (): Promise<Job[]> => {
  return fetchWithAuth(API_ENDPOINTS.JOB.GET_ALL);
};

/**
 * Get job by ID
 * @param id - The job ID to fetch
 * @returns Promise with job data
 */
export const getJobById = async (id: string): Promise<Job | undefined> => {
  return fetchWithAuth(API_ENDPOINTS.JOB.GET_BY_ID(id));
};

/**
 * Create a new job
 * @param data - Job data to create
 * @returns Promise with the created job
 */
export const createJob = async (data: Omit<Job, "_id" | "createdAt" | "updatedAt">): Promise<Job> => {
  return fetchWithAuth(API_ENDPOINTS.JOB.CREATE, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * Update a job
 * @param id - The job ID to update
 * @param data - Job data to update
 * @returns Promise with the updated job
 */
export const updateJob = async (id: string, data: Partial<Job>): Promise<Job> => {
  return fetchWithAuth(API_ENDPOINTS.JOB.UPDATE(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

/**
 * Delete a job
 * @param id - The job ID to delete
 * @returns Promise with the deletion result
 */
export const deleteJob = async (id: string): Promise<void> => {
  return fetchWithAuth(API_ENDPOINTS.JOB.DELETE(id), {
    method: "DELETE",
  });
};


// Helper to parse the inconsistent benefits string into a string array
const parseBenefitsString = (benefits: string): string[] => {
    if (!benefits || typeof benefits !== 'string') return [];
    // This regex handles the specific format `{'benefit1, benefit2, ...'}`
    return benefits.replace(/^{'(.*)'}$/, '$1').split(', ');
};


// get data from db.json
const allLocalJobs: Job[] = (db as any).jobs.map((job: any, index: number) => ({
    _id: `job_raw_${index}`, // Create a stable ID for client-side operations
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
    skills: job['skills'] || '',
    responsibilities: job['Responsibilities'] || '',
    company_id: 'N/A', // Placeholder
    user_id: 'N/A',   // Placeholder
    createdAt: new Date(job['Job Posting Date']).toISOString(),
    updatedAt: new Date(job['Job Posting Date']).toISOString(),
}));


/**
 * Get all jobs from local db.json
 * @returns Array of jobs
 */
export const getLocalJobs = (): Job[] => {
  return allLocalJobs;
};

/**
 * Get job by ID from local db.json
 * @param id - The job ID to fetch
 * @returns Job data or undefined if not found
 */
export const getLocalJobById = (id: string): Job | undefined => {
  return allLocalJobs.find(job => job._id === id);
};

/**
 * Find related jobs from local db.json based on skills
 * @param currentJob - The job to find related jobs for
 * @param count - The number of related jobs to return
 * @returns Array of related jobs
 */
// get job have same role or have same skill
export const findRelatedLocalJobs = (currentJob: Job, count: number): Job[] => {
    const currentSkills = (currentJob.skills || '').toLowerCase().split(',').map(s => s.trim());
    const currentRole = currentJob.role;

    return allLocalJobs
        .filter(job => {
            // Exclude the current job itself
            if (job._id === currentJob._id) return false;

            // Check for matching role
            const hasSameRole = job.role === currentRole;

            // Check for at least one matching skill
            const jobSkills = (job.skills || '').toLowerCase().split(',').map(s => s.trim());
            const hasSharedSkill = currentSkills.some(skill => skill && jobSkills.includes(skill));
            
            return hasSameRole || hasSharedSkill;
        })
        .slice(0, count);
};
