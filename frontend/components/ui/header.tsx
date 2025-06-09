"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/providers/global-provider";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Thêm useRouter
import { useEffect, useState } from "react";
import styled from "styled-components";
import logo from "../../public/logo/logoCVOne.svg";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "@/middleware";

// Styled components for animations
const MenuLink = styled(Link)`
  position: relative;
  display: inline-block;

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
`;

const AnimatedButton = styled(Button)`
  position: relative;
  overflow: hidden;
  z-index: 1;
  transition: color 0.2s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, rgb(141, 176, 253), rgb(139, 169, 252));
    transition: left 0.2s ease;
    z-index: -1;
  }

  &:hover {
    color: white;
    &::before {
      left: 0;
    }
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 12rem;
  z-index: 50;
`;

const DropdownItem = styled(Link)`
  display: block;
  padding: 0.5rem 1rem;
  color: #333;
  text-decoration: none;

  &:hover {
    background-color: #f3f4f6;
    color: #058ac3;
  }
`;

const StyledLink = styled(Link)`
  &.nav-link {
    color: #333;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: #058ac3;
    }
  }
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
        href: "/cvTemplate",
        dropdownItems: [
          { name: "CV Templates", href: "/cvTemplate" },
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
        href: "/admin/dashboard",
      },
      {
        name: "Manage Users",
        href: "/admin/users",
      },
      {
        name: "Settings",
        href: "/admin/settings",
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
        name: "Templates",
        href: "/templates",
        dropdownItems: [
          { name: "Resume Templates", href: "/cvTemplate" },
          { name: "CV Templates", href: "/cvTemplate" },
          { name: "Cover Letter Templates", href: "/clTemplate" },
        ],
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
        href: "/cvTemplate",
        dropdownItems: [
          { name: "Mẫu CV", href: "/cvTemplate" },
          { name: "Ví dụ CV", href: "/cv/examples" },
          { name: "Mẹo về CV", href: "/cv/tips" },
        ],
      },
      {
        name: "Thư ngỏ",
        href: "/cover-letter",
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
        href: "/admin/dashboard",
      },
      {
        name: "Quản lý Người dùng",
        href: "/admin/users",
      },
      {
        name: "Cài đặt",
        href: "/admin/settings",
      },
    ],
    user: [
      {
        name: "Bảng điều khiển",
        href: "/userDashboard",
      },
      {
        name: "Hồ sơ của tôi",
        href: "/myDocuments",
        dropdownItems: [
          { name: "Hồ sơ của tôi", href: "/myDocuments" },
          { name: "CV của tôi", href: "/myDocuments" },
          { name: "Thư ngỏ của tôi", href: "/myDocuments" },
        ],
      },
      {
        name: "Mẫu",
        href: "/templates",
        dropdownItems: [
          { name: "Mẫu Hồ sơ", href: "/cvTemplate" },
          { name: "Mẫu CV", href: "/cvTemplate" },
          { name: "Mẫu Thư ngỏ", href: "/clTemplate" },
        ],
      },
      {
        name: "Công việc của tôi",
        href: "/user/jobs",
      },
      {
        name: "Hồ sơ của tôi",
        href: "/user/profile",
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

  if (!isMounted) {
    return null;
  }

  // Lấy role từ token trong cookie
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

  // Chọn navigation items dựa trên role
  const navItems =
    role === "admin"
      ? navigationItems[language].admin
      : role === "user"
        ? navigationItems[language].user
        : navigationItems[language].default;

  // Xử lý logout
  const handleLogout = () => {
    logout(); // Gọi hàm logout từ useAuth (nếu có logic bổ sung)
    // Xóa token khỏi cookie
    document.cookie = "token=; path=/; max-age=0";
    // Điều hướng về trang login
    router.push("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center mr-8">
            <Image
              src={logo}
              alt="CV One Logo"
              width={100}
              height={35}
              className="h-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <MenuLink
                key={item.href}
                href={item.href}
                className={`nav-link px-4 py-2 inline-flex items-center text-[15px] ${pathname === item.href ? "text-[#058ac3]" : ""
                  }`}
              >
                {item.name}
              </MenuLink>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {role ? (
              <>
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  className="font-medium"
                  onClick={handleLogout}
                >
                  {language === "en" ? "Logout" : "Đăng xuất"}
                </AnimatedButton>
                {role === "admin" && (
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    className="font-medium"
                    asChild
                  >
                    <Link href="/admin/dashboard">
                      {language === "en" ? "Admin Panel" : "Quản trị"}
                    </Link>
                  </AnimatedButton>
                )}
              </>
            ) : (
              <Link href="/login">
                <AnimatedButton variant="outline" size="sm" className="font-medium">
                  {language === "en" ? "Login" : "Đăng nhập"}
                </AnimatedButton>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "vi" : "en")}
            >
              {language === "en" ? "VI" : "EN"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}