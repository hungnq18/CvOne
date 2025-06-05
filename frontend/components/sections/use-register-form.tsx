"use client"

import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/providers/global-provider"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface RegisterFormData {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  address?: string;
}

const translations = {
  en: {
    title: "Create Account",
    subtitle: "Sign up to get started",
    fullName: "Full Name",
    fullNamePlaceholder: "Enter your full name",
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
  },
  vi: {
    title: "Tạo tài khoản",
    subtitle: "Đăng ký để bắt đầu",
    fullName: "Họ và tên",
    fullNamePlaceholder: "Nhập họ và tên của bạn",
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
  },
};

export function useRegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  })
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [message, setMessage] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { toast } = useToast()
  const router = useRouter()
  const { language } = useLanguage()
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

    const { email, fullName, password, confirmPassword, phone, address } = formData

    if (!email || !fullName || !password || !confirmPassword) {
      setMessage(t.requiredFields)
      setIsLoading(false)
      return
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setMessage(t.invalidEmail)
      setIsLoading(false)
      return
    }

    if (phone && !/^0\d{9}$/.test(phone)) {
      setMessage(t.invalidPhone)
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setMessage(t.passwordMismatch)
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fullName,
          password,
          phone,
          address,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage(t.registerSuccess)
        toast({
          title: t.registerSuccess,
          description: t.registerSuccess,
        })
        setTimeout(() => router.push("/login"), 1000)
      } else {
        setMessage(data.message || t.registerFailed)
        toast({
          title: t.registerFailed,
          description: data.message || t.registerFailed,
          variant: "destructive",
        })
      }
    } catch (error) {
      setMessage("Lỗi kết nối server")
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    formData,
    showPassword,
    showConfirmPassword,
    message,
    isLoading,
    t,
    handleInputChange,
    handleRegister,
    setShowPassword,
    setShowConfirmPassword
  }
} 