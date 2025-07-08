import { API_URL, API_ENDPOINTS } from './apiConfig';
import { fetchWithAuth } from './apiClient';

// Helper fetch
// (apiFetch giữ lại nếu cần cho public API, nhưng các API xác thực sẽ dùng fetchWithAuth)
async function apiFetch(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
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

export async function getAllApplyJobs() {
  return fetchWithAuth(API_ENDPOINTS.APPLYJOB.GET_ALL);
}

export async function getApplyJobById(id: string) {
  return fetchWithAuth(API_ENDPOINTS.APPLYJOB.GET_BY_ID(id));
}

export async function createApplyJob(data: any) {
  return fetchWithAuth(
    API_ENDPOINTS.APPLYJOB.CREATE,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export async function updateApplyJob(id: string, data: any) {
  return fetchWithAuth(
    API_ENDPOINTS.APPLYJOB.UPDATE(id),
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

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

export async function updateStatusByHR(id: string, data: any) {
  return fetchWithAuth(
    API_ENDPOINTS.APPLYJOB.UPDATE_STATUS_BY_HR(id),
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

export async function updateApplyJobByUser(id: string, data: any) {
  return fetchWithAuth(
    API_ENDPOINTS.APPLYJOB.UPDATE_APPLY_JOB_BY_USER(id),
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}
