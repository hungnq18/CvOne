import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { GlobalProvider } from "@/providers/global-provider"
import { Toaster } from "@/components/ui/toaster"
import StyledComponentsRegistry from '@/lib/registry'

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
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </GlobalProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
