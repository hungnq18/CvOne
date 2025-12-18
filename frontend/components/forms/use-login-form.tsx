"use client";

import { API_ENDPOINTS, API_URL as BASE_API_URL } from "@/api/apiConfig";
import { useToast } from "@/components/ui/use-toast";
import { DecodedToken } from "@/middleware";
import { useAuth } from "@/providers/auth-provider";
import { useLanguage } from "@/providers/global_provider";
import { showErrorToast } from "@/utils/popUpUtils";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
}

const API_BASE = BASE_API_URL ?? "/api";
const LOGIN_URL = `${API_BASE}${API_ENDPOINTS.AUTH.LOGIN}`;

const translations = {
  en: {
    title: "Login",
    email: "Email",
    emailPlaceholder: "Email or username",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    loginButton: "Sign In",
    googleButton: "Sign in with Google",
    facebookButton: "Sign in with Facebook",
    contactPrefix: "Contact ",
    contactSupport: "support",
    contactSuffix: " to register as HR",
    noAccount: "Don't have an account?",
    noHrAccount: "Are you an HR?",
    registerLink: "Register now",
    fogetPassword: "Forgot password?",
    loginSuccess: "Login successful!",
    loginFailed: "Login failed",
    invalidCredentials: "Invalid credentials",
    emailNotVerified:
      "Email not verified. Please check your email and verify your account before logging in.",
    emailRequired: "Email is required",
    passwordRequired: "Password is required",
    invalidEmailFormat: "Please enter a valid email address",
    passwordTooShort: "Password must be at least 6 characters",
    loading: "Loading...",
    networkError: "Network error. Please check your connection.",
    or: "OR LOGIN WITH",
    unauthorizedRole: "Your account is not authorized to access this page.",
    employerLink: "Employer",
  },
  vi: {
    title: "Đăng nhập",
    email: "Email",
    emailPlaceholder: "Email hoặc tên đăng nhập",
    password: "Mật khẩu",
    passwordPlaceholder: "Nhập mật khẩu của bạn",
    loginButton: "Đăng nhập",
    googleButton: "Đăng nhập với Google",
    facebookButton: "Đăng nhập với Facebook",
    contactPrefix: "Liên hệ ",
    contactSupport: "chăm sóc khách hàng",
    contactSuffix: " để đăng kí HR",
    noAccount: "Chưa có tài khoản?",
    noHrAccount: "Bạn là nhà tuyển dụng?",
    registerLink: "Đăng ký ngay",
    fogetPassword: "Quên mật khẩu?",
    loginSuccess: "Đăng nhập thành công!",
    loginFailed: "Đăng nhập thất bại",
    invalidCredentials: "Thông tin đăng nhập không chính xác",
    emailNotVerified:
      "Email chưa được xác thực. Vui lòng kiểm tra email và xác thực tài khoản trước khi đăng nhập.",
    emailRequired: "Email là bắt buộc",
    passwordRequired: "Mật khẩu là bắt buộc",
    invalidEmailFormat: "Vui lòng nhập địa chỉ email hợp lệ",
    passwordTooShort: "Mật khẩu phải có ít nhất 6 ký tự",
    loading: "Đang tải...",
    networkError: "Lỗi kết nối. Vui lòng kiểm tra kết nối của bạn.",
    or: "HOẶC ĐĂNG NHẬP BẰNG",
    unauthorizedRole: "Tài khoản của bạn không có quyền truy cập trang này.",
    employerLink: "Nhà tuyển dụng",
  },
};

export function useLoginForm(allowedRoles?: string[]) {
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];

  const validateForm = () => {
    if (!formData.email) {
      setError(t.emailRequired);
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError(t.invalidEmailFormat || "Email không hợp lệ");
      return false;
    }
    
    if (!formData.password) {
      setError(t.passwordRequired);
      return false;
    }
    
    // Validate password length (minimum 6 characters)
    if (formData.password.length < 6) {
      setError(t.passwordTooShort || "Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post<LoginResponse>(LOGIN_URL, formData, {
        headers: { "Content-Type": "application/json" },
      });

      const { access_token } = response.data;

      const decoded: DecodedToken = jwtDecode(access_token);

      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        throw new Error("UNAUTHORIZED_ROLE");
      }

      document.cookie = `token=${access_token}; path=/; max-age=3600; SameSite=Lax; Secure`;

      const params = new URLSearchParams(window.location.search);
      const callbackUrl = params.get("callbackUrl");
      if (callbackUrl) {
        router.replace(callbackUrl);
      } else if (decoded.role === "admin") {
        router.replace("/admin");
      } else if (decoded.role === "mkt") {
        router.replace("/marketing");
      } else if (decoded.role === "hr") {
        router.replace("/hr/dashboard");
      } else {
        router.replace("/");
      }
      await refreshUser();

      window.dispatchEvent(new CustomEvent("loginSuccess"));
      window.dispatchEvent(new CustomEvent("authChange"));

      toast({
        title: t.loginSuccess,
        description: `Welcome back, ${formData.email}!`,
      });
    } catch (err: any) {
      let msg = t.networkError;

      if (err.message === "UNAUTHORIZED_ROLE") {
        // Use showErrorToast for unauthorized role
        showErrorToast(t.loginFailed, t.unauthorizedRole);
        setIsLoading(false);
        return; // Don't set error state to avoid red text in form
      } else if (err?.response?.status === 401) {
        // Check if it's email verification error
        const errorMessage = err?.response?.data?.message || "";
        const isUnverified =
          errorMessage.includes("Email not verified") ||
          errorMessage.includes("Email chưa được xác thực");

        if (isUnverified) {
          msg = t.emailNotVerified;
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        } else {
          msg = t.invalidCredentials;
        }
      }

      setError(msg);
      toast({ title: t.loginFailed, description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Placeholder for Google login logic
    console.log("Login with Google");
  };

  const handleFacebookLogin = () => {
    // Placeholder for Facebook login logic
    console.log("Login with Facebook");
  };

  return {
    formData,
    showPassword,
    error,
    isLoading,
    t,
    handleInputChange,
    handleSubmit,
    handleGoogleLogin,
    handleFacebookLogin,
    setShowPassword,
  };
}
