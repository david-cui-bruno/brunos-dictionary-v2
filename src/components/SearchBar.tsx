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
    
    console.log(`🎲 [${actionId}] Random button clicked at ${new Date().toISOString()}`)
    console.log(`📍 [${actionId}] Current location:`, {
      href: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      origin: window.location.origin
    })
    
    setIsRandomizing(true)
    console.log(`⏳ [${actionId}] Set loading state to true`)
    
    try {
      // Get current word from URL if on search page
      const currentWord = window.location.search.includes('q=') 
        ? new URLSearchParams(window.location.search).get('q')
        : null
      
      console.log(`🔍 [${actionId}] Current word extracted:`, currentWord)
      
      const url = currentWord 
        ? `/api/random-word?current=${encodeURIComponent(currentWord)}`
        : '/api/random-word'
      
      console.log(`🌐 [${actionId}] Fetching from URL:`, url)
      console.log(` [${actionId}] Full URL:`, window.location.origin + url)
      
      // Log request details
      console.log(`📤 [${actionId}] Request details:`, {
        method: 'GET',
        url: url,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timestamp: new Date().toISOString()
      })
      
      const fetchStartTime = Date.now()
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      const fetchEndTime = Date.now()
      console.log(`⏱️ [${actionId}] Fetch completed in ${fetchEndTime - fetchStartTime}ms`)
      console.log(`📥 [${actionId}] Response received:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        type: response.type,
        url: response.url
      })
      
      // Log response headers
      const responseHeaders = Object.fromEntries(response.headers.entries())
      console.log(`📋 [${actionId}] Response headers:`, responseHeaders)
      
      if (response.ok) {
        console.log(`✅ [${actionId}] Response is OK, parsing JSON...`)
        
        const parseStartTime = Date.now()
        const data = await response.json()
        const parseEndTime = Date.now()
        
        console.log(`⏱️ [${actionId}] JSON parsed in ${parseEndTime - parseStartTime}ms`)
        console.log(`📊 [${actionId}] Response data:`, data)
        
        if (data.word && data.word.word) {
          console.log(`🎯 [${actionId}] Valid word data found:`, {
            word: data.word.word,
            wordId: data.word.id,
            hasDefinitions: !!data.word.definitions,
            definitionCount: data.word.definitions?.length || 0
          })
          
          const newUrl = `/search?q=${encodeURIComponent(data.word.word)}`
          console.log(`🔗 [${actionId}] Constructed new URL:`, newUrl)
          console.log(` [${actionId}] Full new URL:`, window.location.origin + newUrl)
          
          // Log navigation attempt
          console.log(`🚀 [${actionId}] Attempting navigation to:`, newUrl)
          console.log(`🚀 [${actionId}] Current time:`, new Date().toISOString())
          
          try {
            window.location.href = newUrl
            console.log(`✅ [${actionId}] Navigation initiated successfully`)
          } catch (navError: unknown) {
            console.error(`❌ [${actionId}] Navigation error:`, navError)
            console.error(`❌ [${actionId}] Navigation error details:`, {
              error: navError,
              message: navError instanceof Error ? navError.message : 'Unknown error',
              stack: navError instanceof Error ? navError.stack : 'No stack trace'
            })
            
            // Fallback to router
            console.log(`🔄 [${actionId}] Attempting fallback navigation with router...`)
            router.push(newUrl)
          }
        } else {
          console.error(`❌ [${actionId}] Invalid word data structure:`, {
            hasData: !!data,
            hasWord: !!data?.word,
            wordType: typeof data?.word,
            wordKeys: data?.word ? Object.keys(data.word) : 'NONE',
            wordValue: data?.word?.word || 'NONE'
          })
          toast.error('Invalid response from server')
        }
      } else {
        console.error(`❌ [${actionId}] Response not OK, status: ${response.status}`)
        
        const errorText = await response.text()
        console.error(`❌ [${actionId}] Error response text:`, errorText)
        
        try {
          const errorData = JSON.parse(errorText)
          console.error(`❌ [${actionId}] Parsed error data:`, errorData)
        } catch (parseError) {
          console.error(`❌ [${actionId}] Failed to parse error response as JSON:`, parseError)
        }
        
        toast.error(`API error: ${response.status}`)
      }
    } catch (error: unknown) {
      const totalTime = Date.now() - startTime
      console.error(`💥 [${actionId}] Random word fetch error after ${totalTime}ms:`, error)
      console.error(`💥 [${actionId}] Error details:`, {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        type: typeof error,
        constructor: error instanceof Error ? error.constructor.name : 'Unknown'
      })
      toast.error('Failed to get random word')
    } finally {
      const totalTime = Date.now() - startTime
      console.log(`🏁 [${actionId}] Random word process completed in ${totalTime}ms`)
      console.log(`⏳ [${actionId}] Setting loading state to false`)
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