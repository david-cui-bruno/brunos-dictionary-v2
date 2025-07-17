'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

interface LeaderboardWord {
  id: string
  word: string
  score: number
  previousRank?: number
}

export default function LiveLeaderboard() {
  const [words, setWords] = useState<LeaderboardWord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch('/api/leaderboard')
      const data = await response.json()
      
      if (response.ok) {
        setWords(data.words || [])
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard()
    
    // Set up real-time updates with longer interval to reduce re-renders
    const interval = setInterval(fetchLeaderboard, 10000) // Poll every 10 seconds instead of 5
    
    return () => clearInterval(interval)
  }, [fetchLeaderboard])

  // Handle real-time vote updates - only update if the word is actually in the top 3
  useEffect(() => {
    const handleVoteUpdate = (event: CustomEvent) => {
      const { definitionId, newScore } = event.detail
      
      setWords(prevWords => {
        const updatedWords = prevWords.map(word => {
          // Find if this word has the definition that was voted on
          if (word.definitions?.some(def => def.id === definitionId)) {
            return {
              ...word,
              score: newScore,
              previousRank: word.rank
            }
          }
          return word
        }).sort((a, b) => b.score - a.score)
        
        // Only update if the word is still in top 3
        return updatedWords.slice(0, 3)
      })
    }

    window.addEventListener('voteUpdate', handleVoteUpdate as EventListener)
    return () => window.removeEventListener('voteUpdate', handleVoteUpdate as EventListener)
  }, [])

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return '🥇'
      case 1:
        return '🥈'
      case 2:
        return '🥉'
      default:
        return `#${index + 1}`
    }
  }

  if (isLoading) {
    return (
      <div className="bruno-card max-w-md mx-auto h-[284px] flex flex-col justify-center">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[#FAF7F3] rounded-[2px] border border-[#8E8B82] animate-pulse">
              <div className="flex items-center space-x-4">
                <span className="text-lg font-bold w-8 text-center">#{i}</span>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-8"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bruno-card max-w-md mx-auto h-[284px] flex flex-col justify-center">
      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {words.slice(0, 3).map((word, index) => (
            <motion.div
              key={word.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 40,
                mass: 1.2,
                duration: 0.8
              }}
              className="flex items-center justify-between p-4 bg-[#FAF7F3] rounded-md border border-[#8E8B82]"
            >
              <div className="flex items-center space-x-4">
                <motion.span
                  layout
                  className="text-lg font-bold w-8 text-center"
                >
                  {getRankIcon(index)}
                </motion.span>
                <div>
                  <Link 
                    href={`/search?q=${encodeURIComponent(word.word)}`}
                    className="hover:text-[#4E3629]/80 transition-colors"
                  >
                    <motion.h3 
                      layout
                      className="text-lg font-playfair font-semibold text-[#4E3629] cursor-pointer"
                    >
                      {word.word}
                    </motion.h3>
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#8E8B82]">
                <TrendingUp className="h-4 w-4" />
                <motion.span 
                  layout
                  className="text-sm font-medium"
                  key={word.score} // Force re-render when score changes
                >
                  {word.score}
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  )
} 