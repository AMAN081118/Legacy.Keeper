"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Anchor, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/landing/mobile-nav"
import { usePathname, useRouter } from "next/navigation"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)

  const isResourcesActive = pathname.startsWith("/landing/resources")

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setResourcesOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header
      className={`w-full py-4 px-6 md:px-12 flex items-center justify-between border-b relative bg-white z-50 ${
        scrolled ? "fixed top-0 left-0 shadow-md" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <Anchor className="h-6 w-6 text-blue-800" />
          <span className="text-xl font-bold text-blue-800">Legacy Keeper</span>
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        <Link
          href="/landing"
          className={`text-sm font-medium ${pathname === "/landing" ? "text-blue-900" : "text-gray-600 hover:text-blue-900"}`}
        >
          Home
        </Link>
        <Link
          href="/landing/features"
          className={`text-sm font-medium ${pathname === "/landing/features" ? "text-blue-900" : "text-gray-600 hover:text-blue-900"}`}
        >
          Features
        </Link>
        <Link
          href="/landing/pricing"
          className={`text-sm font-medium ${pathname === "/landing/pricing" ? "text-blue-900" : "text-gray-600 hover:text-blue-900"}`}
        >
          Pricing
        </Link>
        <div className="relative">
          <button
            className={`text-sm font-medium flex items-center gap-1 ${
              isResourcesActive ? "text-blue-900" : "text-gray-600 hover:text-blue-900"
            }`}
            onClick={() => setResourcesOpen(!resourcesOpen)}
          >
            Resources
            {resourcesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
        <Link
          href="/landing/faq"
          className={`text-sm font-medium ${pathname === "/landing/faq" ? "text-blue-900" : "text-gray-600 hover:text-blue-900"}`}
        >
          FAQ
        </Link>
        <Link
          href="/landing/about-us"
          className={`text-sm font-medium ${pathname === "/landing/about-us" ? "text-blue-900" : "text-gray-600 hover:text-blue-900"}`}
        >
          About Us
        </Link>
        <Link
          href="/landing/contact-us"
          className={`text-sm font-medium ${pathname === "/landing/contact-us" ? "text-blue-900" : "text-gray-600 hover:text-blue-900"}`}
        >
          Contact Us
        </Link>
      </nav>

      <div className="flex items-center gap-3">
        <Link href="/" className="text-sm font-medium text-gray-700 hover:text-blue-900">
          Login
        </Link>
        <Link href="/auth/register">
          <Button className="bg-blue-900 hover:bg-blue-800 text-white rounded-md px-4 py-2 text-sm">Register</Button>
        </Link>
      </div>

      <MobileNav />

      {/* Full-width Resources Dropdown */}
      {resourcesOpen && (
        <div ref={dropdownRef} className="absolute top-full left-0 w-full bg-white shadow-lg z-20 mt-px">
          <div className="container mx-auto py-8 px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Blogs */}
              <button
                type="button"
                className="block cursor-pointer w-full text-left bg-transparent border-none p-0"
                tabIndex={0}
                onClick={() => {
                  alert('Blogs card clicked');
                  console.log('Blogs card clicked');
                  setResourcesOpen(false);
                  router.push('/landing/resources/blogs');
                }}
              >
                <div className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium p-4">Blogs</h3>
                  <div className="relative h-32">
                    <Image src="/focused-coder.png" alt="Blogs" fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600">
                      Stay updated with our latest articles on financial planning, legacy management, and family
                      security.
                    </p>
                  </div>
                </div>
              </button>

              {/* Help Guides */}
              <button
                type="button"
                className="block cursor-pointer w-full text-left bg-transparent border-none p-0"
                tabIndex={0}
                onClick={() => {
                  alert('Help Guides card clicked');
                  console.log('Help Guides card clicked');
                  setResourcesOpen(false);
                  router.push('/landing/resources/guides');
                }}
              >
                <div className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium p-4">Help Guides</h3>
                  <div className="relative h-32">
                    <Image src="/diverse-handshake-agreement.png" alt="Help Guides" fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600">
                      Step-by-step instructions to help you make the most of Legacy Keeper's features.
                    </p>
                  </div>
                </div>
              </button>

              {/* Video Library */}
              <button
                type="button"
                className="block cursor-pointer w-full text-left bg-transparent border-none p-0"
                tabIndex={0}
                onClick={() => {
                  alert('Video Library card clicked');
                  console.log('Video Library card clicked');
                  setResourcesOpen(false);
                  router.push('/landing/resources/videos');
                }}
              >
                <div className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium p-4">Video Library</h3>
                  <div className="relative h-32">
                    <Image src="/simple-video-player.png" alt="Video Library" fill className="object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white bg-opacity-75 flex items-center justify-center">
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-blue-600 border-b-8 border-b-transparent ml-1"></div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">LIVE</div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600">
                      Watch tutorials, webinars, and expert interviews on legacy planning and financial security.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex justify-end mt-6">
              <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                Financial Planning
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
