import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="bg-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between">
          {/* Text section - bên trái */}
          <div className="md:w-1/2 text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Professional CV & Cover Letter
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Create a beautiful and impressive CV in just a few minutes.
            </p>
            <Link
              href="/create-cv"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md text-lg hover:bg-blue-700"
            >
              Create Your CV Now
            </Link>
          </div>


          <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
            <Image
              src="../homeIMG.png"
              alt="Home Image"
              width={800}
              height={500}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
