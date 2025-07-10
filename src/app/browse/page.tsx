import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import WordCard from '@/components/WordCard'
import { getWords } from '@/lib/db'

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const words = await getWords(searchParams.q)

  return (
    <div className="min-h-screen bg-paper-white">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Words Grid */}
        {words.data && words.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {words.data.map((word) => (
              <WordCard
                key={word.id}
                word={word.word}
                definition={word.definitions?.[0]?.body || "No definition available"}
                example={word.definitions?.[0]?.example}
                slug={word.slug}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchParams.q ? 'No words found matching your search.' : 'No words available yet.'}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
 