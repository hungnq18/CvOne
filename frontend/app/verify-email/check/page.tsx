"use client"

import { API_ENDPOINTS, API_URL } from "@/api/apiConfig"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import styled from "styled-components"

export default function CheckEmailPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const verificationAttempted = useRef(false)

  useEffect(() => {
    // Chỉ chạy một lần duy nhất
    if (verificationAttempted.current) return;
    verificationAttempted.current = true;

    const verifyEmail = async () => {
      if (!token) {
        router.push("/verify-email")
        return
      }

      try {
        console.log("Verifying email with token:", token)
        const response = await fetch(`${API_URL}${API_ENDPOINTS.ACCOUNTS.VERIFY_TOKEN(token)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })
        
        const data = await response.json()
        console.log("Verification response:", data)
        
        if (response.ok && data.success) {
          // Token khớp và verify thành công
          setIsVerified(true)
          toast.success("Email verified successfully!")
          // Chuyển về trang login sau 2 giây
          setTimeout(() => {
            router.push("/login")
          }, 2000)
        } else {
          // Token không khớp hoặc đã hết hạn
          toast.error("Invalid or expired verification token")
          // Chuyển về trang resend email
          router.push("/verify-email")
        }
      } catch (err) {
        console.error("Verification failed:", err)
        toast.error("Failed to verify email")
        router.push("/verify-email")
      } finally {
        setIsLoading(false)
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <VerifyWrapper>
      <VerifyCard>
        <CardHeaderStyled>
          <CardTitleStyled>Email Verification</CardTitleStyled>
          <CardDescriptionStyled>
            {isLoading ? "Verifying your email..." : 
             isVerified ? "Email verified successfully!" :
             "Verification failed"}
          </CardDescriptionStyled>
        </CardHeaderStyled>
        <CardContentStyled>
          {isLoading && (
            <LoadingSpinner />
          )}
          {isVerified && !isLoading && (
            <>
              <StyledText $success>
                Your email has been verified successfully!
              </StyledText>
              <StyledText>
                Redirecting to login page...
              </StyledText>
            </>
          )}
          {!isVerified && !isLoading && (
            <StyledText $error>
              Verification failed. Please try again.
            </StyledText>
          )}
        </CardContentStyled>
      </VerifyCard>
    </VerifyWrapper>
  )
}

const VerifyWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
`

const VerifyCard = styled.div`
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  max-width: 400px;
  width: 100%;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const CardHeaderStyled = styled.div`
  margin-bottom: 16px;
  text-align: center;
`

const CardTitleStyled = styled.h2`
  color: #1976d2;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 4px;
  letter-spacing: 1px;
`

const CardDescriptionStyled = styled.p`
  color: #555;
  font-size: 1rem;
  margin-bottom: 0;
`

const CardContentStyled = styled.div`
  width: 100%;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const StyledText = styled.p<{$success?: boolean, $error?: boolean}>`
  text-align: center;
  color: ${({$success, $error}) => $success ? '#1976d2' : $error ? '#dc2626' : '#1976d2'};
  font-size: 1.05rem;
  margin-bottom: 16px;
  font-weight: ${({$success, $error}) => $success ? 600 : $error ? 600 : 400};
`

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 4px solid #e3e8ee;
  border-top: 4px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 24px auto;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
` 