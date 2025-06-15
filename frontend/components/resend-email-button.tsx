"use client"

import { Button } from "@/components/ui/button"
import { useEmailVerification } from "@/providers/email-verification-provider"
import { useState } from "react"

interface ResendEmailButtonProps {
  email: string
  className?: string
}

export function ResendEmailButton({ email, className }: ResendEmailButtonProps) {
  const { resendVerification, isResending, error, success } = useEmailVerification()
  const [countdown, setCountdown] = useState(0)

  const handleResend = async () => {
    await resendVerification(email)
    // Start 60 second countdown
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleResend}
        disabled={isResending || countdown > 0}
        variant="outline"
        className={className}
      >
        {isResending 
          ? "Sending..." 
          : countdown > 0 
            ? `Resend in ${countdown}s` 
            : "Resend verification email"}
      </Button>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {success && (
        <p className="text-sm text-green-500">{success}</p>
      )}
    </div>
  )
} 