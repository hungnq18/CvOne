"use client"

import { resendVerification, verifyEmail, verifyToken } from "@/api/authApi"
import { createContext, useContext, useState } from "react"

interface EmailVerificationContextType {
  isVerifying: boolean
  isResending: boolean
  error: string | null
  success: string | null
  verifyEmail: (email: string) => Promise<void>
  resendVerification: (email: string) => Promise<void>
  verifyToken: (token: string) => Promise<void>
  clearMessages: () => void
}

const EmailVerificationContext = createContext<EmailVerificationContextType>({
  isVerifying: false,
  isResending: false,
  error: null,
  success: null,
  verifyEmail: async () => {},
  resendVerification: async () => {},
  verifyToken: async () => {},
  clearMessages: () => {}
})

export function EmailVerificationProvider({ children }: { children: React.ReactNode }) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleVerifyEmail = async (email: string) => {
    try {
      setIsVerifying(true)
      setError(null)
      await verifyEmail(email)
      setSuccess("Verification email sent successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send verification email")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendVerification = async (email: string) => {
    try {
      setIsResending(true)
      setError(null)
      await resendVerification(email)
      setSuccess("Verification email resent successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend verification email")
    } finally {
      setIsResending(false)
    }
  }

  const handleVerifyToken = async (token: string) => {
    try {
      setIsVerifying(true)
      setError(null)
      await verifyToken(token)
      setSuccess("Email verified successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify email")
    } finally {
      setIsVerifying(false)
    }
  }

  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  return (
    <EmailVerificationContext.Provider
      value={{
        isVerifying,
        isResending,
        error,
        success,
        verifyEmail: handleVerifyEmail,
        resendVerification: handleResendVerification,
        verifyToken: handleVerifyToken,
        clearMessages
      }}
    >
      {children}
    </EmailVerificationContext.Provider>
  )
}

export const useEmailVerification = () => useContext(EmailVerificationContext) 