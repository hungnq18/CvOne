export const API_URL = "http://localhost:3001";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
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
    GET_ALL: "/cvs",
    GET_BY_ID: (id: string) => `/cvs/${id}`,
    CREATE: "/cvs",
    UPDATE: (id: string) => `/cvs/${id}`,
    DELETE: (id: string) => `/cvs/${id}`,
    SHARE: (id: string) => `/cvs/${id}/share`,
    TEMPLATES: "/cvTemplates",
  },
  CHAT: {
    GET_CONVERSATION: (convId: string) => `/chat/messages/${convId}`,
  },
  JOB: {
    GET_ALL: "/jobs",
    GET_BY_ID: (id: string) => `/jobs/${id}`,
    CREATE: "/jobs",
    UPDATE: (id: string) => `/jobs/${id}`,
    DELETE: (id: string) => `/jobs/${id}`,
  },
} as const;
