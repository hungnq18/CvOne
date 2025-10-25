import StyledComponentsRegistry from '@/api/registry'
import { Header } from "@/components/ui/header"
import { AuthProvider } from "@/providers/auth-provider"
import { EmailVerificationProvider } from "@/providers/email-verification-provider"
import { GlobalProvider } from "@/providers/global_provider"
import { ThemeProvider } from "@/providers/theme-provider"
import type { Metadata } from "next"
import type React from "react"

export const metadata: Metadata = {
    title: "Chat - CVOne",
    description: "Chat with other users on CVOne",
}

export default function ChatLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
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
                            <div className="flex flex-col min-h-screen">
                                <Header />
                                <main className="flex-grow">{children}</main>
                            </div>
                        </ThemeProvider>
                    </EmailVerificationProvider>
                </AuthProvider>
            </GlobalProvider>
        </StyledComponentsRegistry>
    )
} 