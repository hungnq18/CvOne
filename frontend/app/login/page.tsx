"use client"

import Image from "next/image"
import Link from "next/link"
import React from "react"
import { FaEye, FaEyeSlash, FaFacebook } from "react-icons/fa"
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
  margin-top: 40px;
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
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  border: 2px solid rgb(51, 131, 236);
  background: linear-gradient(135deg,rgb(58, 137, 241) 0%,rgb(56, 123, 211) 100%);
  color: white;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(24, 119, 242, 0.35);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    background: linear-gradient(135deg,rgb(30, 111, 217) 0%,rgb(23, 91, 187) 100%);
    box-shadow: 0 6px 25px rgba(24, 119, 242, 0.5);
    transform: translateY(-3px);
  }

  &:active {
    transform: translateY(-1px);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    border-color: #ccc;
    transform: none;
    box-shadow: none;
    
    &::before {
      display: none;
    }
  }

  svg {
    position: relative;
    z-index: 1;
  }

  span {
    position: relative;
    z-index: 1;
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
    color: #666;
    font-size: 15px;
  }
  a {
    color: #058ac3;
    font-weight: 500;
    text-decoration: none;
    margin-left: 4px;
    transition: all 0.2s;
    
    &:hover {
      text-decoration: underline;
    }
  }
`

const LinksContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  flex-wrap: wrap;
`

const StyledLink = styled(Link)`
  color: #058ac3;
  font-weight: 500;
  font-size: 14px;
  text-decoration: none;
  padding: 8px 20px;
  border-radius: 10px;
  transition: all 0.3s ease;
  background: white;
  border: 2px solid #058ac3;

  &:hover {
    background: #058ac3;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(5, 138, 195, 0.3);
  }
`

const Separator = styled.span`
  color: #d0d7de;
  font-weight: 300;
  font-size: 14px;
`

const SocialButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
`

const GoogleButton = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  border: 2px solid #e8e8e8;
  background: white;
  color: #5f6368;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(66, 133, 244, 0.1);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:hover::before {
    width: 300px;
    height: 300px;
  }

  &:hover {
    border-color: #4285f4;
    box-shadow: 0 6px 20px rgba(66, 133, 244, 0.25);
    transform: translateY(-3px);
  }

  &:active {
    transform: translateY(-1px);
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    
    &::before {
      display: none;
    }
  }

  svg {
    position: relative;
    z-index: 1;
  }

  span {
    position: relative;
    z-index: 1;
  }
`

const FacebookButton = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  border: 2px solid #1877f2;
  background: linear-gradient(135deg, #1877f2 0%, #0c65d8 100%);
  color: white;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(24, 119, 242, 0.35);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    background: linear-gradient(135deg, #0c65d8 0%, #0952b8 100%);
    box-shadow: 0 6px 25px rgba(24, 119, 242, 0.5);
    transform: translateY(-3px);
  }

  &:active {
    transform: translateY(-1px);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    border-color: #ccc;
    transform: none;
    box-shadow: none;
    
    &::before {
      display: none;
    }
  }

  svg {
    position: relative;
    z-index: 1;
  }

  span {
    position: relative;
    z-index: 1;
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
    handleFacebookLogin,
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

            <LinksContainer>
              <StyledLink href="/hr-register">Nhà tuyển dụng</StyledLink>
              <Separator>|</Separator>
              <StyledLink href="/fogetPassword">Quên mật khẩu</StyledLink>
            </LinksContainer>
            
            <Divider>
              <span>{t.or}</span>
            </Divider>

            <SocialButtonsContainer>
              <GoogleButton
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <FcGoogle size={24} />
                <span>Google</span>
              </GoogleButton>

              <FacebookButton
                type="button"
                onClick={handleFacebookLogin}
                disabled={isLoading}
              >
                <FaFacebook size={24} />
                <span>Facebook</span>
              </FacebookButton>
            </SocialButtonsContainer>

          </LoginForm>
        </FormSide>
      </LoginContainer>
    </LoginWrapper>
  )
}