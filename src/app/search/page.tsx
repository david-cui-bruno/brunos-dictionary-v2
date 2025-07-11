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
    <div className="min-h-screen bg-paper-white">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Results Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brown-primary mb-2">
            Search Results
          </h1>
          {searchParams.q && (
            <p className="text-gray-600">
              Results for "{searchParams.q}"
            </p>
          )}
        </div>

        {/* Results Container - Centered 700px column */}
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
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchParams.q ? 'No words found matching your search.' : 'No words available yet.'}
              </p>
            </div>
          )}
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
    <Card className="relative overflow-hidden">
      <div className="p-5">
        {/* Header and By-line */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-brown-primary mb-1">
              <Link 
                href={`/search?q=${encodeURIComponent(word)}`}
                className="hover:text-brown-600 transition-colors cursor-pointer"
              >
                {word}
              </Link>
            </h3>
            <div className="text-sm text-gray-500">
              by {definition.created_by || 'Anonymous'}, {definition.created_at ? new Date(definition.created_at).toLocaleDateString() : 'Unknown date'}
            </div>
          </div>
        </div>

        {/* Definition Text */}
        <div className="mb-4">
          <p className="text-base leading-relaxed text-gray-800">
            {definition.body}
          </p>
        </div>

        {/* Example */}
        {definition.example && (
          <div className="mb-4 pl-4 border-l-2 border-gray-200">
            <p className="text-sm text-gray-600 italic">
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
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full border border-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Vote Bar and Share Row */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Vote Bar */}
          <VoteButtons 
            definitionId={definition.id}
            initialScore={definition.score || 0}
            initialUserVote={0}
          />

          {/* Share Row */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1 h-auto text-blue-600 hover:text-blue-700"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}