'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

interface Definition {
  id: string
  score: number | null
}

interface LeaderboardWord {
  id: string
  word: string
  score: number
  previousRank?: number
  definitions?: Definition[]
}

export default function LiveLeaderboard() {
  const [words, setWords] = useState<LeaderboardWord[]>([])
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())

  const fetchLeaderboard = useCallback(async () => {
    try {
      console.log('🔄 Fetching leaderboard data...')
      const response = await fetch('/api/leaderboard', {
        cache: 'no-store' as RequestCache,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      const data = await response.json()
      
      if (response.ok) {
        console.log('✅ Leaderboard data received:', data.words?.length || 0, 'words')
        setWords(data.words || [])
        setLastUpdate(Date.now())
      } else {
        console.error('❌ Leaderboard fetch failed:', data)
      }
    } catch (error) {
      console.error('❌ Error fetching leaderboard:', error)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard()
    
    const interval = setInterval(fetchLeaderboard, 3000)
    
    return () => clearInterval(interval)
  }, [fetchLeaderboard])

  // Enhanced real-time vote update handling
  useEffect(() => {
    const handleVoteUpdate = (event: CustomEvent) => {
      const { definitionId, newScore, wordId } = event.detail
      console.log('🎯 Vote update received:', { definitionId, newScore, wordId })
      
      setWords(prevWords => {
        const updatedWords = prevWords.map(word => {
          // Check if this word has the updated definition
          if (word.definitions?.some(def => def.id === definitionId) || word.id === wordId) {
            console.log('🔄 Updating word in leaderboard:', word.word, 'new score:', newScore)
            return {
              ...word,
              score: newScore,
              previousRank: word.previousRank
            }
          }
          return word
        })
        
        // Sort by score and take top 3
        const sortedWords = updatedWords.sort((a, b) => (b.score - a.score))
        const topWords = sortedWords.slice(0, 3)
        
        console.log('📊 Leaderboard updated, new top words:', topWords.map(w => `${w.word}: ${w.score}`))
        return topWords
      })
      
      // Force a refresh after vote update to ensure accuracy
      setTimeout(() => {
        console.log('🔄 Forcing leaderboard refresh after vote update...')
        fetchLeaderboard()
      }, 500)
    }

    // Listen for vote updates
    window.addEventListener('voteUpdate', handleVoteUpdate as EventListener)
    
    // Listen for custom vote events
    window.addEventListener('voteChanged', handleVoteUpdate as EventListener)
    
    return () => {
      window.removeEventListener('voteUpdate', handleVoteUpdate as EventListener)
      window.removeEventListener('voteChanged', handleVoteUpdate as EventListener)
    }
  }, [fetchLeaderboard])

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

  if (words.length === 0) {
    return (
      <div className="bruno-card h-full">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-playfair font-bold text-[#4E3629] mb-2">No words yet</h3>
            <p className="text-[#8E8B82]">Be the first to add words!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bruno-card h-full">
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-full px-6">
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
                  className="flex items-center justify-between p-4 bg-[#FAF7F3] rounded-[2px] border border-[#8E8B82]"
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
                      key={word.score}
                    >
                      {word.score}
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
} 