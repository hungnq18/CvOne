import { Footer } from "@/components/ui/footer"
import { Header } from "@/components/ui/header"
import { Toaster } from "@/components/ui/toaster"
import StyledComponentsRegistry from '@/lib/registry'
import { AuthProvider } from "@/providers/auth-provider"
import { GlobalProvider } from "@/providers/global-provider"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CvOne - Professional Resume Builder",
  description: "Create professional resumes, CVs, and cover letters with CvOne",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <GlobalProvider>
            <AuthProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </AuthProvider>
          </GlobalProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
