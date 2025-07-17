"use client"

import Image from "next/image"
import React from "react"
import styled from "styled-components"
import logoImg from "../../public/logo/logoCVOne.svg"
import { useVerifyEmail } from "@/components/sections/use-verify-email"

const VerifyWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  margin-top: 90px;
  padding: 50px 0;
`

const VerifyContainer = styled.div`
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
  align-items: center;
  padding: 40px 32px;
  text-align: center;
  @media (max-width: 700px) {
    width: 100%;
    padding: 32px 12px;
  }
`

const Title = styled.h2`
  text-align: center;
  margin-bottom: 8px;
  color: #058ac3;
  letter-spacing: 1px;
`

const Message = styled.div<{ $success?: boolean }>`
  color: ${({ $success }) => ($success ? '#0681be' : 'red')};
  margin: 16px 0;
  text-align: center;
  font-weight: 500;
`

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #058ac3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 20px 0;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

export default function VerifyPage() {
  const { isLoading, isSuccess, message } = useVerifyEmail()

  return (
    <VerifyWrapper>
      <VerifyContainer>
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
          <Title>Email Verification</Title>
          {isLoading && (
            <>
              <LoadingSpinner />
              <Message>Verifying your email...</Message>
            </>
          )}
          {!isLoading && (
            <Message $success={isSuccess}>{message}</Message>
          )}
        </FormSide>
      </VerifyContainer>
    </VerifyWrapper>
  )
} 