"use client"

import { Button } from "@/components/ui/button"
import { useEmailVerification } from "@/providers/email-verification-provider"
import { useState } from "react"

interface VerifyEmailButtonProps {
  email: string
  className?: string
}

export function VerifyEmailButton({ email, className }: VerifyEmailButtonProps) {
  const { verifyEmail, isVerifying, error, success } = useEmailVerification()
  const [showResend, setShowResend] = useState(false)

  const handleClick = async () => {
    await verifyEmail(email)
    setShowResend(true)
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClick}
        disabled={isVerifying}
        className={className}
      >
        {isVerifying ? "Sending..." : "Verify Email"}
      </Button>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {success && (
        <p className="text-sm text-green-500">{success}</p>
      )}

      {showResend && (
        <Button
          variant="link"
          onClick={() => verifyEmail(email)}
          disabled={isVerifying}
          className="text-sm"
        >
          Resend verification email
        </Button>
      )}
    </div>
  )
} 