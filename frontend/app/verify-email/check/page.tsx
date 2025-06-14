"use client"

import { API_ENDPOINTS, API_URL } from "@/api/apiConfig"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

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
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {isLoading ? "Verifying your email..." : 
             isVerified ? "Email verified successfully!" :
             "Verification failed"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isVerified && (
            <>
              <p className="text-center text-green-500">
                Your email has been verified successfully!
              </p>
              <p className="text-center mt-2">
                Redirecting to login page...
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 