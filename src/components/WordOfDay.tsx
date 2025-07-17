'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface WordOfDayData {
  words: {
    word: string
    definitions: Array<{
      body: string
      example?: string
    }>
  }
}

interface WordOfDayProps {
  initialWord?: WordOfDayData | null
}

export default function WordOfDay({ initialWord }: WordOfDayProps) {
  const [word, setWord] = useState<WordOfDayData | null>(initialWord || null)
  const [loading, setLoading] = useState(!initialWord)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialWord) {
      fetch('/api/word-of-day')
        .then(res => {
          return res.json()
        })
        .then(data => {
          setWord(data.data)
        })
        .catch(err => {
          console.error('Error fetching word of day:', err)
          setError(err.message)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [initialWord])

  if (loading) {
    return (
      <div className="bruno-card text-center py-12 max-w-md mx-auto">
        <div className="text-6xl mb-4">⏳</div>
        <h3 className="text-xl font-playfair font-bold text-[#4E3629] mb-2">
          Loading word of the day...
        </h3>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bruno-card text-center py-12 max-w-md mx-auto">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-playfair font-bold text-[#4E3629] mb-2">
          Error loading word of the day
        </h3>
        <p className="text-[#8E8B82]">{error}</p>
      </div>
    )
  }

  if (!word?.words || !word.words.definitions || word.words.definitions.length === 0) {
    return (
      <div className="bruno-card text-center py-12 max-w-md mx-auto">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-playfair font-bold text-[#4E3629] mb-2">
          No word of the day available
        </h3>
        <p className="text-[#8E8B82]">Check back tomorrow for a new featured word!</p>
      </div>
    )
  }

  // Determine font size based on word length
  const getWordFontSize = (wordText: string) => {
    if (wordText.length <= 15) return 'text-5xl'
    if (wordText.length <= 25) return 'text-4xl'
    if (wordText.length <= 35) return 'text-3xl'
    return 'text-2xl'
  }

  // Truncate long text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="bruno-card max-w-md mx-auto h-[284px]">
      {/* Content wrapper - adjust top/bottom padding (py-8) to change card height */}
      <div className="flex flex-col items-center justify-between h-full py-8">
        <Link 
          href={`/search?q=${encodeURIComponent(word.words.word)}`}
          className="hover:text-[#4E3629]/80 transition-colors"
        >
          {/* Word title - dynamic font size based on length */}
          <h3 className={`${getWordFontSize(word.words.word)} font-playfair font-bold text-[#4E3629] text-center mb-6 leading-tight`}>
            {word.words.word}
          </h3>
        </Link>
        
        {/* Definition container - adjust left/right padding (px-6) */}
        <div className="w-full px-6">
          {/* Definition text - truncate if too long */}
          <p className="text-[#4E3629] text-lg mb-4 leading-relaxed text-center line-clamp-3">
            {truncateText(word.words.definitions[0]?.body ?? "No definition available", 200)}
          </p>
          {word.words.definitions[0]?.example && (
            // Example text - truncate if too long
            <p className="text-[#8E8B82] italic text-center text-lg line-clamp-2">
              "{truncateText(word.words.definitions[0].example, 150)}"
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 