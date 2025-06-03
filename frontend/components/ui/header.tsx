"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import logo from "../../public/logo/logoCVOne.svg";
import styled from "styled-components";
import { useLanguage } from "@/providers/global-provider";

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
      href: "/cv",
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
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
] as const;

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-switcher')) {
        setShowLanguageDropdown(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (langCode: 'en' | 'vi') => {
    setLanguage(langCode);
    setShowLanguageDropdown(false);
  };

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300"
      style={{
        boxShadow: isScrolled ? "0 2px 10px rgba(0, 0, 0, 0.1)" : "none",
        lineHeight: "40px",
        padding: "20px 100px 10px 100px",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center mr-8">
            <Image src={logo} alt="CV One Logo" width={100} height={35} className="h-auto" />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center flex-1">
            {navigationItems[language].map((item) => (
              <div
                key={item.name}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <MenuLink
                  href={item.href}
                  className={`nav-link px-4 py-2 inline-flex items-center text-[15px] font-medium transition-all duration-200
                    ${activeDropdown === item.name
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'}`}
                >
                  {item.name}
                </MenuLink>

                {/* Dropdown Menu */}
                <div
                  className={`absolute left-0 mt-0 w-64 bg-white shadow-lg border border-gray-100 transition-all duration-200 origin-top-left
                    ${activeDropdown === item.name
                      ? 'opacity-100 scale-100 translate-y-0'
                      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
                >
                  <div className="py-2">
                    {item.dropdownItems?.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.name}
                        href={dropdownItem.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-150"
                      >
                        {dropdownItem.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>

          {/* Auth and Language Buttons */}
          <div className="flex items-center ml-auto gap-4">
            {/* Language Switcher */}
            <div className="relative language-switcher">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center justify-center gap-2 px-3 border-gray-200 hover:border-blue-600 transition-colors"
              >
                <span>{currentLanguage?.flag}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 
                    ${showLanguageDropdown ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Language Dropdown */}
              <div
                className={`absolute right-0 mt-2 w-40 bg-white shadow-lg border border-gray-100 rounded-md transition-all duration-200 origin-top-right
                  ${showLanguageDropdown
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
              >
                <div className="py-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 flex items-center gap-2
                        ${language === lang.code ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/login" className="relative overflow-hidden">
              <AnimatedButton
                variant="outline"
                size="sm"
                className="font-medium border-2 border-blue-600 text-blue-600 bg-transparent hover:text-white transition-all duration-300"
              >
                {language === 'en' ? 'Login' : 'Đăng nhập'}
              </AnimatedButton>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 ml-4 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
