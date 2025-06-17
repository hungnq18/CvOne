"use client"

import { usePathname } from 'next/navigation'
import { Footer } from './footer'

export default function FooterWrapper() {
    const pathname = usePathname()
    const showFooter = !pathname?.startsWith('/chat')

    return <Footer show={showFooter} />
} 