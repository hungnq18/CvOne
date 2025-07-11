export const API_URL = "http://localhost:8000/api";
// export const API_URL = "http://localhost:3001";

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
    CHANGE_PASSWORD: "/auth/change-password",
    CREATE: "/cover-letters",
  },
  ACCOUNTS: {
    VERIFY_EMAIL: "/accounts/verify-email",
    RESEND_VERIFICATION: "/accounts/resend-verification",
    VERIFY_TOKEN: (token: string) => `/accounts/verify-email/${token}`,
    CHECK_TOKEN: (token: string) => `/accounts/check-token/${token}`,
  },
  USER: {
    GET_ALL: "/users",
    GET_BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    GET_PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/profile",
  },
  PROFILE: {
    GET: "/profile",
    UPDATE: "/profile",
    UPLOAD_AVATAR: "/profile/avatar",
  },
  CV: {
    GET_ALL: "/cv",
    GET_BY_ID: (id: string) => `/cv/${id}`,
    CREATE: "/cv",
    UPDATE: (id: string) => `/cv/${id}`,
    DELETE: (id: string) => `/cv/${id}`,
    SHARE: (id: string) => `/cv/${id}/share`,
    TEMPLATES: "/cv-templates",
  },
  CL: {
    TEMPLATES: "/cl-templates",
    TEMPLATE_BY_ID: (id: string) => `/cl-templates/${id}`,
    GET_BY_ID: (id: string) => `/cover-letters/${id}`,
    GET_ALL: "/cover-letters",
    CREATE: "/cover-letters",
    UPDATE: (id: string) => `/cover-letters/${id}`,
    DELETE: (id: string) => `/cover-letters/${id}`,
    EXTRACT_COVER_LETTER: "/cover-letters/extract/from-path",
  },
  CHAT: {
    GET_MESSAGES: (convId: string) => `/chat/messages/${convId}`,
  },
  CONVERSATION: {
    GET_BY_ID: (convId: string) => `/conversations/${convId}`,
    GET_ALL: "/conversations",
    CREATE: "/conversations",
  },
  JOB: {
    GET_ALL: "/jobs",
    GET_BY_ID: (id: string) => `/jobs/${id}`,
    CREATE: "/jobs",
    UPDATE: (id: string) => `/jobs/${id}`,
    DELETE: (id: string) => `/jobs/${id}`,
    COUNTBYPOSTINGDATE: (month: number, year: number) =>
      `/jobs/count-by-posting-date/${month}/${year}`,
    GET_JOB_BY_HR: "/jobs/by-hr",
  },
  NOTIFICATION: {
    GET_NOTIFICATIONS: "/notifications",
  },
  APPLYJOB: {
    COUNTBYCREATEAT: (month: number, year: number) =>
      `/apply-job/count-by-create-at/${month}/${year}`,
    GET_ALL: "/apply-job",
    GET_BY_ID: (id: string) => `/apply-job/${id}`,
    CREATE: "/apply-job",
    UPDATE: (id: string) => `/apply-job/${id}`,
    GET_APPLY_JOB_BY_USER: `/apply-job/by-user`,
    GET_APPLY_JOB_BY_HR: `/apply-job/by-hr`,
    GET_APPLY_JOB_BY_JOB: `/apply-job/by-job`,
    GET_APPLY_JOB_DETAIL: (id: string) => `/apply-job/${id}`,
    UPDATE_STATUS_BY_HR: (id: string) => `/apply-job/${id}/status/by-hr`,
    UPDATE_APPLY_JOB_BY_USER: (id: string) => `/apply-job/${id}/user-update`,
  },
  SAVED_JOB: {
    GET_SAVE_JOB: "/saved-jobs",
    SAVE_JOB: (jobId: string) => `/saved-jobs/${jobId}`,
    UN_SAVE_JOB: (jobId: string) => `/saved-jobs/${jobId}`,
  },
  UPLOAD: {
    UPLOAD_FILE: "/upload",
  },
} as const;
