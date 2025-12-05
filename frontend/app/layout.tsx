import StyledComponentsRegistry from "@/api/registry";
import IconChatAndNotification from "@/components/chatAndNotification/iconChatAndNotification";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/auth-provider";
import { SocketProvider } from "@/providers/SocketProvider";
import { CVProvider } from "@/providers/cv-provider";
import { EmailVerificationProvider } from "@/providers/email-verification-provider";
import { GlobalProvider } from "@/providers/global_provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { jwtDecode } from "jwt-decode";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import React from "react";
import "./globals.css";
import "antd/dist/reset.css";
import ConditionalLayout from "@/components/layouts/conditional-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CVOne - Professional CV & Resume Builder",
  description:
    "Create professional CVs and resumes with CVOne's easy-to-use builder",
};

function getRoleFromToken() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
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
    <html lang="en" className="overflow-x-hidden" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen flex flex-col overflow-x-hidden`}
      >
        <StyledComponentsRegistry>
          <GlobalProvider>
            <AuthProvider>
              <EmailVerificationProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="light"
                  forcedTheme="light"
                  disableTransitionOnChange
                >
                  <SocketProvider>
                    <CVProvider>
                      <ConditionalLayout role={role}>
                        {children}
                      </ConditionalLayout>
                      <IconChatAndNotification /> {/* use */}
                      <Toaster /> {/* For all toast notifications (shadcn) */}
                    </CVProvider>
                  </SocketProvider>{" "}
                  {/* use */}
                </ThemeProvider>
              </EmailVerificationProvider>
            </AuthProvider>
          </GlobalProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
