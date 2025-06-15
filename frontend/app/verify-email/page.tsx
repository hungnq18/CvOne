"use client"

import { API_ENDPOINTS, API_URL } from "@/api/apiConfig"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

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
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            Please verify your email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              We've sent you a verification email. Please check your inbox and click the verification link.
            </p>
            <Button 
              className="w-full" 
              onClick={handleResendVerification}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Resend Verification Email"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 