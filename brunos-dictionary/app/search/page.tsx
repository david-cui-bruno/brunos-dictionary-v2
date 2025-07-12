"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import { WordCard } from "@/components/word-card"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [hasSearched, setHasSearched] = useState(false)

  const allWords = [
    {
      word: "Ratty",
      definition:
        "The Sharpe Refectory, Brown's main dining hall known for its distinctive brutalist architecture and legendary weekend brunch.",
      example: "I'll meet you at the Ratty for Sunday brunch - hope they have the good pancakes today!",
      tags: ["dining", "campus", "food"],
      votes: 127,
    },
    {
      word: "The Rock",
      definition: "The iconic painted rock on campus that student organizations use to advertise events and messages.",
      example: "Did you see what they painted on The Rock this morning? It's hilarious!",
      tags: ["campus", "tradition", "art"],
      votes: 98,
    },
    {
      word: "Slugfest",
      definition:
        "An intense study session, usually before finals, characterized by long hours and excessive caffeine consumption.",
      example: "I'm going into full slugfest mode this week - see you after finals!",
      tags: ["academics", "studying", "finals"],
      votes: 45,
    },
  ]

  const filteredWords = query
    ? allWords.filter(
        (word) =>
          word.word.toLowerCase().includes(query.toLowerCase()) ||
          word.definition.toLowerCase().includes(query.toLowerCase()) ||
          word.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
      )
    : []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setHasSearched(true)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-playfair font-bold text-[#4E3629]">Search Bruno's Dictionary</h1>
        <p className="text-[#8E8B82]">Find Brown University slang terms, definitions, and examples</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bruno-card">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8E8B82]" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for words, definitions, or tags..."
              className="w-full pl-10 pr-4 py-3 border border-[#8E8B82] rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[#4E3629] focus:border-transparent"
            />
          </div>
          <button type="submit" className="bruno-button">
            Search
          </button>
        </div>
      </form>

      {/* Search Results */}
      {hasSearched && (
        <div>
          {query && <h2 className="text-2xl font-playfair font-bold text-[#4E3629] mb-6">Results for '{query}'</h2>}

          {filteredWords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredWords.map((word, index) => (
                <WordCard
                  key={index}
                  word={word.word}
                  definition={word.definition}
                  example={word.example}
                  tags={word.tags}
                  votes={word.votes}
                  showSharing={true}
                />
              ))}
            </div>
          ) : (
            <div className="bruno-card text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-playfair font-bold text-[#4E3629] mb-2">
                No words found matching your search
              </h3>
              <p className="text-[#8E8B82] mb-6">Try searching for different terms or browse our recent additions.</p>
              <button
                onClick={() => {
                  setQuery("")
                  setHasSearched(false)
                }}
                className="bruno-button"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
