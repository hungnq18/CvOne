import type React from "react"
export interface NavItem {
  title: string
  href: string
  disabled?: boolean
  external?: boolean
}

export interface SiteConfig {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    twitter: string
    github: string
  }
}

export interface Feature {
  title: string
  description: string
  icon: React.ReactNode
}

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  description: string;
  imageUrl: string;
  salary: string;
}