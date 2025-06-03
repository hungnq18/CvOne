"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/providers/global-provider";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styled from "styled-components";
import logo from "../../public/logo/logoCVOne.svg";
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
    background: linear-gradient(to right,rgb(141, 176, 253),rgb(139, 169, 252));
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

const navigationItems = {
  en: [
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
  vi: [
    {
      name: "Công cụ",
      href: "/tools",
      dropdownItems: [
        { name: "Tạo Sơ yếu lí lịch", href: "/tools/resume-builder" },
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
        { name: "Mẫu Công việc", href: "/listJob" },
        { name: "Ví dụ Công việc", href: "/listJob/examples" },
        { name: "Mẹo về Công việc", href: "/listJob/tips" },
      ],
    },
  ],
};

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'vi', name: 'Tiếng Việt', flag: '��🇳' }
] as const;

const StyledLink = styled(Link)`
  &.nav-link {
    color: #333;
    text-decoration: none;
    transition: color 0.2s;
    
    &:hover {
      color: #058ac3;
    }
  }
`

const navItems = [
  { href: "/tools", label: "Tools" },
  { href: "/resume", label: "Resume" },
  { href: "/cvTemplate", label: "CV" },
  { href: "/clTemplate", label: "Cover Letter" },
  { href: "/jobPage", label: "Job" },
]

export function Header() {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center mr-8">
            <Image src={logo} alt="CV One Logo" width={100} height={35} className="h-auto" />
          </Link>

          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <StyledLink
                key={item.href}
                href={item.href}
                className={`nav-link px-4 py-2 inline-flex items-center text-[15px] ${
                  pathname === item.href ? "text-[#058ac3]" : ""
                }`}
              >
                {item.label}
              </StyledLink>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <div>
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="font-medium"
                  onClick={logout}
                >
                  Logout
                </Button>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm" className="font-medium">
                    Login
                  </Button>
                </Link>
              )}
            </div>
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
