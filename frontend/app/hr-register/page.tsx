"use client"

import Image from "next/image"
import Link from "next/link"
import React from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import styled from "styled-components"
import logoImg from "../../public/logo/logoCVOne.svg"
import { useRegisterForm } from "@/components/forms/use-register-form"

const RegisterWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  padding: 100px 0 50px 0;
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

const Message = styled.div<{ $success?: boolean }>`
  color: ${({ $success }) => ($success ? '#0681be' : 'red')};
  min-height: 24px;
  text-align: center;
  font-weight: 500;
  padding: 8px;
  border-radius: 6px;
  background-color: ${({ $success }) => ($success ? 'rgba(6, 129, 190, 0.1)' : 'rgba(255, 0, 0, 0.1)')};
  margin: 8px 0;
`

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #058ac3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
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

export default function RegisterPage() {
  const {
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
  } = useRegisterForm()

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
            {!isSuccess && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Label>{t.firstName}</Label>
                  <Input
                    id="first_name"
                    type="text"
                    placeholder={t.firstNamePlaceholder}
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Label>{t.lastName}</Label>
                  <Input
                    id="last_name"
                    type="text"
                    placeholder={t.lastNamePlaceholder}
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    style={{ backgroundColor: "#f5f5f5" }}
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
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                </div>
                <PasswordWrapper>
                  <Label>{t.password}</Label>
                  <div style={{ position: "relative" }}>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t.passwordPlaceholder}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      style={{ backgroundColor: "#f5f5f5" }}
                    />
                    <EyeIcon onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </EyeIcon>
                  </div>
                </PasswordWrapper>
                <PasswordWrapper>
                  <Label>{t.confirmPassword}</Label>
                  <div style={{ position: "relative" }}>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t.confirmPasswordPlaceholder}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      style={{ backgroundColor: "#f5f5f5" }}
                    />
                    <EyeIcon onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </EyeIcon>
                  </div>
                </PasswordWrapper>
                <SubmitButton type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : (
                    t.registerButton
                  )}
                </SubmitButton>
              </>
            )}
            {message && (
              <Message $success={isSuccess}>{message}</Message>
            )}
          </RegisterForm>
          {!isSuccess && (
            <LoginPrompt>
              <span>{t.haveAccount}</span>
              <Link href="/login">{t.loginLink}</Link>
            </LoginPrompt>
          )}
        </FormSide>
      </RegisterContainer>
    </RegisterWrapper>
  )
}