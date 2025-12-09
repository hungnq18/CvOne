// export const API_URL = "http://localhost:8000/api";

export const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/accounts/register",
    REGISTER_HR: "/accounts/register-hr", // api đăng ký hr kiểm tra kĩ các trường nhé t có thêm trường mã số thuế
    REGISTER_BY_ADMIN: "/accounts/register-by-admin",
    UPDATE_ROLE: (id: string) => `/accounts/${id}/role`,
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/profile",
    CHANGE_PASSWORD: "/auth/change-password",
    VERIFY_EMAIL_REQUEST: "/accounts/verify-email/request",
    VERIFY_EMAIL: "/accounts/verify-email",
    CREATE: "/cover-letters",
    FORGOT_PASSWORD: "/auth/forgot-password",
  },
  ACCOUNTS: {
    VERIFY_EMAIL: "/accounts/verify-email",
    RESEND_VERIFICATION: "/accounts/resend-verification",
    VERIFY_TOKEN: (token: string) => `/accounts/verify-email/${token}`,
    CHECK_TOKEN: (token: string) => `/accounts/check-token/${token}`,
    Reset_Pass_With_Code: "/accounts/reset-password-code", //hàm nhận vào gmail, code, mật khẩu mới để cài lại mật khẩu
    Sent_Fogot_Password_Code: "/accounts/forgot-password-code", // hàm nhận vào gmail để gửi code
    UPDATE_ACTIVE_HR: (id: string) => `/accounts/${id}/hr-active`,
  },
  USER: {
    GET_ALL: "/users",
    GET_BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    GET_PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/profile",
    GET_HR_UNACTIVE: "/users/hr/unactive",
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
    UNSHARE: (id: string) => `/cv/${id}/unshare`,
    SAVE: (id: string) => `/cv/${id}/save`,
    UNSAVE: (id: string) => `/cv/${id}/unsave`,
    GET_SAVED: "/cv/saved",
    TEMPLATES: "/cv/templates",
    SUGGEST_TEMPLATE: "/cv-templates/suggest",
    ANALYZE_JD: "/cv/analyze-jd",
    GENERATE_WITH_AI: "/cv/generate-with-ai",
    GENERATE_AND_SAVE: "/cv/generate-and-save",
    SUGGEST_SUMMARY: "/cv/suggest/summary",
    SUGGEST_SKILLS: "/cv/suggest/skills",
    SUGGEST_WORK_EXPERIENCE: "/cv/suggest/work-experience",
    REWRITE_WORK_DESCRIPTION: "/cv/rewrite-work-description",
    UPLOAD_AND_ANALYZE: "/cv/upload-and-analyze",
    UPLOAD_ANALYZE_GENERATE_PDF: "/cv/upload-analyze-generate-pdf",
    AI_STATUS: "/cv/ai-status",
    GET_CV_SHARE_BY_ID: "/cv/:id/share", // api lấy cv không cần đăng nhập
    GENERATE_SHARE_LINK: "/cv/:id/generate-share-link", // api để tạo link share cv. nhận vào id cv
    TRANSLATE_CV: "/cv/translate", //nhận vào json cv và target language trả về json cv đã được translate
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
    GENERATE_CL_BY_AI: "/cover-letters/generate/ai",
    EXTRACT_AI: "/cover-letters/extract/ai",
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
    ANALYZE_JD_PDF: "/jobs/analyze-jd-pdf",
    GET_PENDING_FOR_ADMIN: "/jobs/pending/admin",
    APPROVE_BY_ADMIN: (id: string) => `/jobs/${id}/approve`,
  },
  NOTIFICATION: {
    GET_NOTIFICATIONS: "/notifications",
    MARK_ALL_AS_READ: "/notifications/read-all",
    MARK_AS_READ: (id: string) => `/notifications/read/${id}`,
    DELETE_NOTIFICATION: (id: string) => `/notifications/${id}`,
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
    DELETE_APPLY_JOB_BY_HR: (id: string) => `/apply-job/${id}`,
    COUNT_BY_STATUS: (status: string) =>
      `/apply-job/count-apply-job-by-status/${status}`,
  },
  SAVED_JOB: {
    GET_SAVE_JOB: "/saved-jobs",
    SAVE_JOB: (jobId: string) => `/saved-jobs/${jobId}`,
    UN_SAVE_JOB: (jobId: string) => `/saved-jobs/${jobId}`,
  },
  UPLOAD: {
    UPLOAD_FILE: "/upload",
  },
  MAIL: {
    SHARE_CV: "/mail/send-cv-pdf", // api nhận vào email, base64 pdf, cvTitle để gửi pdf có sẵn qua mail
  },
  VOUCHER: {
    GET_FOR_USER: "/credits/vouchers/for-user",
    GET_FOR_MKT: "/vouchers/all",
    GET_BY_ID: (id: string) => `/vouchers/${id}`,
    POST_VOUCHER_DIRECT: "/vouchers/direct", // BODY:{name,description,type,discountValue,discountType,maxDiscountValue,minOrderValue,usageLimit,perUserLimit,startDate,endDate}
    POST_VOUCHER_SAVEABLE: "/vouchers/saveable", // BODY:{name,description,type,discountValue,discountType,maxDiscountValue,minOrderValue,usageLimit,perUserLimit,startDate,endDate}
    UPDATE_DIRECT: (id: string) => `/vouchers/${id}/direct`, //PUT
    UPDATE_SAVEABLE: (id: string) => `/vouchers/${id}/saveable`, //PUT

    DELETE: (id: string) => `/vouchers/${id}`,
  },
  ORDER: {
    CREATE_ORDER: "/orders", //BODY:{voucherId,totalToken,price,paymentMethod}
    UPDATE_ORDER_STATUS: (id: string) => `/orders/${id}/update`, //BODY:{status}
    GET_ORDER_BY_CODE: (orderCode: string) => `/orders/code/${orderCode}`,
    GET_ORDER_HISTORY: "/orders/history", //lấy ra lịch sử order của user
    GET_ORDER_HISTORY_ADMIN: "/orders/admin/history", //lấy ra toàn bộ order cho admin
  },
  CREDIT: {
    UPDATE_TOKEN: "/credits/update-token", //BODY:{token} @PATCH
    UPDATE_VOUCHER: (voucherId: string) => `/credits/save-voucher/${voucherId}`, // @PATCH
    GET_CREDIT: "/credits",
  },
  FEEDBACK: {
    GET_ALL: "/feedback",
    GET_BY_FEATURE: (feature: string) => `/feedback/feature/${feature}`,
  },
  BANNER: {
    GET_ALL: "/banner",
    CREATE: "/banner",
    UPDATE: (id: string) => `/banner/${id}`,
    DELETE: (id: string) => `/banner/${id}`,
    FOR_USER: "/banner/for-user",
  },
  AVERAGE_AI: {
    GET_ALL_AVERAGE: "/ai-average/average-stats",
    RESET_AVERAGE: "/ai-average/reset",
  },
} as const;
