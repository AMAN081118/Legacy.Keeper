import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LoadingProvider } from "@/components/providers/loading-provider"
// Import the Toaster component
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/landing/navbar"
import { NavbarSpacer } from "@/components/landing/navbar-spacer"
import { Newsletter } from "@/components/landing/newsletter"

const inter = Inter({
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
  preload: true
})

export const metadata: Metadata = {
  title: "Legacy Keeper",
  description: "Your All-in-One Solution for Secure Financial Management, Investments, and Loan Tracking",
  generator: 'v0.dev',
  // Add performance hints
  other: {
    'theme-color': '#ffffff',
    'color-scheme': 'light',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://fxtxegzuubiunsanfzbb.supabase.co" />
      </head>
      <body className={inter.className}>
        <LoadingProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </LoadingProvider>
      </body>
    </html>
  )
}
