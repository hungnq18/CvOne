import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import UserProfile from "@/components/user/UserProfile";
import { API_URL, API_ENDPOINTS } from "@/api/apiConfig";
import { User } from "@/types/auth";
import type { ApplyJob, Job } from "@/api/jobApi";

// Lấy token từ cookie trên server
function getTokenFromCookies(): string | null {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  return token || null;
}

// Decode token trên server để lấy userId
function getUserIdFromServerToken(): string | null {
  const token = getTokenFromCookies();
  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    return (
      decoded.user ||
      decoded.id ||
      decoded.hr ||
      decoded.sub ||
      decoded._id ||
      null
    );
  } catch (e) {
    return null;
  }
}

// Fetch user trên server để có sẵn data cho lần render đầu
async function fetchUserOnServer(): Promise<User | null> {
  try {
    const userId = getUserIdFromServerToken();
    if (!userId) return null;

    const res = await fetch(
      `${API_URL}${API_ENDPOINTS.USER.GET_BY_ID(userId)}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as User;
    return data ?? null;
  } catch (error) {
    return null;
  }
}

// Fetch danh sách job đã apply trên server để render cùng lúc với profile
async function fetchAppliedJobsOnServer(): Promise<{
  applies: ApplyJob[];
  jobs: (Job | undefined)[];
}> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return { applies: [], jobs: [] };

    const res = await fetch(
      `${API_URL}${API_ENDPOINTS.APPLYJOB.GET_APPLY_JOB_BY_USER}?page=1&limit=3`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return { applies: [], jobs: [] };
    }

    const data: any = await res.json();
    const applyList: any[] = data?.data || data || [];
    const jobsWithDetails = applyList.map(
      (item) => item.jobId as Job | undefined
    );

    return {
      applies: applyList as ApplyJob[],
      jobs: jobsWithDetails,
    };
  } catch (error) {
    return { applies: [], jobs: [] };
  }
}

export default async function Page() {
  // Chạy song song để giảm tổng thời gian chờ I/O
  const [user, appliedResult] = await Promise.all([
    fetchUserOnServer(),
    fetchAppliedJobsOnServer(),
  ]);

  const { applies, jobs } = appliedResult;

  return (
    <UserProfile
      initialUser={user}
      initialJobs={jobs}
      initialApplies={applies}
    />
  );
}

export const dynamic = "force-dynamic";
