"use client"

import { API_ENDPOINTS, API_URL as BASE_API_URL } from "@/api/apiConfig"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export function useVerifyEmail() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [message, setMessage] = useState("")
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token")
      
      if (!token) {
        setMessage("Invalid verification link")
        setIsLoading(false)
        return
      }

      try {
        const apiBase = BASE_API_URL ?? "/api"
        const verifyUrl = `${apiBase}${API_ENDPOINTS.AUTH.VERIFY_EMAIL ?? "/auth/verify"}`
        const res = await fetch(verifyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()

        if (res.ok) {
          setIsSuccess(true)
          setMessage("Email verified successfully! Redirecting to login...")
          toast({
            title: "Success",
            description: "Email verified successfully",
          })
          setTimeout(() => router.push("/login"), 2000)
        } else {
          setMessage(data.message || "Verification failed")
          toast({
            title: "Error",
            description: data.message || "Verification failed",
            variant: "destructive",
          })
        }
      } catch (error) {
        setMessage("Failed to verify email")
        toast({
          title: "Error",
          description: "Failed to verify email",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    verifyEmail()
  }, [searchParams, router, toast])

  return {
    isLoading,
    isSuccess,
    message,
  }
} 