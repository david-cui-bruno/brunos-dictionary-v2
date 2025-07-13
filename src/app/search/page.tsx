import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import VoteButtons from '@/components/VoteButtons'
import { getWords } from '@/lib/db'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Share2, Copy } from 'lucide-react'
import Link from 'next/link'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const words = await getWords(searchParams.q)

  return (
    <div className="min-h-screen bg-[#FAF7F3]">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Search Header */}
          <div className="text-center space-y-4">
            {searchParams.q ? (
              <>
                <h1 className="text-4xl font-playfair font-bold text-[#4E3629]">
                  Results for "{searchParams.q}"
                </h1>
                <p className="text-[#8E8B82]">
                  {words.data && words.data.length > 0 
                    ? `Found ${words.data.length} result${words.data.length === 1 ? '' : 's'}`
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
            {words.data && words.data.length > 0 ? (
              <div className="space-y-4">
                {words.data.flatMap((word) => 
                  word.definitions?.map((definition, defIndex) => (
                    <DefinitionCard 
                      key={definition.id}
                      definition={definition}
                      word={word.word}
                    />
                  )) || []
                )}
              </div>
            ) : (
              <div className="bruno-card text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-playfair font-bold text-[#4E3629] mb-2">
                  {searchParams.q ? 'No words found matching your search' : 'No words available yet'}
                </h3>
                <p className="text-[#8E8B82] mb-6">
                  {searchParams.q 
                    ? 'Try searching for different terms or browse our recent additions.'
                    : 'Be the first to add words to the dictionary!'
                  }
                </p>
                {!searchParams.q && (
                  <Link href="/add">
                    <Button className="bruno-button">
                      Add Your First Word
                    </Button>
                  </Link>
                )}
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
  definition: any
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
        {/* Moved share button to top right */}
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
          by {definition.author?.username || 'Anonymous'}, {definition.created_at ? 
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

      {/* Tags (if any) */}
      {definition.tags && definition.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {definition.tags.map((tag: string, index: number) => (
            <span 
              key={index}
              className="bruno-badge bruno-badge-tag"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Vote Bar */}
      <div className="flex items-center pt-4 border-t border-[#8E8B82]/20">
        <VoteButtons 
          definitionId={definition.id}
          initialScore={definition.score || 0}
          initialUserVote={0}
        />
      </div>
    </div>
  )
}