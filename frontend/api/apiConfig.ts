export const API_URL = "http://localhost:8000/api";
// export const API_URL = "http://localhost:3001";


// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
    CHANGE_PASSWORD: "/auth/change-password",
    CREATE: "/cover-letters"
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
  CL: {
    TEMPLATES: "/cl-templates",
    TEMPLATE_BY_ID: (id: string) => `/cl-templates/${id}`,
    GET_BY_ID: (id: string) => `/cover-letters/${id}`,
    GET_ALL: "/cover-letters",
    CREATE: "/cover-letters",
    UPDATE: (id: string) => `/cover-letters/${id}`,
    DELETE: (id: string) => `/cover-letters/${id}`,
  },
  CHAT: {
    GET_MESSAGES: (convId: string) => `/chat/messages/${convId}`,
    GET_CONVERSATION_DETAIL: (convId: string) =>
      `/chat/conversation-detail/${convId}`,
    GET_CONVERSATIONS: "/conversations",
    CREATE_CONVERSATION: "/conversations",
    SEND_MESSAGE: "/chat/messages",
  },
  JOB: {
    GET_ALL: "/jobs",
    GET_BY_ID: (id: string) => `/jobs/${id}`,
    CREATE: "/jobs",
    UPDATE: (id: string) => `/jobs/${id}`,
    DELETE: (id: string) => `/jobs/${id}`,
  },
  NOTIFICATION: {
    GET_NOTIFICATIONS: "/notifications",
  },
} as const;
