import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import AdminWrapper from '@/components/AdminWrapper'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: "Bruno's Dictionary",
  description: "Brown University's student-run slang dictionary",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense Code */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9062937758410331"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <AdminWrapper />
        </Providers>
      </body>
    </html>
  )
} 