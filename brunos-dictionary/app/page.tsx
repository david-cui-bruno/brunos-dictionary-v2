import { WordCard } from "@/components/word-card"
import { Leaderboard } from "@/components/leaderboard"

export default function HomePage() {
  const wordOfTheDay = {
    word: "Ratty",
    definition:
      "The Sharpe Refectory, Brown's main dining hall known for its distinctive brutalist architecture and legendary weekend brunch.",
    example: "I'll meet you at the Ratty for Sunday brunch - hope they have the good pancakes today!",
    tags: ["dining", "campus", "food"],
    votes: 127,
  }

  const topWords = [
    { word: "Ratty", votes: 127, rank: 1 },
    { word: "The Rock", votes: 98, rank: 2 },
    { word: "Blueno", votes: 87, rank: 3 },
    { word: "Shopping Period", votes: 72, rank: 4 },
    { word: "The Hill", votes: 65, rank: 5 },
  ]

  const recentWords = [
    {
      word: "Blueno",
      definition: "Brown University's beloved bear mascot, often seen at sporting events and campus celebrations.",
      example: "Blueno showed up to the hockey game and got everyone hyped!",
      tags: ["mascot", "sports", "tradition"],
      votes: 87,
    },
    {
      word: "The Rock",
      definition: "The iconic painted rock on campus that student organizations use to advertise events and messages.",
      example: "Did you see what they painted on The Rock this morning? It's hilarious!",
      tags: ["campus", "tradition", "art"],
      votes: 98,
    },
    {
      word: "Shopping Period",
      definition:
        "The first two weeks of each semester when students can attend any class before finalizing their course schedule.",
      example: "I'm hitting five different classes during shopping period to see which professor I vibe with.",
      tags: ["academics", "registration", "classes"],
      votes: 72,
    },
  ]

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-playfair font-bold text-[#4E3629]">Bruno's Dictionary</h1>
        <p className="text-xl text-[#8E8B82] max-w-2xl mx-auto">Learn Brown University slang, one word at a time.</p>
      </div>

      {/* Word of the Day */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-playfair font-bold text-[#4E3629] mb-2">Word of the Day</h2>
          <p className="text-[#8E8B82]">Discover today's featured Brown slang term</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <WordCard
            word={wordOfTheDay.word}
            definition={wordOfTheDay.definition}
            example={wordOfTheDay.example}
            tags={wordOfTheDay.tags}
            votes={wordOfTheDay.votes}
          />
        </div>
      </section>

      {/* Top Words Leaderboard */}
      <section>
        <div className="max-w-2xl mx-auto">
          <Leaderboard words={topWords} />
        </div>
      </section>

      {/* Recent Additions */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-playfair font-bold text-[#4E3629] mb-2">Recent Additions</h2>
          <p className="text-[#8E8B82]">Fresh slang from the Brown community</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentWords.map((word, index) => (
            <WordCard
              key={index}
              word={word.word}
              definition={word.definition}
              example={word.example}
              tags={word.tags}
              votes={word.votes}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
