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
import { FaBars } from "react-icons/fa";
import { createGlobalStyle } from "styled-components";

const DropdownHoverStyle = createGlobalStyle`
  .dropdown-item:hover {
    background: #f0f4fa;
    color: #333;
  }
  .nav-link {
    position: relative;
  }
  .nav-link::after {
    content: "";
    position: absolute;
    width: 0;
    height: 2px;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: #2563eb;
    transition: width 0.2s ease-in-out;
  }
  .nav-link:hover::after {
    width: 100%;
  }
`;

const MenuLink = styled(Link)`
  position: relative;
  display: inline-block;
  color: #333;
  text-decoration: none;
  padding: 0.5rem 1rem;
  font-size: 15px;
  transition: color 0.2s ease;

  &.nav-link::after {
    content: "";
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
        name: "Saved Jobs",
        href: "/myJobs",
      },
      {
        name: "Jobs",
        href: "/jobPage",
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
        name: "Công việc đã lưu",
        href: "/myJobs",
      },
      {
        name: "Công việc",
        href: "/jobPage",
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

type NavItem = {
  name: string;
  href: string;
  dropdownItems?: { name: string; href: string }[];
};

// Dropdown menu component
function DropdownMenu({
  label,
  items,
  icon,
  isMobile,
}: {
  label: string;
  items: { name: string; href: string }[];
  icon?: React.ReactNode;
  isMobile?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => !isMobile && setOpen(true)}
      onMouseLeave={() => !isMobile && setOpen(false)}
    >
      <PlainButton
        onClick={() => isMobile && setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: 4, position: "relative", width: isMobile ? '100%' : undefined, justifyContent: isMobile ? 'flex-start' : undefined }}
        aria-haspopup="true"
        aria-expanded={open}
        className={isMobile ? "mobile-nav-link nav-link" : "nav-link"}
      >
        {label} {icon}
      </PlainButton>
      {open && (
        <div
          className="absolute left-0 w-44 bg-white border border-gray-200 rounded shadow-lg z-50"
          style={
            isMobile
              ? {
                  position: "static",
                  boxShadow: "none",
                  border: 0,
                  marginTop: 0,
                  width: '100%',
                }
              : { marginTop: "1%", boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }
          }
        >
          {items.map((item) => (
            <MenuLink
              key={item.href}
              href={item.href}
              style={{
                display: "block",
                padding: isMobile ? undefined : "0.5rem 1rem",
                color: "#333",
                transition: "background 0.2s, color 0.2s",
                width: isMobile ? '100%' : undefined,
                textAlign: isMobile ? 'left' : undefined,
              }}
              className={isMobile ? "dropdown-item mobile-dropdown-item" : "dropdown-item"}
              onClick={() => isMobile && setOpen(false)}
            >
              {item.name}
            </MenuLink>
          ))}
        </div>
      )}
    </div>
  );
}

const MobileNavStyle = createGlobalStyle`
  @media (max-width: 767px) {
    .mobile-nav-link {
      text-align: left;
      padding: 0.75rem 0.5rem;
      font-size: 16px;
      margin: 0;
      width: 100%;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .mobile-nav-link:active, .mobile-nav-link:focus, .mobile-nav-link:hover {
      background: #f0f4fa;
    }
    .mobile-dropdown-item {
      padding-left: 1.5rem !important;
      font-size: 15px;
      padding-top: 0.6rem !important;
      padding-bottom: 0.6rem !important;
    }
  }
`;

export function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
  let navItems: NavItem[] =
    role === "admin"
      ? navigationItems[language].admin
      : role === "hr"
      ? navigationItems[language].hr
      : role === "user"
      ? navigationItems[language].user
      : navigationItems[language].default;

  // Custom nav for user role: group Jobs and Saved Jobs, Dashboard and My Profile
  if (role === "user") {
    navItems = [
      {
        name: language === "en" ? "User" : "Người dùng",
        href: "#",
        dropdownItems: [
          {
            name: language === "en" ? "Dashboard" : "Bảng điều khiển",
            href: "/userDashboard",
          },
          {
            name: language === "en" ? "My Profile" : "Hồ sơ của tôi",
            href: "/user/profile",
          },
        ],
      },
      {
        name: language === "en" ? "My Documents" : "Tài liệu của tôi",
        href: "/myDocuments",
      },
      {
        name: language === "en" ? "CV" : "CV",
        href: "/cvTemplates",
      },
      {
        name: language === "en" ? "Cover Letter" : "Thư Ngỏ",
        href: "/clTemplate",
      },
      {
        name: language === "en" ? "Jobs" : "Công việc",
        href: "/jobPage",
        dropdownItems: [
          { name: language === "en" ? "Jobs" : "Công việc", href: "/jobPage" },
          {
            name: language === "en" ? "Saved Jobs" : "Công việc đã lưu",
            href: "/myJobs",
          },
        ],
      },
    ];
  }

  const handleLogout = () => {
    logout();
    document.cookie = "token=; path=/; max-age=0";
    window.location.href = "/login";
  };

  return (
    <HeaderWrapper>
      <DropdownHoverStyle />
      <MobileNavStyle />
      <Container>
        <FlexRow>
          <Link href="/" className="flex items-center mr-8">
            <Image
              src={logo}
              alt="CV One Logo"
              width={100}
              height={35}
              className="h-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) =>
              item.dropdownItems ? (
                <DropdownMenu
                  key={item.name}
                  label={item.name}
                  items={item.dropdownItems}
                />
              ) : (
                <MenuLink
                  key={item.href}
                  href={item.href}
                  style={{ color: pathname === item.href ? "#058ac3" : "#333" }}
                  className="nav-link"
                >
                  {item.name}
                </MenuLink>
              )
            )}
          </nav>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileNavOpen((o) => !o)}
              aria-label="Open navigation menu"
              style={{
                background: "none",
                border: 0,
                fontSize: 24,
                cursor: "pointer",
              }}
            >
              <FaBars />
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
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
            <PlainButton
              onClick={() => setLanguage(language === "en" ? "vi" : "en")}
            >
              {language === "en" ? "VI" : "EN"}
            </PlainButton>
          </div>
        </FlexRow>
        {/* Mobile nav */}
        {mobileNavOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-2 px-2">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) =>
                item.dropdownItems ? (
                  <DropdownMenu
                    key={item.name}
                    label={item.name}
                    items={item.dropdownItems}
                    isMobile
                  />
                ) : (
                  <MenuLink
                    key={item.href}
                    href={item.href}
                    style={{
                      color: pathname === item.href ? "#058ac3" : "#333",
                    }}
                    className="mobile-nav-link nav-link"
                  >
                    {item.name}
                  </MenuLink>
                )
              )}
              <div className="flex flex-col gap-2 mt-2">
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
                <PlainButton
                  onClick={() => setLanguage(language === "en" ? "vi" : "en")}
                >
                  {language === "en" ? "VI" : "EN"}
                </PlainButton>
              </div>
            </nav>
          </div>
        )}
      </Container>
    </HeaderWrapper>
  );
}
