'use client'

import { useState, useEffect } from 'react'
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
    username: string  // Changed from name to username
  }
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.trim()) {
      searchWords()
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
      }
    } catch (error) {
      console.error('Search error:', error)
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
                <p className="text-[#8E8B82]">
                  {results.length > 0 
                    ? `Found ${results.length} result${results.length === 1 ? '' : 's'}`
                    : 'No results found'
                  }
                </p>
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
            ) : results.length === 0 ? (
              <div className="bruno-card text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-playfair font-bold text-[#4E3629] mb-2">
                  {query ? 'No words found matching your search' : 'No words available yet'}
                </h3>
                <p className="text-[#8E8B82] mb-6">
                  {query 
                    ? 'Try searching for different terms or browse our recent additions.'
                    : 'Be the first to add words to the dictionary!'
                  }
                </p>
                {!query && (
                  <Link href="/add">
                    <button className="bruno-button">
                      Add Your First Word
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <DefinitionCard 
                    key={result.id}
                    definition={result}
                    word={result.words.word}
                  />
                ))}
              </div>
            )}
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