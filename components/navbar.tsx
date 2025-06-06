"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Legacy Keeper</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/features"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/features" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/pricing" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Pricing
            </Link>
            <Link
              href="/about-us"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/about-us" ? "text-foreground" : "text-foreground/60"
              )}
            >
              About
            </Link>
            <Link
              href="/contact-us"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/contact-us" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <Link
              href="/auth/login"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/auth/login" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/auth/register" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Register
            </Link>
          </nav>
        </div>
      </div>
    </nav>
  )
} 