import StyledComponentsRegistry from '@/api/registry'
import { Footer } from "@/components/ui/footer"
import { Header } from "@/components/ui/header"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/providers/auth-provider"
import { EmailVerificationProvider } from "@/providers/email-verification-provider"
import { GlobalProvider } from "@/providers/global-provider"
import { CVProvider } from "@/providers/cv-provider"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/providers/theme-provider"
import IconChatAndNotification from "@/components/chatAndNotification/iconChatAndNotification"
import FooterWrapper from "@/components/ui/footer-wrapper"
import { ChatProvider } from '@/providers/ChatProvider'

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
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  <ChatProvider>
                    <div className="flex flex-col min-h-screen">
                      <Header />
                      <main className="flex-grow">{children}</main>
                      <FooterWrapper />
                    </div>
                    <IconChatAndNotification />
                    <Toaster />
                  </ChatProvider>
                </ThemeProvider>
              </EmailVerificationProvider>
            </AuthProvider>
          </GlobalProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
