import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "MetaMentor AI Workspace",
  description: "AI Operating System for Teams",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
