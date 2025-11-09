import { Users } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-card/50 border-t border-border/50 py-12 px-4 backdrop-blur-sm">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-md">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-serif font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ConnectHub</span>
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              The professional networking platform designed for domain-specific connections. Build meaningful
              relationships with people who understand your journey.
            </p>
          </div>
          <div>
            <h3 className="font-serif font-semibold text-foreground mb-4">Communities</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/signup" className="hover:text-primary transition-colors">
                  Students
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-primary transition-colors">
                  Teachers
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-primary transition-colors">
                  Musicians
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-primary transition-colors">
                  Doctors
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-primary transition-colors">
                  Dancers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 ConnectHub. All rights reserved. Built for professionals, by professionals.</p>
        </div>
      </div>
    </footer>
  )
}
