"use client"

import Image from "next/image"
import Link from "next/link"
import React from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import styled from "styled-components"
import logoImg from "../../public/logo/logoCVOne.svg"
import { useLoginForm } from "@/components/forms/use-login-form"
import { useRouter, useSearchParams } from "next/navigation"


const LoginWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  padding: 20px;
`

const LoginContainer = styled.div`
  display: flex;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  overflow: hidden;
  max-width: 800px;
  width: 100%;
  min-height: 500px;
  margin: 0 auto;
`

const LogoSide = styled.div`
  background: linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(109, 193, 235) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  max-width: 400px;
  padding: 40px;

  @media (max-width: 768px) {
    display: none;
  }
`

const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  max-width: 300px;
  max-height: 300px;
  position: relative;
  margin: auto;
`

const FormSide = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px;
  min-width: 320px;

  @media (max-width: 768px) {
    padding: 20px;
    width: 100%;
  }
`

const LoginForm = styled.form`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const Title = styled.h2`
  text-align: center;
  margin-bottom: 8px;
  font-size: 32px;
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

  &:focus {
    border-color: #058ac3;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
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
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(46,204,64,0.15);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 14px;
  margin-top: 4px;
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

const GoogleButton = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #d0d7de;
  background: white;
  color: #24292f;
  font-weight: 500;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f6f8fa;
    border-color: #babfc4;
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #d0d7de;
  }

  span {
    margin: 0 10px;
    color: #57606a;
    font-size: 14px;
    font-weight: 500;
  }
`

export default function LoginPage() {
  const {
    formData,
    showPassword,
    error,
    isLoading,
    t,
    handleInputChange,
    handleSubmit,
    handleGoogleLogin,
    setShowPassword
  } = useLoginForm(["user", "hr"])
  const router = useRouter()
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleLogin = async (role: string) => {
    try {
      if (role === "admin") {
        window.location.href = "/admin"
      } else if (role === "hr") {
        window.location.href = "/hr/dashboard"
      } else {
        router.push(callbackUrl);
      }

    } catch (error) {
      console.error("Login failed", error)
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
              style={{ objectFit: "contain" }}
              priority
            />
          </ImageWrapper>
        </LogoSide>
        <FormSide>
          <LoginForm onSubmit={handleSubmit}>
            <Title>{t.title}</Title>

            <div>
              <Label>{t.email}</Label>
              <Input
                type="text"
                id="email"
                placeholder={t.emailPlaceholder}
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                style={{ backgroundColor: "#f5f5f5" }}
              />
            </div>

            <PasswordWrapper>
              <Label>{t.password}</Label>
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder={t.passwordPlaceholder}
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                style={{ backgroundColor: "#f5f5f5" }}
              />
              <EyeIcon onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </EyeIcon>
            </PasswordWrapper>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <SubmitButton type="submit" disabled={isLoading}>
              {isLoading ? t.loading : t.loginButton}
            </SubmitButton>



            <RegisterLink>
              <span>{t.noAccount}</span>
              <Link href="/register">{t.registerLink}</Link>
            </RegisterLink>
            <RegisterLink>
              <span>{t.noHrAccount}</span>
              <Link href="/hr-register">{t.registerLink}</Link>
            </RegisterLink>
            <RegisterLink>
              <Link href="/fogetPassword">{t.fogetPassword}</Link>
            </RegisterLink>
            {/* <Divider>
              <span>{t.or}</span>
            </Divider>

            <GoogleButton
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              style={{ marginTop: -20 }}
            >
              <FcGoogle size={20} />
              {t.googleButton}
            </GoogleButton> */}

          </LoginForm>
        </FormSide>
      </LoginContainer>
    </LoginWrapper>
  )
}
