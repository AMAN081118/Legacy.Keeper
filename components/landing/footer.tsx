import Link from "next/link"
import Image from "next/image"
import { Anchor } from "lucide-react"
import { Instagram, Twitter, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full bg-white pt-16 pb-8 px-4 border-t">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo and Description */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Anchor className="h-6 w-6 text-blue-800" />
              <span className="text-xl font-bold text-blue-800">Legacy Keeper</span>
            </Link>
            <p className="text-gray-600 text-sm mb-6">
              Secure your family's financial future with our comprehensive legacy planning platform.
            </p>
            <div className="flex items-center gap-4">
              <Image src="/paytm-logo.png" alt="Paytm" width={60} height={20} />
              <Image src="/phonepe-logo.png" alt="PhonePe" width={60} height={20} />
              <Image src="/bhim-logo.png" alt="BHIM" width={60} height={20} />
            </div>
          </div>

          {/* Products */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-800 mb-4">Products</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="text-gray-600 hover:text-blue-800 text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-blue-800 text-sm">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-800 mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/blogs" className="text-gray-600 hover:text-blue-800 text-sm">
                  Blogs
                </Link>
              </li>
              <li>
                <Link href="/user-guide" className="text-gray-600 hover:text-blue-800 text-sm">
                  User Guide
                </Link>
              </li>
              <li>
                <Link href="/webinars" className="text-gray-600 hover:text-blue-800 text-sm">
                  Webinars
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-600 hover:text-blue-800 text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-800 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about-us" className="text-gray-600 hover:text-blue-800 text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/help-center" className="text-gray-600 hover:text-blue-800 text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-blue-800 text-sm">
                  Terms
                </Link>
              </li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-6 mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <Link href="https://instagram.com" className="text-gray-600 hover:text-blue-800">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="https://twitter.com" className="text-gray-600 hover:text-blue-800">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="https://youtube.com" className="text-gray-600 hover:text-blue-800">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 mb-4 md:mb-0">Copyright © 2023 Legacy Keeper</p>
          <p className="text-sm text-gray-600">Developed By Legacy Keeper</p>
        </div>
      </div>
    </footer>
  )
}
