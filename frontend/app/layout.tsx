import StyledComponentsRegistry from "@/api/registry";
import IconChatAndNotification from "@/components/chatAndNotification/iconChatAndNotification";
import FooterWrapper from "@/components/ui/footer-wrapper";
import { Header } from "@/components/ui/header";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/auth-provider";
import { ChatProvider } from "@/providers/ChatProvider";
import { CVProvider } from "@/providers/cv-provider";
import { EmailVerificationProvider } from "@/providers/email-verification-provider";
import { GlobalProvider } from "@/providers/global_provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { jwtDecode } from "jwt-decode";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import React from "react";
import Script from "next/script";
import "./globals.css";
import 'antd/dist/reset.css';

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
    <html lang="en" className="overflow-x-hidden" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col overflow-x-hidden`}>
        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
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
                        <div className="flex flex-col flex-1">
                          <Header />
                          <main className="flex-1 min-h-0">{children}</main>

                          <FooterWrapper />
                        </div>
                      )}
                      <IconChatAndNotification /> {/* use */}
                      <Toaster /> {/* use */}
                    </CVProvider>
                  </ChatProvider> {/* use */}
                </ThemeProvider>
              </EmailVerificationProvider>
            </AuthProvider>
          </GlobalProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
