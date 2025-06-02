"use client"

import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/providers/global-provider"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import styled from "styled-components"
import logoImg from "../../public/logo/logoCVOne.svg"

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
    invalidEmail: "Email must be a valid @gmail.com address!",
    invalidPhone: "Phone number must be 9 digits and start with 0!",
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
    invalidEmail: "Email phải là địa chỉ @gmail.com hợp lệ!",
    invalidPhone: "Số điện thoại phải có 9 số và bắt đầu bằng số 0!",
    passwordMismatch: "Mật khẩu xác nhận không khớp!",
    registerSuccess: "Đăng ký thành công!",
    registerFailed: "Đăng ký thất bại",
  },
};

const RegisterWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  margin-top: 90px;
  padding: 50px 0;
`

const RegisterContainer = styled.div`
  display: flex;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  overflow: hidden;
  max-width: 900px;
  width: 100%;
  min-height: 500px;
`

const LogoSide = styled.div`
  background: linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(109, 193, 235) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 340px;
  min-width: 220px;
  padding: 32px 16px;
  @media (max-width: 700px) {
    display: none;
  }
`

const ImageWrapper = styled.div`
  width: 300px;
  height: 300px;
  position: relative;
`

const FormSide = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px 32px;
  @media (max-width: 700px) {
    width: 100%;
    padding: 32px 12px;
  }
`

const RegisterForm = styled.form`
  width: 100%;
  max-width: 350px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
`

const Title = styled.h2`
  text-align: center;
  margin-bottom: 8px;
  color: #058ac3;
  letter-spacing: 1px;
`

const Label = styled.label`
  font-weight: 500;
  color: #222;
`

const Input = styled.input`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #d0d7de;
  font-size: 16px;
  outline: none;
  transition: border 0.2s;
  width: 100%;
`

const PasswordWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
`

const EyeIcon = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #888;
`

const SubmitButton = styled.button`
  margin-top: 8px;
  padding: 12px 0;
  border-radius: 8px;
  border: none;
  background: linear-gradient(90deg,rgb(75, 195, 246) 0%,rgb(17, 135, 195) 100%);
  color: #fff;
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 1px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(46,204,64,0.10);
  transition: background 0.2s;
`

const Message = styled.div<{ success?: boolean }>`
  color: ${({ success }) => (success ? '#0681be' : 'red')};
  min-height: 24px;
  text-align: center;
  font-weight: 500;
`

const LoginPrompt = styled.div`
  text-align: center;
  margin-top: 16px;
  span {
    color: #222;
  }
  a {
    color: #058ac3;
    font-weight: 500;
    text-decoration: underline;
    margin-left: 4px;
  }
`

interface RegisterFormData {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  address?: string;
}

export default function RegisterPage() {
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

    if (!/^\\w+@gmail\\.com$/.test(email)) {
      setMessage(t.invalidEmail)
      setIsLoading(false)
      return
    }

    if (phone && !/^0\\d{8}$/.test(phone)) {
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

  return (
    <RegisterWrapper>
      <RegisterContainer>
        <LogoSide>
          <ImageWrapper>
            <Image 
              src={logoImg} 
              alt="Logo" 
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </ImageWrapper>
        </LogoSide>
        <FormSide>
          <RegisterForm onSubmit={handleRegister}>
            <Title>{t.title}</Title>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Label>{t.fullName}</Label>
              <Input
                id="fullName"
                type="text"
                placeholder={t.fullNamePlaceholder}
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Label>{t.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t.emailPlaceholder}
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <PasswordWrapper>
              <Label>{t.password}</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t.passwordPlaceholder}
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <EyeIcon onClick={() => setShowPassword(v => !v)} style={{marginTop: "4%"}}>
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </EyeIcon>
            </PasswordWrapper>
            <PasswordWrapper>
              <Label>{t.confirmPassword}</Label>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t.confirmPasswordPlaceholder}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              <EyeIcon onClick={() => setShowConfirmPassword(v => !v)} style={{marginTop: "4%"}}>
                {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </EyeIcon>
            </PasswordWrapper>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Label>{t.phone}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t.phonePlaceholder}
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Label>{t.address}</Label>
              <Input
                id="address"
                type="text"
                placeholder={t.addressPlaceholder}
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            <Message success={message === t.registerSuccess}>{message}</Message>
            <SubmitButton type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                t.registerButton
              )}
            </SubmitButton>
            <LoginPrompt>
              <span>{t.haveAccount}</span>
              <Link href="/login">{t.loginLink}</Link>
            </LoginPrompt>
          </RegisterForm>
        </FormSide>
      </RegisterContainer>
    </RegisterWrapper>
  )
} 