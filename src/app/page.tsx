import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import WordCard from '@/components/WordCard'
import { getWordOfDay, getWords } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import { TrendingUp } from 'lucide-react'

export default async function HomePage() {
  // Fetch word of the day, recent words, and popular words
  const [wordOfDay, recentWords, popularWords] = await Promise.all([
    getWordOfDay(),
    getWords(),
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

  // Add debugging
  console.log('=== DEBUG ===')
  console.log('Word of day:', wordOfDay)
  console.log('Recent words:', recentWords)
  console.log('Popular words:', processedPopularWords)
  console.log('================')

  return (
    <div className="min-h-screen bg-paper-white">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-brown-primary mb-6">
            Bruno's Dictionary
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Welcome Brunonians! Learn Brown University slang, one word at a time.
          </p>
        </div>

        {/* Word of the Day and Leaderboard Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Word of the Day */}
          <div>
            <h2 className="text-3xl font-semibold text-brown-primary mb-8 text-center">
              Word of the Day
            </h2>
            {wordOfDay.data?.words ? (
              <div className="max-w-2xl mx-auto">
                <WordCard 
                  word={wordOfDay.data.words.word}
                  definition={wordOfDay.data.words.definitions?.[0]?.body ?? "No definition available"}
                  example={wordOfDay.data.words.definitions?.[0]?.example ?? ""}
                  slug={wordOfDay.data.words.slug}
                  definitionId={wordOfDay.data.words.definitions?.[0]?.id ?? ""}
                  score={wordOfDay.data.words.definitions?.[0]?.score ?? 0}
                />
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No word of the day available
              </div>
            )}
          </div>

          {/* Popular Words Leaderboard */}
          <div>
            <h2 className="text-3xl font-semibold text-brown-primary mb-8 text-center">
              Top Words
            </h2>
            {processedPopularWords.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="space-y-3">
                  {processedPopularWords.slice(0, 5).map((word, index) => (
                    <div key={word.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      {/* Rank and Word */}
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white
                          ${index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-amber-600' : 
                            'bg-gray-300'}
                        `}>
                          {index + 1}
                        </div>
                        
                        {/* Word */}
                        <div>
                          <h3 className="font-semibold text-brown-primary">
                            {word.word}
                          </h3>
                        </div>
                      </div>
                      
                      {/* Vote Count */}
                      <div className="flex items-center gap-1 text-gray-500">
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
              <div className="text-center text-gray-500">
                No popular words yet
              </div>
            )}
          </div>
        </div>

        {/* Recent Words */}
        {recentWords.data && recentWords.data.length > 0 && (
          <section>
            <h2 className="text-3xl font-semibold text-brown-primary mb-8 text-center">
              Recent Additions
            </h2>
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
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
} 