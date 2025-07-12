"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown, Share2 } from "lucide-react"

interface WordCardProps {
  word: string
  definition: string
  example: string
  tags?: string[]
  votes?: number
  showVoting?: boolean
  showSharing?: boolean
}

export function WordCard({
  word,
  definition,
  example,
  tags = [],
  votes = 0,
  showVoting = true,
  showSharing = false,
}: WordCardProps) {
  const [currentVotes, setCurrentVotes] = useState(votes)
  const [hasVoted, setHasVoted] = useState(false)

  const handleVote = (type: "up" | "down") => {
    if (hasVoted) return

    setCurrentVotes((prev) => (type === "up" ? prev + 1 : prev - 1))
    setHasVoted(true)

    // Add vote animation
    const button = document.activeElement as HTMLElement
    button?.classList.add("animate-pulse")
    setTimeout(() => button?.classList.remove("animate-pulse"), 200)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${word} - Bruno's Dictionary`,
        text: `${definition}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(`${word}: ${definition} - Bruno's Dictionary`)
    }
  }

  return (
    <div className="bruno-card">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-playfair font-bold text-[#4E3629]">{word}</h3>
        {showVoting && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleVote("up")}
              disabled={hasVoted}
              className="p-2 rounded-[2px] hover:bg-[#4C6B46] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Vote up"
            >
              <ThumbsUp size={16} />
            </button>
            <span className="text-sm font-medium text-[#8E8B82]">{currentVotes}</span>
            <button
              onClick={() => handleVote("down")}
              disabled={hasVoted}
              className="p-2 rounded-[2px] hover:bg-[#B04A39] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Vote down"
            >
              <ThumbsDown size={16} />
            </button>
          </div>
        )}
      </div>

      <p className="text-[#4E3629] mb-3 leading-relaxed">{definition}</p>

      <p className="text-[#8E8B82] italic mb-4">"{example}"</p>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span key={index} className="bruno-badge bruno-badge-tag">
              {tag}
            </span>
          ))}
        </div>

        {showSharing && (
          <button
            onClick={handleShare}
            className="p-2 rounded-[2px] hover:bg-[#8E8B82] hover:text-white transition-colors"
            aria-label="Share word"
          >
            <Share2 size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
