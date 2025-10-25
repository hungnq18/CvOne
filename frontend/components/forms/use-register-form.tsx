"use client"

import { verifyEmail } from "@/api/authApi"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/providers/auth-provider"
import { useLanguage } from "@/providers/global_provider"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface RegisterFormData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirmPassword: string;
}

const translations = {
  en: {
    title: "Create Account",
    subtitle: "Sign up to get started",
    firstName: "First Name",
    firstNamePlaceholder: "Enter your first name",
    lastName: "Last Name",
    lastNamePlaceholder: "Enter your last name",
    email: "Email",
    emailPlaceholder: "Enter your email",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm your password",
    phone: "Phone Number (optional)",
    phonePlaceholder: "Enter your phone number",
    address: "Address (optional)",
    addressPlaceholder: "Enter your address",
    registerButton: "Create Account",
    haveAccount: "Already have an account?",
    loginLink: "Sign in",
    requiredFields: "Please fill in all required fields!",
    invalidEmail: "Please enter a valid email address!",
    invalidPhone: "Phone number must be 10 digits and start with 0!",
    passwordMismatch: "Passwords do not match!",
    registerSuccess: "Registration successful!",
    registerFailed: "Registration failed",
    checkEmail: "Please check your email for verification",
    emailSent: "Verification email sent!",
    emailSentDesc: "We've sent a verification link to your email. Please check your inbox and spam folder.",
    emailError: "Failed to send verification email",
    emailErrorDesc: "There was a problem sending the verification email. Please try again.",
  },
  vi: {
    title: "Tạo tài khoản",
    subtitle: "Đăng ký để bắt đầu",
    firstName: "Tên",
    firstNamePlaceholder: "Nhập tên của bạn",
    lastName: "Họ",
    lastNamePlaceholder: "Nhập họ của bạn",
    email: "Email",
    emailPlaceholder: "Nhập email của bạn",
    password: "Mật khẩu",
    passwordPlaceholder: "Nhập mật khẩu của bạn",
    confirmPassword: "Xác nhận mật khẩu",
    confirmPasswordPlaceholder: "Xác nhận mật khẩu của bạn",
    phone: "Số điện thoại (không bắt buộc)",
    phonePlaceholder: "Nhập số điện thoại của bạn",
    address: "Địa chỉ (không bắt buộc)",
    addressPlaceholder: "Nhập địa chỉ của bạn",
    registerButton: "Tạo tài khoản",
    haveAccount: "Đã có tài khoản?",
    loginLink: "Đăng nhập",
    requiredFields: "Vui lòng nhập đầy đủ thông tin bắt buộc!",
    invalidEmail: "Vui lòng nhập địa chỉ email hợp lệ!",
    invalidPhone: "Số điện thoại phải có 10 số và bắt đầu bằng số 0!",
    passwordMismatch: "Mật khẩu xác nhận không khớp!",
    registerSuccess: "Đăng ký thành công!",
    registerFailed: "Đăng ký thất bại",
    checkEmail: "Vui lòng kiểm tra email của bạn để xác nhận",
    emailSent: "Đã gửi email xác thực!",
    emailSentDesc: "Chúng tôi đã gửi link xác thực đến email của bạn. Vui lòng kiểm tra hộp thư đến và thư rác.",
    emailError: "Không thể gửi email xác thực",
    emailErrorDesc: "Có lỗi khi gửi email xác thực. Vui lòng thử lại.",
  },
};

export function useRegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [message, setMessage] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const { toast } = useToast()
  const router = useRouter()
  const { language } = useLanguage()
  const { register } = useAuth()
  const t = translations[language]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    setIsSuccess(false)

    const { email, first_name, last_name, password, confirmPassword } = formData

    if (!email || !first_name || !last_name || !password || !confirmPassword) {
      setMessage(t.requiredFields)
      setIsLoading(false)
      return
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setMessage(t.invalidEmail)
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setMessage(t.passwordMismatch)
      setIsLoading(false)
      return
    }

    try {
      await register(first_name, email, password, last_name)
      try {
        await verifyEmail(email)
      } catch (err) {
      }
    } catch (error) {
      console.error("Registration error:", error)
      setMessage(error instanceof Error ? error.message : t.registerFailed)
    } finally {
      setIsLoading(false)
      router.push("verify-email")
    }
  }

  return {
    formData,
    showPassword,
    showConfirmPassword,
    message,
    isLoading,
    isSuccess,
    t,
    handleInputChange,
    handleRegister,
    setShowPassword,
    setShowConfirmPassword
  }
} 