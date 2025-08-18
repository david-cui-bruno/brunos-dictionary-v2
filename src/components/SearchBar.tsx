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
    const startTime = Date.now()
    const actionId = Math.random().toString(36).substr(2, 9)
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎲 [${actionId}] Random button clicked`)
    }
    
    setIsRandomizing(true)
    
    try {
      // Get current word from URL if on search page
      const currentWord = window.location.search.includes('q=') 
        ? new URLSearchParams(window.location.search).get('q')
        : null
      
      const url = currentWord 
        ? `/api/random-word?current=${encodeURIComponent(currentWord)}`
        : '/api/random-word'
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.word && data.word.word) {
          const newUrl = `/search?q=${encodeURIComponent(data.word.word)}`
          
          try {
            window.location.href = newUrl
          } catch (navError: unknown) {
            console.error(`❌ [${actionId}] Navigation error:`, navError)
            // Fallback to router
            router.push(newUrl)
          }
        } else {
          toast.error('Invalid response from server')
        }
      } else {
        toast.error(`API error: ${response.status}`)
      }
    } catch (error: unknown) {
      const totalTime = Date.now() - startTime
      console.error(`💥 [${actionId}] Random word fetch error after ${totalTime}ms:`, error)
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