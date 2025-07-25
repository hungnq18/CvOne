"use client"

import { API_ENDPOINTS, API_URL } from "@/api/apiConfig"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import styled from "styled-components"

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    if (token) {
      router.push(`/verify-email/check?token=${token}`)
    }
  }, [token, router])

  const handleResendVerification = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.ACCOUNTS.RESEND_VERIFICATION}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })

      const data = await response.json()
      if (response.ok) {
        toast.success(data.message)
      } else {
        toast.error(data.message || "Failed to resend verification email")
      }
    } catch (error) {
      toast.error("Failed to resend verification email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <VerifyWrapper>
      <VerifyCard>
        <CardHeaderStyled>
          <CardTitleStyled>Email Verification</CardTitleStyled>
          <CardDescriptionStyled>
            Please verify your email address
          </CardDescriptionStyled>
        </CardHeaderStyled>
        <CardContentStyled>
          <div className="space-y-4">
            <StyledText>
              We've sent you a verification email. Please check your inbox and click the verification link.
            </StyledText>
            <StyledButton 
              onClick={handleResendVerification}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Resend Verification Email"}
            </StyledButton>
          </div>
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
`

const StyledText = styled.p`
  text-align: center;
  color: #1976d2;
  font-size: 1.05rem;
  margin-bottom: 16px;
`

const StyledButton = styled.button`
  width: 100%;
  padding: 12px 0;
  border-radius: 8px;
  border: none;
  background: linear-gradient(90deg, #60a5fa 0%, #1976d2 100%);
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: 1px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(46,204,250,0.10);
  transition: all 0.2s;
  margin-top: 8px;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(46,204,250,0.15);
    background: linear-gradient(90deg, #1976d2 0%, #60a5fa 100%);
  }
  &:disabled {
    background: #b3d1fa;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
` 