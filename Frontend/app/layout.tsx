import type React from "react"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { Toaster } from "react-hot-toast"
import { UnreadMessagesProvider } from "@/lib/UnreadMessagesContext"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata = {
  title: "ConnectHub - Professional Community Platform",
  description: "Connect with professionals in your field and build meaningful relationships.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <UnreadMessagesProvider>
            <Toaster position="top-center" />
            {children}
          </UnreadMessagesProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
