import Link from "next/link"
import Image from "next/image"
import { FaFacebook, FaTwitter, FaLinkedin, FaGamepad, FaRobot } from "react-icons/fa"
import { BsMessenger } from "react-icons/bs"
import logoImg from "../../public/logo/logoCVOne.svg"

interface FooterProps {
  show?: boolean;
}

export function Footer({ show = true }: FooterProps) {
  if (!show) return null;

  return (
    <footer className="bg-slate-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-x-4 gap-y-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-3">
              <Image src={logoImg} alt="CVOne Logo" width={60} height={60} />
              <span className="ml-2 text-xl font-bold">CVOne</span>
            </div>
            <p className="text-xs leading-relaxed text-gray-300 mb-4 max-w-sm">
              CVOne is a career site fueled by the best career experts and a community of millions
              of readers yearly. We share knowledge, tips, and tools to help everyone find their dream
              job.
            </p>
            <div className="flex space-x-4 mb-4">
              <Link href="https://twitter.com" className="text-gray-300 hover:text-white">
                <FaTwitter size={18} />
              </Link>
              <Link href="https://www.facebook.com/hungnqisme" className="text-gray-300 hover:text-white">
                <FaFacebook size={18} />
              </Link>
              <Link href="https://www.linkedin.com/in/h%C6%B0ng-nguy%E1%BB%85n-8a92742ba/" className="text-gray-300 hover:text-white">
                <FaLinkedin size={18} />
              </Link>
            </div>
            <div className="text-xs text-gray-300 space-y-1">
              <p>Call us: 968-753-736</p>
              <p>Email: duongvdhe173014@fpt.edu.vn</p>
            </div>
          </div>

          {/* Resume Section */}
          <div>
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider">Resume</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/resume-builder" className="text-xs text-gray-300 hover:text-white block">
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/resume-templates" className="text-xs text-gray-300 hover:text-white block">
                  Resume Templates
                </Link>
              </li>
              <li>
                <Link href="/resume-checker" className="text-xs text-gray-300 hover:text-white block">
                  Resume Checker
                </Link>
              </li>
              <li>
                <Link href="/resume-examples" className="text-xs text-gray-300 hover:text-white block">
                  Resume Examples
                </Link>
              </li>
              <li>
                <Link href="/resume-format" className="text-xs text-gray-300 hover:text-white block">
                  Resume Format
                </Link>
              </li>
            </ul>
          </div>

          {/* CV Section */}
          <div>
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider">CV</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/cv-builder" className="text-xs text-gray-300 hover:text-white block">
                  CV Builder
                </Link>
              </li>
              <li>
                <Link href="/cv-templates" className="text-xs text-gray-300 hover:text-white block">
                  CV Templates
                </Link>
              </li>
              <li>
                <Link href="/cv-examples" className="text-xs text-gray-300 hover:text-white block">
                  CV Examples
                </Link>
              </li>
              <li>
                <Link href="/cv-format" className="text-xs text-gray-300 hover:text-white block">
                  CV Format
                </Link>
              </li>
            </ul>
          </div>

          {/* Cover Letter Section */}
          <div>
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider">Cover Letter</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/cover-letter-builder" className="text-xs text-gray-300 hover:text-white block">
                  Cover Letter Builder
                </Link>
              </li>
              <li>
                <Link href="/cover-letter-templates" className="text-xs text-gray-300 hover:text-white block">
                  Cover Letter Templates
                </Link>
              </li>
              <li>
                <Link href="/cover-letter-examples" className="text-xs text-gray-300 hover:text-white block">
                  Cover Letter Examples
                </Link>
              </li>
              <li>
                <Link href="/cover-letter-format" className="text-xs text-gray-300 hover:text-white block">
                  Cover Letter Format
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-xs text-gray-300 hover:text-white block">
                  About
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-xs text-gray-300 hover:text-white block">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs text-gray-300 hover:text-white block">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-xs text-gray-300 hover:text-white block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-xs text-gray-300 hover:text-white block">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Quick Access Icons */}
        <div className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-l-lg shadow-lg">
          <div className="flex flex-col space-y-3 p-2">
            <button className="text-blue-600 hover:text-blue-800">
              <FaRobot size={18} />
            </button>
            <button className="text-blue-600 hover:text-blue-800">
              <BsMessenger size={18} />
            </button>
            <button className="text-blue-600 hover:text-blue-800">
              <FaGamepad size={18} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
