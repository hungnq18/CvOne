import { fetchWithAuth } from './apiClient';
import { API_ENDPOINTS } from './apiConfig';


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

export async function getApplyJobByHR(day?: number, month?: number, year?: number) {
  let url = API_ENDPOINTS.APPLYJOB.GET_APPLY_JOB_BY_HR;
  if (day && month && year) {
    const params = new URLSearchParams({
      day: day.toString(),
      month: month.toString(),
      year: year.toString(),
    });
    url = `${url}?${params.toString()}`;
  }
  return fetchWithAuth(url);
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

export async function getCountApplyJobByStatus(status: string, day?: number, month?: number, year?: number) {
  // Nếu truyền đủ day, month, year thì gọi endpoint mới
  if (day !== undefined && month !== undefined && year !== undefined) {
    return fetchWithAuth(`/apply-job/count-apply-job-by-status/${status}/${day}/${month}/${year}`);
  }
  // Mặc định gọi endpoint cũ
  return fetchWithAuth(API_ENDPOINTS.APPLYJOB.COUNT_BY_STATUS(status));
}

export async function getCountApplyJobByStatusWeek(status: string, week: number, month: number, year: number) {
  return fetchWithAuth(`/apply-job/count-apply-job-by-status-week/${status}/${week}/${month}/${year}`);
}
