'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface VoteButtonProps {
  definitionId: string
  initialScore: number
  userVote?: number | null // -1 for downvote, 1 for upvote, null for no vote
  onVoteChange?: (newScore: number) => void
}

export default function VoteButton({ 
  definitionId, 
  initialScore, 
  userVote = null,
  onVoteChange 
}: VoteButtonProps) {
  const { data: session } = useSession()
  const [score, setScore] = useState(initialScore)
  const [currentVote, setCurrentVote] = useState(userVote)
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = async (voteValue: 1 | -1) => {
    if (!session) {
      // Redirect to sign in or show toast
      return
    }

    setIsVoting(true)

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          definitionId,
          vote: voteValue,
        }),
      })

      if (response.ok) {
        const { newScore, newUserVote } = await response.json()
        
        // Calculate score change
        let scoreChange = 0
        if (currentVote === null) {
          // First time voting
          scoreChange = voteValue
        } else if (currentVote === voteValue) {
          // Removing vote
          scoreChange = -voteValue
          setCurrentVote(null)
        } else {
          // Changing vote
          scoreChange = voteValue - currentVote
          setCurrentVote(voteValue)
        }

        const newTotalScore = score + scoreChange
        setScore(newTotalScore)
        onVoteChange?.(newTotalScore)
      }
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(1)}
        disabled={isVoting}
        className={cn(
          "h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600",
          currentVote === 1 && "bg-green-100 text-green-600"
        )}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      
      <span className={cn(
        "min-w-[2rem] text-center font-medium text-sm",
        score > 0 && "text-green-600",
        score < 0 && "text-red-600",
        score === 0 && "text-gray-500"
      )}>
        {score}
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(-1)}
        disabled={isVoting}
        className={cn(
          "h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600",
          currentVote === -1 && "bg-red-100 text-red-600"
        )}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  )
} 