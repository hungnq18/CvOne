import Link from "next/link"
import Image from "next/image"
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa"
import logoImg from "@/public/logo/logoCVOne.svg"

interface FooterProps {
  show?: boolean
}

export function Footer({ show = true }: FooterProps) {
  if (!show) return null

  return (
    <footer className="bg-slate-950 text-slate-50 py-8 mt-auto border-t border-slate-800">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-6">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-3">
              <Image src={logoImg || "/placeholder.svg"} alt="CVOne Logo" width={40} height={40} />
              <span className="ml-2 text-base font-bold text-white">CVOne</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 mb-4">
              Empowering millions to find their dream career with expert insights, practical tools, and a supportive
              community.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://twitter.com"
                className="text-slate-400 hover:text-blue-400 transition-colors duration-200"
              >
                <FaTwitter size={16} />
              </a>
              <a
                href="https://www.facebook.com/hungnqisme"
                className="text-slate-400 hover:text-blue-400 transition-colors duration-200"
              >
                <FaFacebook size={16} />
              </a>
              <a
                href="https://www.linkedin.com/in/h%C6%B0ng-nguy%E1%BB%85n-8a92742ba/"
                className="text-slate-400 hover:text-blue-400 transition-colors duration-200"
              >
                <FaLinkedin size={16} />
              </a>
            </div>
          </div>

          {/* CV Section */}
          <div>
            <h3 className="text-xs font-semibold text-white mb-3 uppercase tracking-widest opacity-80">CV Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/createCV?id=691b344445b496a8060829bb"
                  className="text-xs text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Create CV
                </Link>
              </li>
              <li>
                <Link
                  href="/createCV-AI?id=691b344445b496a8060829bb"
                  className="text-xs text-slate-400 hover:text-white transition-colors duration-200"
                >
                  AI-Powered CV Builder
                </Link>
              </li>
              <li>
                <Link
                  href="/uploadCV?id=691b344445b496a8060829bb"
                  className="text-xs text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Upload CV
                </Link>
              </li>
              <li>
                <Link
                  href="/cvTemplates"
                  className="text-xs text-slate-400 hover:text-white transition-colors duration-200"
                >
                  CV Templates
                </Link>
              </li>
            </ul>
          </div>

          {/* Cover Letter Section */}
          <div>
            <h3 className="text-xs font-semibold text-white mb-3 uppercase tracking-widest opacity-80">
              Cover Letters
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/personal-info?templateId=68537ef398cb1d0aae6dae5e"
                  className="text-xs text-slate-400 hover:text-white transition-colors duration-200"
                >
                  AI Cover Letter
                </Link>
              </li>
              <li>
                <Link
                  href="/clTemplate"
                  className="text-xs text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Templates
                </Link>
              </li>
              <li>
                <Link
                  href="/createCLTemplate?templateId=68537ef398cb1d0aae6dae5e"
                  className="text-xs text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Create Manually
                </Link>
              </li>
              <li>
                <Link
                  href="/uploadCLTemplate?templateId=68537ef398cb1d0aae6dae5e"
                  className="text-xs text-slate-400 hover:text-white transition-colors duration-200"
                >
                  Upload
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-xs font-semibold text-white mb-3 uppercase tracking-widest opacity-80">Get In Touch</h3>
            <div className="space-y-2">
              <p className="text-xs text-slate-400">
                <span className="text-slate-300 font-medium">Call:</span> 961-591-558
              </p>
              <p className="text-xs text-slate-400">
                <span className="text-slate-300 font-medium">Email:</span> duongvdhe173014@fpt.edu.vn
              </p>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                Helping job seekers build professional profiles that stand out to employers.
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 my-4"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>© 2025 CVOne. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
