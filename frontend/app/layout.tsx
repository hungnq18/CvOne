import StyledComponentsRegistry from "@/api/registry";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/auth-provider";
import { EmailVerificationProvider } from "@/providers/email-verification-provider";
import { GlobalProvider } from "@/providers/global-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";
import { Header } from "@/components/ui/header";
import { ThemeProvider } from "@/providers/theme-provider";
import IconChatAndNotification from "@/components/chatAndNotification/iconChatAndNotification";
import FooterWrapper from "@/components/ui/footer-wrapper";
import { ChatProvider } from "@/providers/ChatProvider";
import { CVProvider } from "@/providers/cv-provider";
import { AppSidebar } from "@/components/hr/hrSideBar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CVOne - Professional CV & Resume Builder",
  description:
    "Create professional CVs and resumes with CVOne's easy-to-use builder",
};

function getRoleFromToken() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);
    return decoded.role;
  } catch {
    return null;
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const role = getRoleFromToken();
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${inter.className} min-h-screen flex flex-col overflow-x-hidden`}>
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
                    <CVProvider>
                      {role === 'admin' ? (
                        children
                      ) : (
                        <div className="flex flex-col min-h-screen">
                          <Header />
                          <main className="flex-1 min-h-0">{children}</main>
                          <div className="relative z-10">
                            <FooterWrapper />
                          </div>
                        </div>
                      )}
                      <IconChatAndNotification />
                      <Toaster />
                    </CVProvider>
                  </ChatProvider>
                </ThemeProvider>
              </EmailVerificationProvider>
            </AuthProvider>
          </GlobalProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
