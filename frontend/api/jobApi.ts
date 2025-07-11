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

import { fetchWithAuth, fetchWithoutAuth } from "./apiClient";
import { API_ENDPOINTS } from "./apiConfig";

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
  createdAt?: string;
  updatedAt?: string;
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
 * Get all jobs (public endpoint)
 * @returns Promise with array of jobs
 */
export const getJobs = async (page: number = 1, limit: number = 100): Promise<Job[]> => {
  try {
    console.log('Fetching jobs with params:', { page, limit });
    const response = await fetchWithoutAuth(`${API_ENDPOINTS.JOB.GET_ALL}?page=${page}&limit=${limit}`);
    console.log('Jobs response:', response);
    // Backend returns { data: jobs[], page, limit }
    return response?.data || [];
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
};

/**
 * Get job by ID (requires auth)
 * @param id - The job ID to fetch
 * @returns Promise with job data
 */
export const getJobById = async (id: string): Promise<Job | undefined> => {
  try {
    console.log('Fetching job by ID:', id);
    const response = await fetchWithAuth(API_ENDPOINTS.JOB.GET_BY_ID(id));
    console.log('Job by ID response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    return undefined;
  }
};

/**
 * Create a new job (requires HR auth)
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
 * Update a job (requires HR auth)
 * @param id - The job ID to update
 * @param data - Job data to update
 * @returns Promise with the updated job
 */
export const updateJob = async (id: string, data: Partial<Job>): Promise<Job> => {
  return fetchWithAuth(API_ENDPOINTS.JOB.UPDATE(id), {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
};

/**
 * Delete a job (requires HR auth)
 * @param id - The job ID to delete
 * @returns Promise with the deletion result
 */
export const deleteJob = async (id: string): Promise<void> => {
  return fetchWithAuth(API_ENDPOINTS.JOB.DELETE(id), {
    method: "DELETE",
    headers: { 'Content-Type': 'application/json' },
  });
};

/**
 * Get jobs by HR user (requires HR auth)
 * @returns Promise with array of jobs created by HR
 */
export const getJobsByHR = async (): Promise<Job[]> => {
  try {
    const response = await fetchWithAuth(API_ENDPOINTS.JOB.GET_JOB_BY_HR);
    return response || [];
  } catch (error) {
    console.error('Error fetching jobs by HR:', error);
    return [];
  }
};

/**
 * Get all jobs (synchronous version for backward compatibility)
 * @returns Array of jobs
 */
export const getLocalJobs = async (): Promise<Job[]> => {
  return getJobs();
};

/**
 * Get job by ID (synchronous version for backward compatibility)
 * @param id - The job ID to fetch
 * @returns Job data or undefined if not found
 */
export const getLocalJobById = async (id: string): Promise<Job | undefined> => {
  return getJobById(id);
};

/**
 * Find related jobs based on skills and role
 * @param currentJob - The job to find related jobs for
 * @param count - The number of related jobs to return
 * @returns Array of related jobs
 */
export const findRelatedLocalJobs = async (currentJob: Job, count: number): Promise<Job[]> => {
  try {
    const allJobs = await getJobs();
    const currentSkills = (currentJob.skills || '').toLowerCase().split(',').map(s => s.trim());
    const currentRole = currentJob.role;

    return allJobs
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
  } catch (error) {
    console.error('Error finding related jobs:', error);
    return [];
  }
};

/**
 * Save a job for the current user
 * @param jobId - The job ID to save
 * @returns Promise with API response
 */
export const saveJob = async (jobId: string): Promise<any> => {
  try {
    return await fetchWithAuth(API_ENDPOINTS.SAVED_JOB.SAVE_JOB(jobId), {
      method: "POST",
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get saved jobs for the current user (paginated)
 * @param page - Page number
 * @param limit - Items per page
 * @returns Promise with paginated saved jobs
 */
export const getSavedJobsByUser = async (page: number = 1, limit: number = 10): Promise<any> => {
  try {
    return await fetchWithAuth(`${API_ENDPOINTS.SAVED_JOB.GET_SAVE_JOB}?page=${page}&limit=${limit}`);
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    return { data: [], total: 0, page, limit };
  }
};

/**
 * Get applied jobs for the current user (paginated)
 * @param page - Page number
 * @param limit - Items per page
 * @returns Promise with paginated applied jobs
 */
export const getAppliedJobsByUser = async (page: number = 1, limit: number = 10): Promise<any> => {
  try {
    return await fetchWithAuth(`${API_ENDPOINTS.APPLYJOB.GET_APPLY_JOB_BY_USER}?page=${page}&limit=${limit}`);
  } catch (error) {
    console.error('Error fetching applied jobs:', error);
    return { data: [], total: 0, page, limit };
  }
};
