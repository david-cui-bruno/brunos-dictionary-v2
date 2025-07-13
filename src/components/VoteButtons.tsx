'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface VoteButtonsProps {
  definitionId: string
  initialScore: number
  initialUserVote: number
  className?: string
}

export default function VoteButtons({ 
  definitionId, 
  initialScore, 
  initialUserVote,
  className = ""
}: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore)
  const [userVote, setUserVote] = useState(initialUserVote)
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = async (action: 'up' | 'down') => {
    if (isVoting) return

    setIsVoting(true)
    
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          definition_id: definitionId,
          action: action
        })
      })

      const data = await response.json()

      if (response.ok) {
        setScore(data.counts.netScore)
        setUserVote(data.vote)
      } else {
        console.error('Vote failed:', data.error)
      }
    } catch (error) {
      console.error('Vote error:', error)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={() => handleVote('up')}
        disabled={isVoting}
        className={`p-2 rounded-[2px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          userVote === 1 
            ? 'bg-[#317a22] text-white' 
            : 'text-[#8E8B82] hover:bg-[#317a22] hover:text-white'
        }`}
        aria-label="Vote up"
      >
        <ThumbsUp size={16} />
      </button>
      
      <span className={`text-sm font-medium ${
        score > 0 ? 'text-[#317a22]' : 
        score < 0 ? 'text-[#ad4545]' : 'text-[#8E8B82]'
      }`}>
        {score}
      </span>
      
      <button
        onClick={() => handleVote('down')}
        disabled={isVoting}
        className={`p-2 rounded-[2px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          userVote === -1 
            ? 'bg-[#ad4545] text-white' 
            : 'text-[#8E8B82] hover:bg-[#ad4545] hover:text-white'
        }`}
        aria-label="Vote down"
      >
        <ThumbsDown size={16} />
      </button>
    </div>
  )
} 