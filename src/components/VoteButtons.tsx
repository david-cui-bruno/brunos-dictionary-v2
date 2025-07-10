'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface VoteButtonsProps {
  definitionId: string
  initialScore: number
  initialUserVote?: number
  onVoteChange?: (newScore: number, newUserVote: number) => void
}

export default function VoteButtons({ 
  definitionId, 
  initialScore, 
  initialUserVote = 0,
  onVoteChange 
}: VoteButtonsProps) {
  const { data: session } = useSession()
  const [score, setScore] = useState(initialScore)
  const [userVote, setUserVote] = useState(initialUserVote)
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = async (action: 'up' | 'down') => {
    if (!session) {
      toast.error('Please log in to vote')
      return
    }

    setIsVoting(true)

    // Optimistic UI update
    const oldVote = userVote
    let newVote: number
    let scoreChange: number

    if (action === 'up') {
      newVote = oldVote === 1 ? 0 : 1
      scoreChange = newVote - oldVote
    } else {
      newVote = oldVote === -1 ? 0 : -1
      scoreChange = newVote - oldVote
    }

    setUserVote(newVote)
    setScore(score + scoreChange)

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ definition_id: definitionId, action })
      })

      if (!response.ok) {
        throw new Error('Vote failed')
      }

      const data = await response.json()
      
      // Update with server response
      setScore(data.counts.netScore)
      setUserVote(data.vote)
      
      if (onVoteChange) {
        onVoteChange(data.counts.netScore, data.vote)
      }

      toast.success('Vote recorded!')

    } catch (error) {
      // Rollback optimistic update
      setUserVote(oldVote)
      setScore(score - scoreChange)
      toast.error('Failed to record vote')
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('up')}
        disabled={isVoting || !session}
        className={`p-1 h-8 w-8 transition-colors ${
          userVote === 1 
            ? 'text-green-600 bg-green-50 hover:bg-green-100' 
            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
        }`}
        title={session ? 'Upvote' : 'Log in to vote'}
      >
        <ChevronUp className="h-4 w-4" />
      </Button>

      <span className="text-sm font-medium min-w-[2rem] text-center">
        {score}
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('down')}
        disabled={isVoting || !session}
        className={`p-1 h-8 w-8 transition-colors ${
          userVote === -1 
            ? 'text-red-600 bg-red-50 hover:bg-red-100' 
            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
        }`}
        title={session ? 'Downvote' : 'Log in to vote'}
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  )
} 