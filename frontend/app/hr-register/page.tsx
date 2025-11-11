"use client";

import { useRegisterForm } from "@/components/forms/use-register-form";
import Image from "next/image";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styled from "styled-components";
import logoImg from "../../public/logo/logoCVOne.svg";

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
  /* max-width: 350px; */
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
`

const Title = styled.h2`
  text-align:  center;
  margin-bottom: 8px;
  color: #212529;
  /* letter-spacing: 1px; */
  font-size: 20px;
  font-weight: 700;
`
const SubTitle = styled.p`
  color: #7a7a7a;
  font-size: 14px;
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
const GenderWrapper = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`

const GenderOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`
const LocationWrapper = styled.div`
  display: flex;
  gap: 16px;
`

const LocationField = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`
const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
`

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
`
const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #555;
  a {
    color: #007bff;
    text-decoration: none;
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
  } = useRegisterForm("hr")

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
            <Title>{t.loginInfoTitle}</Title>
            {!isSuccess && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Label>{t.emailLabel}</Label>
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
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Label>{t.passwordLabel}</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t.passwordPlaceholder}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Label>{t.confirmPasswordLabel}</Label>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t.confirmPasswordPlaceholder}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                </div>

                <Title>{t.recruiterInfoTitle}</Title>

                <LocationWrapper>
                  <LocationField>
                    <Label>{t.lastNameLabel}</Label>
                    <Input
                      id="last_name"
                      type="text"
                      placeholder={t.lastNamePlaceholder}
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      style={{ backgroundColor: "#f5f5f5" }}
                    />
                  </LocationField>
                  <LocationField>
                    <Label>{t.firstNameLabel}</Label>
                    <Input
                      id="first_name"
                      type="text"
                      placeholder={t.firstNamePlaceholder}
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      style={{ backgroundColor: "#f5f5f5" }}
                    />
                  </LocationField>
                </LocationWrapper>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Label>{t.phoneLabel}</Label>
                  <Input
                    id="phone_number"
                    type="text"
                    placeholder={t.phonePlaceholder}
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    required
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Label>{t.companyLabel}</Label>
                  <Input
                    id="company_name"
                    type="text"
                    placeholder={t.companyPlaceholder}
                    value={formData.company_name}
                    onChange={handleInputChange}
                    required
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                </div>
                <LocationWrapper>
                  <LocationField>
                    <Label>{t.workLocationLabel}</Label>
                    <select id="city" name="city" style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #d0d7de', backgroundColor: "#f5f5f5" }} value={formData.city} onChange={handleInputChange}>
                      <option value="">{t.cityPlaceholder}</option>
                      {/* Add city options here */}
                    </select>
                  </LocationField>
                  <LocationField>
                    <Label>{t.districtLabel}</Label>
                    <select id="district" name="district" style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #d0d7de', backgroundColor: "#f5f5f5" }} value={formData.district} onChange={handleInputChange}>
                      <option value="">{t.districtPlaceholder}</option>
                       {/* Add district options here */}
                    </select>
                  </LocationField>
                </LocationWrapper>
                <CheckboxWrapper>
                  <Checkbox type="checkbox" id="terms" required checked={formData.terms} onChange={handleInputChange} />
                  <CheckboxLabel htmlFor="terms">
                  {t.terms} <a href="#">{t.termsLink}</a> {t.and} <a href="#">{t.privacyLink}</a> {t.of}
                  </CheckboxLabel>
                </CheckboxWrapper>
                <SubmitButton type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : (
                    t.submitButton
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