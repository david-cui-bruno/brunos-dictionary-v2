'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import VoteButtons from '@/components/VoteButtons'
import FlagButton from '@/components/FlagButton'
import { Share2 } from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  id: string
  body: string
  example?: string
  score: number
  created_at: string
  words: {
    id: string
    word: string
    slug: string
  }
  users: {
    username: string
  }
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true) // Start with loading true
  const [hasSearched, setHasSearched] = useState(false) // Track if we've performed a search

  useEffect(() => {
    if (query.trim()) {
      setLoading(true)
      setHasSearched(true)
      searchWords()
    } else {
      setLoading(false)
      setHasSearched(false)
    }
  }, [query])

  const searchWords = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
      } else {
        const errorData = await response.json()
        console.error('Search error data:', errorData)
        setResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F3]">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Search Header */}
          <div className="text-center space-y-4">
            {query ? (
              <>
                <h1 className="text-4xl font-playfair font-bold text-[#4E3629]">
                  Results for "{query}"
                </h1>
                {!loading && (
                  <p className="text-[#8E8B82]">
                    {results.length > 0 
                      ? `Found ${results.length} result${results.length === 1 ? '' : 's'}`
                      : 'No results found'
                    }
                  </p>
                )}
              </>
            ) : (
              <>
                <h1 className="text-4xl font-playfair font-bold text-[#4E3629]">
                  Search Bruno's Dictionary
                </h1>
                <p className="text-[#8E8B82]">Find Brown University slang terms, definitions, and examples</p>
              </>
            )}
          </div>

          {/* Results Container */}
          <div className="max-w-[700px] mx-auto">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : hasSearched && results.length === 0 ? (
              <div className="bruno-card text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-playfair font-bold text-[#4E3629] mb-2">No results found</h3>
                <p className="text-[#8E8B82] mb-4">Try searching for a different term</p>
                <Link 
                  href="/add" 
                  className="inline-flex items-center px-4 py-2 bg-[#4E3629] text-white rounded-md hover:bg-[#4E3629]/80 transition-colors"
                >
                  Add New Word
                </Link>
              </div>
            ) : hasSearched && results.length > 0 ? (
              <div className="space-y-4">
                {results.map((result) => (
                  <DefinitionCard 
                    key={result.id}
                    definition={result}
                    word={result.words.word}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

// Definition Card Component
function DefinitionCard({ 
  definition, 
  word
}: { 
  definition: SearchResult
  word: string
}) {
  return (
    <div className="bruno-card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-5xl font-playfair font-semibold text-[#4E3629] mb-1">
            <Link 
              href={`/search?q=${encodeURIComponent(word)}`}
              className="hover:text-[#4E3629]/80 transition-colors cursor-pointer"
            >
              {word}
            </Link>
          </h3>
        </div>
        {/* Share button in top right */}
        <div className="flex items-center">
          <button 
            className="p-2 rounded-[2px] hover:bg-[#8E8B82] hover:text-white transition-colors"
            aria-label="Share definition"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Definition Text */}
      <div className="mb-4">
        <p className="text-lg leading-relaxed text-[#4E3629]">
          {definition.body}
        </p>
        {/* Only show username or Anonymous */}
        <div className="text-sm text-[#8E8B82] mt-2">
          by {definition.users?.username || 'Anonymous'}, {definition.created_at ? 
            new Date(definition.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Unknown date'}
        </div>
      </div>

      {/* Example */}
      {definition.example && (
        <div className="mb-4 pl-4 border-l-2 border-[#8E8B82]">
          <p className="text-sm text-[#8E8B82] italic">
            "{definition.example}"
          </p>
        </div>
      )}

      {/* Vote Bar and Flag Button */}
      <div className="flex items-center justify-between pt-4 border-t border-[#8E8B82]/20">
        <VoteButtons 
          definitionId={definition.id}
          initialScore={definition.score || 0}
          initialUserVote={0}
        />
        <FlagButton definitionId={definition.id} />
      </div>
    </div>
  )
}

// Loading component
function SearchPageLoading() {
  return (
    <div className="min-h-screen bg-[#FAF7F3]">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-64 mx-auto"></div>
          </div>
          <div className="max-w-[700px] mx-auto space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchPageContent />
    </Suspense>
  )
}