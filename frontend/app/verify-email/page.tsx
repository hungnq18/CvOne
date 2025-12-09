"use client"

import { API_ENDPOINTS, API_URL } from "@/api/apiConfig"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import styled from "styled-components"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const prefilledEmail = searchParams.get("email") || ""
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState(prefilledEmail) // Lưu email đã truyền từ đăng ký
  const router = useRouter()
  const token = searchParams.get("token")

  // Logic kiểm tra token trên URL để chuyển sang trang check (Giữ nguyên)
  useEffect(() => {
    if (token) {
      router.push(`/verify-email/check?token=${token}`)
    }
  }, [token, router])

  const handleResendVerification = async () => {
    // Validate: Bắt buộc phải có email
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.ACCOUNTS.RESEND_VERIFICATION}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        // Gửi kèm email trong body
        body: JSON.stringify({ email: email }) 
      })

      const data = await response.json()
      const message = data.message ? String(data.message).toLowerCase() : "";

      // Kiểm tra các từ khóa báo hiệu email đã tồn tại/đã xác thực
      const isAlreadyVerified = message.includes("exist") || message.includes("already") || message.includes("verified");

      if (isAlreadyVerified) {
        // YÊU CẦU CỦA BẠN: Chỉ hiện thông báo, KHÔNG NAVIGATE (không chuyển trang)
        toast.info("Email này đã được xác thực rồi. Bạn có thể đăng nhập.")
        // Không gọi router.push() ở đây
        setIsLoading(false)
        return
      }

      if (response.ok) {
        toast.success(data.message || "Verification email sent!")
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
            Enter your email to resend verification link
          </CardDescriptionStyled>
        </CardHeaderStyled>
        <CardContentStyled>
          <div className="space-y-4">
            <StyledText>
               We need your email address to resend the verification link.
            </StyledText>
            
            {/* Thêm ô Input nhập Email */}
            <StyledInput
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                // Nếu có email truyền sang từ register thì khóa không cho sửa
                if (prefilledEmail) return
                setEmail(e.target.value)
              }}
              disabled={isLoading || !!prefilledEmail}
              readOnly={!!prefilledEmail}
            />

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

// --- STYLED COMPONENTS ---

const VerifyWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  background-color: #f9fafb; /* Thêm màu nền nhẹ cho dễ nhìn */
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
  margin-bottom: 24px;
  text-align: center;
`

const CardTitleStyled = styled.h2`
  color: #1976d2;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
`

const CardDescriptionStyled = styled.p`
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 0;
`

const CardContentStyled = styled.div`
  width: 100%;
`

const StyledText = styled.p`
  text-align: center;
  color: #4b5563;
  font-size: 1rem;
  margin-bottom: 20px;
  line-height: 1.5;
`

// Component Input mới thêm vào
const StyledInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
  background-color: #f9fafb;

  &:focus {
    border-color: #1976d2;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
  }
`

const StyledButton = styled.button`
  width: 100%;
  padding: 12px 0;
  border-radius: 8px;
  border: none;
  background: linear-gradient(90deg, #60a5fa 0%, #1976d2 100%);
  color: #fff;
  font-weight: 600;
  font-size: 1.05rem;
  letter-spacing: 0.5px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(25, 118, 210, 0.2);
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(25, 118, 210, 0.3);
    background: linear-gradient(90deg, #1976d2 0%, #60a5fa 100%);
  }
  
  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`