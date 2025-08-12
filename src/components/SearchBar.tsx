'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search, X, Shuffle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface SearchBarProps {
  mobile?: boolean
}

export default function SearchBar({ mobile = false }: SearchBarProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRandomizing, setIsRandomizing] = useState(false)
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

  const handleRandomWord = async () => {
    setIsRandomizing(true)
    try {
      const response = await fetch('/api/random-word')
      if (response.ok) {
        const { word } = await response.json()
        // Use window.location for a full page refresh to ensure the search page updates
        window.location.href = `/search?q=${encodeURIComponent(word.word)}`
      } else {
        toast.error('Failed to get random word')
      }
    } catch (error) {
      console.error('Error getting random word:', error)
      toast.error('Failed to get random word')
    } finally {
      setIsRandomizing(false)
    }
  }

  return (
    <div className="relative w-full">
      <form onSubmit={handleSearch} className="relative flex-1">
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

      {/* Random Word Button */}
      <button
        onClick={handleRandomWord}
        disabled={isRandomizing}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-[#8E8B82] hover:bg-[#8E8B82] hover:text-white transition-colors disabled:opacity-50 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8E8B82] focus:ring-opacity-50"
        title="Get random word"
      >
        {isRandomizing ? (
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
        ) : (
          <Shuffle className="h-4 w-4" />
        )}
      </button>
    </div>
  )
} 