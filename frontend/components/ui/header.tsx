"use client";

import type { FC } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { NavigationMenu } from "@/components/navigation/navigation-menu";
import logo from "../../public/logo/logoCVOne.svg";

interface HeaderStyles {
  position: "fixed";
  top: number;
  left: number;
  right: number;
  zIndex: number;
  backgroundColor: string;
  transition: string;
  boxShadow: string;
  padding: string;
}

export const Header: FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = (): void => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerStyles: HeaderStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "white",
    transition: "all 0.3s ease",
    boxShadow: isScrolled ? "0 2px 10px rgba(0, 0, 0, 0.1)" : "none",
    padding: "12px 0"
  };

  return (
    <header className="border-b" style={headerStyles}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src={logo} alt="CV One Logo" width={120} height={160} />
          </Link>
          <NavigationMenu />
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Đăng nhập
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Đăng ký</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
