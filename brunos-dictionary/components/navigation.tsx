"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Plus, User, Home } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-[#8E8B82] shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-playfair font-bold text-[#4E3629]">Bruno's Dictionary</h1>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-[2px] transition-colors ${
                pathname === "/" ? "bg-[#4E3629] text-white" : "text-[#4E3629] hover:bg-[#FAF7F3]"
              }`}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>

            <Link
              href="/search"
              className={`flex items-center space-x-1 px-3 py-2 rounded-[2px] transition-colors ${
                pathname === "/search" ? "bg-[#4E3629] text-white" : "text-[#4E3629] hover:bg-[#FAF7F3]"
              }`}
            >
              <Search size={18} />
              <span>Search</span>
            </Link>

            <Link
              href="/add"
              className={`flex items-center space-x-1 px-3 py-2 rounded-[2px] transition-colors ${
                pathname === "/add" ? "bg-[#4E3629] text-white" : "text-[#4E3629] hover:bg-[#FAF7F3]"
              }`}
            >
              <Plus size={18} />
              <span>Add Word</span>
            </Link>

            <Link
              href="/profile"
              className={`flex items-center space-x-1 px-3 py-2 rounded-[2px] transition-colors ${
                pathname === "/profile" ? "bg-[#4E3629] text-white" : "text-[#4E3629] hover:bg-[#FAF7F3]"
              }`}
            >
              <User size={18} />
              <span>Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
