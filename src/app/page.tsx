export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store';

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import WordCard from '@/components/WordCard'
import { getWordOfDay, getWords } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import { TrendingUp } from 'lucide-react'
import Link from 'next/link'
import WordOfDay from '@/components/WordOfDay'

type Props = {
  searchParams: { refresh?: string }
}

export default async function HomePage({ searchParams }: Props) {
  // Force revalidation when refresh parameter is present
  const shouldRevalidate = !!searchParams.refresh;

  // Fetch data with cache-busting headers if needed
  const fetchOptions = shouldRevalidate ? {
    cache: 'no-store' as RequestCache,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  } : undefined;

  // Fetch word of the day, recent words, and popular words
  const [wordOfDay, recentWords, popularWords] = await Promise.all([
    getWordOfDay(fetchOptions),
    getWords(undefined, fetchOptions),
    // Get popular words
    supabase
      .from('words')
      .select(`
        *,
        definitions!inner(
          id,
          body,
          example,
          score,
          status
        )
      `)
      .eq('definitions.status', 'clean')
      .limit(20)
  ])

  // Process popular words to get the highest scoring definition for each word
  const processedPopularWords = popularWords.data?.map(word => {
    const highestScoreDef = word.definitions?.reduce((max, def) => 
      (def.score ?? 0) > (max.score ?? 0) ? def : max
    , word.definitions[0])
    
    return {
      ...word,
      definitions: [highestScoreDef]
    }
  }).sort((a, b) => {
    // Sort by the highest score definition
    const scoreA = a.definitions?.[0]?.score || 0
    const scoreB = b.definitions?.[0]?.score || 0
    return scoreB - scoreA // Descending order
  }) || []

  return (
    <div className="min-h-screen bg-[#FAF7F3]">
      <Navigation />
      
      <main className="container mx-auto px-8 sm:px-12 md:px-16 lg:px-24 xl:px-32 py-16 md:py-20 lg:py-24"> {/* Increased top/bottom padding */}
        <div className="space-y-16 md:space-y-36"> {/* Increased overall section spacing */}
          {/* Header */}
          <div className="text-center space-y-4"> {/* Increased space between title and subtitle */}
            <h1 className="text-5xl font-playfair font-bold text-[#4E3629]">Bruno's Dictionary</h1>
            <p className="text-xl text-[#8E8B82] max-w-2xl mx-auto">Learn Brown University slang, one word at a time.</p>
          </div>

          {/* Word of the Day and Leaderboard Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Word of the Day */}
            <section>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-playfair font-bold text-[#4E3629] mb-2">Word of the Day</h2>
                <p className="text-[#8E8B82]">Discover today's featured Brown slang term</p>
              </div>
              {/* Update height from 400px to 300px */}
              <div className="min-h-[300px]">
                <WordOfDay initialWord={wordOfDay.data} />
              </div>
            </section>

            {/* Popular Words Leaderboard */}
            <section>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-playfair font-bold text-[#4E3629] mb-2">Top Words</h2>
                <p className="text-[#8E8B82]">Most popular slang terms in the community</p>
              </div>
              {/* Update height from 400px to 300px */}
              <div className="min-h-[300px]">
                {processedPopularWords.length > 0 ? (
                  <div className="bruno-card max-w-md mx-auto">
                    <div className="space-y-4">
                      {processedPopularWords.slice(0, 3).map((word, index) => (
                        <div key={word.id} className="flex items-center justify-between p-4 bg-[#FAF7F3] rounded-[2px] border border-[#8E8B82]">
                          {/* Rank and Word */}
                          <div className="flex items-center space-x-4">
                            <span className={`bruno-badge ${index === 0 ? '' : index === 1 ? '' : index === 2 ? '' : 'bg-[#8E8B82] text-white'} text-lg font-bold w-8 text-center`}>
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </span>
                            
                            <div>
                              <Link 
                                href={`/search?q=${encodeURIComponent(word.word)}`}
                                className="hover:text-[#4E3629]/80 transition-colors"
                              >
                                <h3 className="text-lg font-playfair font-semibold text-[#4E3629] cursor-pointer">
                                  {word.word}
                                </h3>
                              </Link>
                            </div>
                          </div>
                          
                          {/* Vote Count */}
                          <div className="flex items-center gap-1 text-[#8E8B82]">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {word.definitions?.[0]?.score || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bruno-card text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-playfair font-bold text-[#4E3629] mb-2">
                      No popular words yet
                    </h3>
                    <p className="text-[#8E8B82]">Be the first to add words and build the community!</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Recent Words */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-playfair font-bold text-[#4E3629] mb-2">Recent Additions</h2>
              <p className="text-[#8E8B82]">Fresh slang from the Brown community</p>
            </div>

            {recentWords.data && recentWords.data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentWords.data.slice(0, 6).map((word) => (
                  <WordCard
                    key={word.id}
                    word={word.word}
                    definition={word.definitions?.[0]?.body || "No definition available"}
                    example={word.definitions?.[0]?.example}
                    slug={word.slug}
                    definitionId={word.definitions?.[0]?.id}
                    score={word.definitions?.[0]?.score || 0}
                  />
                ))}
              </div>
            ) : (
              <div className="bruno-card text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-playfair font-bold text-[#4E3629] mb-2">
                  No recent additions yet
                </h3>
                <p className="text-[#8E8B82] mb-6">Be the first to contribute to Bruno's Dictionary!</p>
                <Link href="/add" className="bruno-button inline-block">
                  Add Your First Word
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
} 