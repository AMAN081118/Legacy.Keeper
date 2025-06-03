"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const pathname = usePathname()

  const isResourcesActive = pathname.startsWith("/resources")

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="text-gray-700">
        <Menu className="h-6 w-6" />
        <span className="sr-only">Open menu</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="flex justify-end p-4">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-gray-700">
              <X className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>

          <nav className="flex flex-col items-center gap-6 p-4">
            <Link
              href="/"
              className={`text-lg font-medium ${pathname === "/" ? "text-blue-900" : "text-gray-600"}`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/features"
              className={`text-lg font-medium ${pathname === "/features" ? "text-blue-900" : "text-gray-600"}`}
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className={`text-lg font-medium ${pathname === "/pricing" ? "text-blue-900" : "text-gray-600"}`}
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/faq"
              className={`text-lg font-medium ${pathname === "/faq" ? "text-blue-900" : "text-gray-600"}`}
              onClick={() => setIsOpen(false)}
            >
              FAQ
            </Link>

            <div className="w-full">
              <button
                className={`text-lg font-medium flex items-center justify-center gap-1 w-full ${
                  isResourcesActive ? "text-blue-900" : "text-gray-600"
                }`}
                onClick={() => setResourcesOpen(!resourcesOpen)}
              >
                Resources
                {resourcesOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>

              {resourcesOpen && (
                <div className="w-full mt-4 space-y-6 px-2">
                  {/* Blogs */}
                  <Link href="/resources/blogs" className="block" onClick={() => setIsOpen(false)}>
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      <h3 className="text-lg font-medium p-4">Blogs</h3>
                      <div className="relative h-32">
                        <Image src="/focused-coder.png" alt="Blogs" fill className="object-cover" />
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-600">
                          Stay updated with our latest articles on financial planning and family security.
                        </p>
                      </div>
                    </div>
                  </Link>

                  {/* Help Guides */}
                  <Link href="/resources/guides" className="block" onClick={() => setIsOpen(false)}>
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
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
                  </Link>

                  {/* Video Library */}
                  <Link href="/resources/videos" className="block" onClick={() => setIsOpen(false)}>
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      <h3 className="text-lg font-medium p-4">Video Library</h3>
                      <div className="relative h-32">
                        <Image src="/simple-video-player.png" alt="Video Library" fill className="object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white bg-opacity-75 flex items-center justify-center">
                            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-blue-600 border-b-8 border-b-transparent ml-1"></div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                          LIVE
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-600">
                          Watch tutorials, webinars, and expert interviews on legacy planning.
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="flex justify-end">
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Financial Planning
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/about-us"
              className={`text-lg font-medium ${pathname === "/about-us" ? "text-blue-900" : "text-gray-600"}`}
              onClick={() => setIsOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/contact-us"
              className={`text-lg font-medium ${pathname === "/contact-us" ? "text-blue-900" : "text-gray-600"}`}
              onClick={() => setIsOpen(false)}
            >
              Contact Us
            </Link>

            <div className="flex flex-col gap-3 w-full mt-4">
              <Link href="/auth/login" className="text-center text-gray-700 py-2" onClick={() => setIsOpen(false)}>
                Login
              </Link>
              <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-blue-900 text-white">
                  Register
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
