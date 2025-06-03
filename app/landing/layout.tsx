import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/landing/theme-provider"
import { Navbar } from "@/components/landing/navbar"
import { NavbarSpacer } from "@/components/landing/navbar-spacer"
import { Newsletter } from "@/components/landing/newsletter"
import { Footer } from "@/components/landing/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Legacy Keeper - Secure Financial Insights for Your Family",
  description: "Give your family the financial insights they need, with the security and privacy measures you demand.",
  keywords: "legacy keeper, financial planning, family finance, security, privacy",
  generator: 'v0.dev'
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <Navbar />
          <NavbarSpacer />
          {children}
          <Newsletter />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
} 