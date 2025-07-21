import { fetchWithAuth } from './apiClient';
import { API_ENDPOINTS } from './apiConfig';

export interface ApplyJob {
  id: string;
  job_id: string;
  user_id: string;
  cv_id?: string;
  cvUrl?: string;
  coverletter_id?: string;
  coverletterUrl?: string;
  status: string;
  submit_at: string;
}

export async function getAllApplyJobs() {
  return fetchWithAuth(API_ENDPOINTS.APPLYJOB.GET_ALL);
}

export async function getApplyJobById(id: string) {
  return fetchWithAuth(API_ENDPOINTS.APPLYJOB.GET_BY_ID(id));
}

// Sửa type payload cho createApplyJob
export interface CreateApplyJobPayload {
  jobId: string;
  cvId?: string;
  cvUrl?: string;
  coverletterId?: string;
  coverletterUrl?: string;
}

export const createApplyJob = async (data: CreateApplyJobPayload) => {
  return fetchWithAuth(API_ENDPOINTS.APPLYJOB.CREATE, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export async function getApplyJobByUser() {
  return fetchWithAuth(API_ENDPOINTS.APPLYJOB.GET_APPLY_JOB_BY_USER);
}

export async function getApplyJobByHR() {
  return fetchWithAuth(API_ENDPOINTS.APPLYJOB.GET_APPLY_JOB_BY_HR);
}

export async function getApplyJobByJob() {
  return fetchWithAuth(API_ENDPOINTS.APPLYJOB.GET_APPLY_JOB_BY_JOB);
}

export async function getApplyJobDetail(id: string) {
  return fetchWithAuth(API_ENDPOINTS.APPLYJOB.GET_APPLY_JOB_DETAIL(id));
}

export async function updateApplyJobByUser(id: string, data: {
  cv_id?: string;
  coverletter_id?: string;
}) {
  return fetchWithAuth(API_ENDPOINTS.APPLYJOB.UPDATE_APPLY_JOB_BY_USER(id), {
    method: 'PATCH', // Sửa từ PUT thành PATCH để khớp với backend
    body: JSON.stringify(data),
  });
}

export async function updateStatusByHr(id: string, status: "approved" | "rejected" | "reviewed") {
  return fetchWithAuth(API_ENDPOINTS.APPLYJOB.UPDATE_STATUS_BY_HR(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export async function deleteApplyJobByHR(id: string) {
  return fetchWithAuth(
    API_ENDPOINTS.APPLYJOB.DELETE_APPLY_JOB_BY_HR(id),
    {
      method: 'DELETE',
    }
  );
}
