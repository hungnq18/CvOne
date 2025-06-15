"use client"

import { fetchWithAuth } from "@/api/apiClient"
import { API_ENDPOINTS } from "@/api/apiConfig"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function ConfirmEmailPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Gửi email xác thực
      await fetchWithAuth(API_ENDPOINTS.ACCOUNTS.VERIFY_EMAIL, {
        method: "POST",
        body: JSON.stringify({ email })
      })

      setIsSent(true)
      toast.success("Verification email sent successfully!")
    } catch (error) {
      console.error("Failed to send verification email:", error)
      toast.error("Failed to send verification email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSent) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Email Sent Successfully!</CardTitle>
            <CardDescription>
              Please check your email for the verification link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center">
              We have sent a verification link to your email address. 
              Please check your inbox and click the link to verify your account.
            </p>
            <div className="flex justify-center space-x-4">
              <Button asChild>
                <Link href="/login">Go to Login</Link>
              </Button>
              <Button variant="outline" onClick={() => setIsSent(false)}>
                Send Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Confirm Your Email</CardTitle>
          <CardDescription>
            Please enter your email address to receive a verification link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Verification Email"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 