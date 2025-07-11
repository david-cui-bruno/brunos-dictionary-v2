'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown } from 'lucide-react'

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
      <Button 
        variant="ghost" 
        size="sm" 
        className={`p-1 h-auto transition-colors ${
          userVote === 1 ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
        }`}
        onClick={() => handleVote('up')}
        disabled={isVoting}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <span className={`text-sm font-bold ${
        score > 0 ? 'text-black' : 
        score < 0 ? 'text-red-600' : 'text-gray-500'
      }`}>
        {score}
      </span>
      <Button 
        variant="ghost" 
        size="sm" 
        className={`p-1 h-auto transition-colors ${
          userVote === -1 ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
        }`}
        onClick={() => handleVote('down')}
        disabled={isVoting}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
    </div>
  )
} 