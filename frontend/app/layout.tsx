import StyledComponentsRegistry from '@/api/registry'
import { Footer } from "@/components/ui/footer"
import { Header } from "@/components/ui/header"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/providers/auth-provider"
import { EmailVerificationProvider } from "@/providers/email-verification-provider"
import { GlobalProvider } from "@/providers/global-provider"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CVOne - Professional CV & Resume Builder",
  description: "Create professional CVs and resumes with CVOne's easy-to-use builder",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <StyledComponentsRegistry>
          <GlobalProvider>
            <AuthProvider>
              <EmailVerificationProvider>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-grow">{children}</main>
                  <Footer />
                </div>
                <Toaster />
              </EmailVerificationProvider>
            </AuthProvider>
          </GlobalProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
