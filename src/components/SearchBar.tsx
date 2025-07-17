'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  mobile?: boolean
}

export default function SearchBar({ mobile = false }: SearchBarProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      setIsLoading(true)
      try {
        await router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <Search 
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 
          text-[#8E8B82] h-4 w-4 transition-opacity
          ${isLoading ? 'animate-spin' : ''}`}
      />
      
      <Input
        ref={searchInputRef}
        type="text"
        placeholder="Search words..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={`pl-10 pr-10 bg-white text-[#65271c] 
          placeholder:text-[#8E8B82] border-[#8E8B82]
          focus:border-white focus:ring-white
          hover:border-[#65271c]
          transition-colors
          rounded-md
          ${mobile ? 'w-full' : ''}`}
        disabled={isLoading}
      />

      {searchTerm && (
        <button
          type="button"
          onClick={() => {
            setSearchTerm("")
            setTimeout(() => {
              searchInputRef.current?.focus()
            }, 0)
          }}
          className="absolute right-3 top-1/2 transform -translate-y-1/2
            text-[#8E8B82] hover:text-[#65271c] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  )
} 