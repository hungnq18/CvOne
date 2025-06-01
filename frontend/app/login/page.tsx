"use client"

import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
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
    title: "Login",
    emailPlaceholder: "Email or username",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    loginButton: "Sign In",
    noAccount: "Don't have an account?",
    registerLink: "Register now",
    loginSuccess: "Login successful!",
    loginFailed: "Login failed",
    invalidCredentials: "Invalid credentials",
  },
  vi: {
    title: "Đăng nhập",
    emailPlaceholder: "Email hoặc tên đăng nhập",
    password: "Mật khẩu",
    passwordPlaceholder: "Nhập mật khẩu của bạn",
    loginButton: "Đăng nhập",
    noAccount: "Chưa có tài khoản?",
    registerLink: "Đăng ký ngay",
    loginSuccess: "Đăng nhập thành công!",
    loginFailed: "Đăng nhập thất bại",
    invalidCredentials: "Thông tin đăng nhập không chính xác",
  },
};

const LoginWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
`

const LoginContainer = styled.div`
  display: flex;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  overflow: hidden;
  max-width: 800px;
  width: 100%;
  min-height: 440px;
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

const LoginForm = styled.form`
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
`

const EyeIcon = styled.span`
  position: absolute;
  right: 12px;
  top: 36px;
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

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 8px;
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

export default function LoginPage() {
  const [loginInput, setLoginInput] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const { language } = useLanguage()
  const t = translations[language]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      const isEmail = /@gmail\.com$/.test(loginInput)
      const body = isEmail ? { email: loginInput, password } : { username: loginInput, password }
      
      await login(loginInput, password)
      setMessage(t.loginSuccess)
      toast({
        title: t.loginSuccess,
        description: t.loginSuccess,
      })
      setTimeout(() => router.push("/dashboard"), 1000)
    } catch (error) {
      setMessage(t.loginFailed)
      toast({
        title: t.loginFailed,
        description: t.invalidCredentials,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LoginWrapper>
      <LoginContainer>
        <LogoSide>
          <ImageWrapper>
            <Image 
              src={logoImg} 
              alt="Logo" 
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </ImageWrapper>
        </LogoSide>
        <FormSide>
          <LoginForm onSubmit={handleSubmit}>
            <Title>{t.title}</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Label>Email / Username</Label>
              <Input
                type="text"
                id="loginInput"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder={t.emailPlaceholder}
                required
              />
            </div>
            <PasswordWrapper>
              <Label>{t.password}</Label>
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                required
              />
              <EyeIcon onClick={() => setShowPassword(!showPassword)} style={{marginTop: "2.5%"}}>
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </EyeIcon>
            </PasswordWrapper>
            <Message success={message === t.loginSuccess}>{message}</Message>
            <SubmitButton type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                t.loginButton
              )}
            </SubmitButton>
            <RegisterLink>
              <span>{t.noAccount}</span>
              <Link href="/register">{t.registerLink}</Link>
            </RegisterLink>
          </LoginForm>
        </FormSide>
      </LoginContainer>
    </LoginWrapper>
  )
}
