"use client"

import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/providers/global-provider"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface LoginFormData {
  email: string;
  password: string;
}

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
    e.preventDefault()
    if (!validateForm()) return

    // Placeholder for login logic
    console.log("Login with:", formData)
  }

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