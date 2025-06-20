"use client"

import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/providers/global-provider"
import { useRouter } from "next/navigation"
import { useState } from "react"
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "@/middleware";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
}

const API_URL = "http://localhost:8000/api/auth";

const translations = {
  en: {
    title: "Login",
    email: "Email",
    emailPlaceholder: "Email or username",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    loginButton: "Sign In",
    googleButton: "Sign in with Google",
    noAccount: "Don't have an account?",
    registerLink: "Register now",
    fogetPassword: "Forgot password?",
    loginSuccess: "Login successful!",
    loginFailed: "Login failed",
    invalidCredentials: "Invalid credentials",
    emailRequired: "Email is required",
    passwordRequired: "Password is required",
    loading: "Loading...",
    networkError: "Network error. Please check your connection.",
    or: "OR",
  },
  vi: {
    title: "Đăng nhập",
    email: "Email",
    emailPlaceholder: "Email hoặc tên đăng nhập",
    password: "Mật khẩu",
    passwordPlaceholder: "Nhập mật khẩu của bạn",
    loginButton: "Đăng nhập",
    googleButton: "Đăng nhập với Google",
    noAccount: "Chưa có tài khoản?",
    registerLink: "Đăng ký ngay",
    fogetPassword: "Quên mật khẩu?",
    loginSuccess: "Đăng nhập thành công!",
    loginFailed: "Đăng nhập thất bại",
    invalidCredentials: "Thông tin đăng nhập không chính xác",
    emailRequired: "Email là bắt buộc",
    passwordRequired: "Mật khẩu là bắt buộc",
    loading: "Đang tải...",
    networkError: "Lỗi kết nối. Vui lòng kiểm tra kết nối của bạn.",
    or: "HOẶC",
  },
}

export function useLoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()
  const router = useRouter()
  const { language } = useLanguage()
  const t = translations[language]

  const validateForm = () => {
    if (!formData.email) {
      setError(t.emailRequired)
      return false
    }
    if (!formData.password) {
      setError(t.passwordRequired)
      return false
    }
    return true
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post<LoginResponse>(`${API_URL}/login`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      const { access_token } = response.data;

      // Lưu token vào cookie
      document.cookie = `token=${access_token}; path=/; max-age=3600; SameSite=Lax; Secure`;

      // Decode token để lấy role
      const decoded: DecodedToken = jwtDecode(access_token);

      // Emit custom events để trigger re-render của icon components
      window.dispatchEvent(new CustomEvent('loginSuccess'));
      window.dispatchEvent(new CustomEvent('authChange'));

      toast({
        title: t.loginSuccess,
        description: `Welcome back, ${formData.email}!`,
      });

      if (decoded.role === "admin") {
        router.push("/admin");
      } else if (decoded.role === "user") {
        router.push("/userDashboard");
      } else if (decoded.role === "hr") {
        router.push("/hr");
      } else {
        router.push("/error");
      }

    } catch (err: any) {
      const msg =
        err?.response?.status === 401 ? t.invalidCredentials : t.networkError;
      setError(msg);
      toast({ title: t.loginFailed, description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Placeholder for Google login logic
    console.log("Login with Google")
  }

  return {
    formData,
    showPassword,
    error,
    isLoading,
    t,
    handleInputChange,
    handleSubmit,
    handleGoogleLogin,
    setShowPassword
  }
}