import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google"
import "./globals.css"
import NavBar from "./components/NavBar"
import Footer from "./components/Footer"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
})

export const metadata = {
  title: "Prissammenligner",
  description: "Sammenlign priser på dagligvarer fra Oda, Meny og Spar",
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="no"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NavBar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
