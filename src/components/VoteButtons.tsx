'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface VoteButtonsProps {
  definitionId: string
  initialScore: number
  initialUserVote?: number
  className?: string
}

export default function VoteButtons({ 
  definitionId, 
  initialScore, 
  initialUserVote = 0,
  className = ""
}: VoteButtonsProps) {
  const { data: session } = useSession()
  const [score, setScore] = useState(initialScore)
  const [userVote, setUserVote] = useState(initialUserVote)
  const [isVoting, setIsVoting] = useState(false)
  const [isLoadingVoteState, setIsLoadingVoteState] = useState(true)

  // Fetch user's vote state when component mounts
  useEffect(() => {
    const fetchUserVote = async () => {
      if (!session?.user?.id || !definitionId) {
        setIsLoadingVoteState(false)
        return
      }

      try {
        const response = await fetch(`/api/vote/state?definition_id=${definitionId}`)
        if (response.ok) {
          const data = await response.json()
          setUserVote(data.userVote || 0)
        }
      } catch (error) {
        console.error('Error fetching vote state:', error)
      } finally {
        setIsLoadingVoteState(false)
      }
    }

    fetchUserVote()
  }, [session?.user?.id, definitionId])

  const handleVote = async (action: 'up' | 'down') => {
    if (isVoting || !session?.user?.id) return

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
        const newScore = data.counts.netScore
        setScore(newScore)
        setUserVote(data.vote)
        
        // Emit custom event for real-time updates
        window.dispatchEvent(new CustomEvent('voteUpdate', {
          detail: {
            definitionId,
            newScore,
            action
          }
        }))
      } else {
        console.error('Vote failed:', data.error)
      }
    } catch (error) {
      console.error('Vote error:', error)
    } finally {
      setIsVoting(false)
    }
  }

  // Don't render if still loading vote state
  if (isLoadingVoteState) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="p-1 rounded-[2px] bg-gray-200 animate-pulse w-6 h-6"></div>
        <span className="text-sm font-medium text-[#8E8B82]">{score}</span>
        <div className="p-1 rounded-[2px] bg-gray-200 animate-pulse w-6 h-6"></div>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={() => handleVote('up')}
        disabled={isVoting}
        className={`p-1 rounded-[2px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          userVote === 1 
            ? 'bg-[#317a22] text-white' 
            : 'text-[#8E8B82] hover:bg-[#317a22] hover:text-white'
        }`}
        aria-label="Vote up"
      >
        <ChevronUp size={16} />
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
        className={`p-1 rounded-[2px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          userVote === -1 
            ? 'bg-[#ad4545] text-white' 
            : 'text-[#8E8B82] hover:bg-[#ad4545] hover:text-white'
        }`}
        aria-label="Vote down"
      >
        <ChevronDown size={16} />
      </button>
    </div>
  )
} 