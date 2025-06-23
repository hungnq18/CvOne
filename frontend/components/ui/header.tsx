// components/Header.tsx
"use client";

import { useAuth } from "@/hooks/use-auth";
import { DecodedToken } from "@/middleware";
import { useLanguage } from "@/providers/global-provider";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styled from "styled-components";
import logo from "../../public/logo/logoCVOne.svg";

const MenuLink = styled(Link)`
  position: relative;
  display: inline-block;
  color: #333;
  text-decoration: none;
  padding: 0.5rem 1rem;
  font-size: 15px;
  transition: color 0.2s ease;

  &.nav-link::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: #2563eb;
    transition: width 0.2s ease-in-out;
  }
  &.nav-link:hover::after {
    width: 100%;
  }

  &:hover {
    color: #058ac3;
  }
`;

const StyledButton = styled.button`
  background: none;
  border: 1px solid #ccc;
  padding: 0.4rem 1rem;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
  background: #2563eb;
  color: white;
  font-weight: 500;
  transition: background 0.2s ease;

  &:hover {
    background: #1d4ed8;
  }
`;

const PlainButton = styled.button`
  background: none;
  border: none;
  padding: 0.4rem 1rem;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  color: #333;

  &:hover {
    color: #058ac3;
  }
`;

const HeaderWrapper = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: white;
  border-bottom: 1px solid #e5e7eb;
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const FlexRow = styled.div`
  display: flex;
  height: 64px;
  align-items: center;
  justify-content: space-between;
`;

const navigationItems = {
  en: {
    default: [
      {
        name: "Tools",
        href: "/tools",
        dropdownItems: [
          { name: "Resume Builder", href: "/tools/resume-builder" },
          { name: "CV Builder", href: "/tools/cv-builder" },
          { name: "Cover Letter Builder", href: "/tools/cover-letter-builder" },
        ],
      },
      {
        name: "Resume",
        href: "/resume",
        dropdownItems: [
          { name: "Resume Templates", href: "/resume/templates" },
          { name: "Resume Examples", href: "/resume/examples" },
          { name: "Resume Tips", href: "/resume/tips" },
        ],
      },
      {
        name: "CV",
        href: "/cvTemplates",
        dropdownItems: [
          { name: "CV Templates", href: "/cvTemplates" },
          { name: "CV Examples", href: "/cv/examples" },
          { name: "CV Tips", href: "/cv/tips" },
        ],
      },
      {
        name: "Cover Letter",
        href: "/clTemplate",
        dropdownItems: [
          { name: "Cover Letter Templates", href: "/clTemplate" },
          { name: "Cover Letter Examples", href: "/cover-letter/examples" },
          { name: "Cover Letter Tips", href: "/cover-letter/tips" },
        ],
      },
      {
        name: "Job",
        href: "/jobPage",
        dropdownItems: [
          { name: "Job List", href: "/jobPage" },
          { name: "Job Tips", href: "/jobPage/tips" },
        ],
      },
    ],
    admin: [
      {
        name: "Dashboard",
        href: "/admin",
      },
      {
        name: "Manage Users",
        href: "/admin/user",
      },
      {
        name: "Manage CV Template",
        href: "/admin/cv-template",
      },
      {
        name: "Manage CL Template",
        href: "/admin/cl-template",
      },
    ],
    hr: [
      {
        name: "Dashboard",
        href: "/hr/dashboard",
      },
      {
        name: "My Profile",
        href: "/user/profile",
      },
    ],
    user: [
      {
        name: "Dashboard",
        href: "/userDashboard",
      },
      {
        name: "My Documents",
        href: "/myDocuments",
        dropdownItems: [
          { name: "My Resume Templates", href: "/myDocuments" },
          { name: "My CV Templates", href: "/myDocuments" },
          { name: "My Cover Letter Templates", href: "/myDocuments" },
        ],
      },
      {
        name: "CV",
        href: "/cvTemplates",
      },
      {
        name: "Cover Letter",
        href: "/clTemplate",
      },
      {
        name: "My Jobs",
        href: "/myJobs",
      },
      {
        name: "My Profile",
        href: "/user/profile",
      },
    ],
  },
  vi: {
    default: [
      {
        name: "Công cụ",
        href: "/tools",
        dropdownItems: [
          { name: "Tạo Sơ yếu lý lịch", href: "/tools/resume-builder" },
          { name: "Tạo CV", href: "/tools/cv-builder" },
          { name: "Tạo Thư ngỏ", href: "/tools/cover-letter-builder" },
        ],
      },
      {
        name: "Sơ yếu lý lịch",
        href: "/resume",
        dropdownItems: [
          { name: "Mẫu Sơ yếu lý lịch", href: "/resume/templates" },
          { name: "Ví dụ Sơ yếu lý lịch", href: "/resume/examples" },
          { name: "Mẹo về Sơ yếu lý lịch", href: "/resume/tips" },
        ],
      },
      {
        name: "CV",
        href: "/cvTemplates",
        dropdownItems: [
          { name: "Mẫu CV", href: "/cvTemplates" },
          { name: "Ví dụ CV", href: "/cv/examples" },
          { name: "Mẹo về CV", href: "/cv/tips" },
        ],
      },
      {
        name: "Thư ngỏ",
        href: "/clTemplate",
        dropdownItems: [
          { name: "Mẫu Thư ngỏ", href: "/clTemplate" },
          { name: "Ví dụ Thư ngỏ", href: "/cover-letter/examples" },
          { name: "Mẹo về Thư ngỏ", href: "/cover-letter/tips" },
        ],
      },
      {
        name: "Công việc",
        href: "/listJob",
        dropdownItems: [
          { name: "Danh sách Công việc", href: "/listJob" },
          { name: "Mẹo về Công việc", href: "/listJob/tips" },
        ],
      },
    ],
    admin: [
      {
        name: "Bảng điều khiển",
        href: "/admin",
      },
      {
        name: "Quản lý Người dùng",
        href: "/admin/user",
      },
      {
        name: "Quản lý CV Template",
        href: "/admin/cv-template",
      },
      {
        name: "Quản lý CL Template",
        href: "/admin/cl-template",
      },
    ],
    hr: [
      {
        name: "Bảng điều khiển",
        href: "/hr/dashboard",
      },
      {
        name: "Hồ sơ của tôi",
        href: "/user/profile",
      },
    ],
    user: [
      {
        name: "Bảng điều khiển",
        href: "/userDashboard",
      },
      {
        name: "Tài liệu của tôi",
        href: "/myDocuments",
      },
      {
        name: "CV",
        href: "/cvTemplates",
      },

      {
        name: "Thư Ngỏ",
        href: "/clTemplate",
      },
      {
        name: "Công việc của tôi",
        href: "/user/jobs",
      },
      {
        name: "Hồ sơ của tôi",
        href: "/user/profile",
      },
    ],
  },
};
const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
] as const;

export function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const getRoleFromToken = () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (!token) return null;
    try {
      const decoded: DecodedToken = jwtDecode(token);
      return decoded.role;
    } catch {
      return null;
    }
  };

  const role = getRoleFromToken();
  const navItems =
    role === "admin"
      ? navigationItems[language].admin
      : role === "hr"
        ? navigationItems[language].hr
        : role === "user"
          ? navigationItems[language].user
          : navigationItems[language].default;

  const handleLogout = () => {
    logout();
    document.cookie = "token=; path=/; max-age=0";
    router.push("/login");
    router.refresh();
  };

  return (
    <HeaderWrapper>
      <Container>
        <FlexRow>
          <Link href="/" className="flex items-center mr-8">
            <Image src={logo} alt="CV One Logo" width={100} height={35} className="h-auto" />
          </Link>

          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <MenuLink
                key={item.href}
                href={item.href}
                style={{ color: pathname === item.href ? "#058ac3" : "#333" }}
                className="nav-link"
              >
                {item.name}
              </MenuLink>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {role ? (
              <>
                <StyledButton onClick={handleLogout}>
                  {language === "en" ? "Logout" : "Đăng xuất"}
                </StyledButton>
                {role === "admin" && (
                  <StyledButton as={Link} href="/admin">
                    {language === "en" ? "Admin Panel" : "Quản trị"}
                  </StyledButton>
                )}
              </>
            ) : (
              <StyledButton as={Link} href="/login">
                {language === "en" ? "Login" : "Đăng nhập"}
              </StyledButton>
            )}
            <PlainButton onClick={() => setLanguage(language === "en" ? "vi" : "en")}>
              {language === "en" ? "VI" : "EN"}
            </PlainButton>
          </div>
        </FlexRow>
      </Container>
    </HeaderWrapper>
  );
}
