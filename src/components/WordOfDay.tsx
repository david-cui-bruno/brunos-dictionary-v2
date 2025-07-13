'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface WordOfDayProps {
  initialWord?: any
}

export default function WordOfDay({ initialWord }: WordOfDayProps) {
  const [word, setWord] = useState(initialWord)
  const [loading, setLoading] = useState(!initialWord)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialWord) {
      console.log('Fetching word of day...')
      fetch('/api/word-of-day')
        .then(res => {
          console.log('API response status:', res.status)
          return res.json()
        })
        .then(data => {
          console.log('API response data:', data)
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

  return (
    // Update height from 400px to 300px
    <div className="bruno-card max-w-md mx-auto h-[284px]">
      {/* Content wrapper - adjust top/bottom padding (py-8) to change card height */}
      <div className="flex flex-col items-center justify-between h-full py-8">
        <Link 
          href={`/search?q=${encodeURIComponent(word.words.word)}`}
          className="hover:text-[#4E3629]/80 transition-colors"
        >
          {/* Word title - adjust font size (text-4xl) and bottom margin (mb-6) */}
          <h3 className="text-5xl font-playfair font-bold text-[#4E3629] text-center mb-6">
            {word.words.word}
          </h3>
        </Link>
        
        {/* Definition container - adjust left/right padding (px-6) */}
        <div className="w-full px-6">
          {/* Definition text - adjust font size (text-lg) and bottom margin (mb-4) */}
          <p className="text-[#4E3629] text-lg mb-4 leading-relaxed text-center">
            {word.words.definitions[0]?.body ?? "No definition available"}
          </p>
          {word.words.definitions[0]?.example && (
            // Example text - adjust font size (text-lg)
            <p className="text-[#8E8B82] italic text-center text-lg">
              "{word.words.definitions[0].example}"
            </p>
          )}
        </div>

        {/* Score container - adjust top margin (mt-6) */}
        <div className="mt-6 flex items-center gap-1 text-[#8E8B82]">
          {/* Score text - adjust font size (text-sm) */}
          <span className="text-sm font-medium">
            Score: {word.words.definitions[0]?.score || 0}
          </span>
        </div>
      </div>
    </div>
  )
} 