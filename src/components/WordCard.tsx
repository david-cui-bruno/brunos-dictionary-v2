'use client'

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Share2 } from "lucide-react";
import Link from "next/link";
import VoteButtons from "./VoteButtons";

interface WordCardProps {
  word: string;
  definition: string;
  example?: string | null;
  slug: string;
  definitionId?: string;
  score?: number;
  userVote?: number;
  tags?: string[];
  showVoting?: boolean;
  showSharing?: boolean;
}

const WordCard = ({ 
  word, 
  definition, 
  example, 
  slug, 
  definitionId,
  score = 0,
  userVote = 0,
  tags = [],
  showVoting = true,
  showSharing = false,
}: WordCardProps) => {
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${word} - Bruno's Dictionary`,
        text: `${definition}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`${word}: ${definition} - Bruno's Dictionary`);
    }
  };

  return (
    <div className="bruno-card p-4 sm:p-8">
      <div className="flex justify-between items-start gap-3 mb-3">
        <Link href={`/search?q=${encodeURIComponent(word)}`} className="flex-1 min-w-0">
          <h3 className="text-xl sm:text-2xl font-playfair font-bold text-[#4E3629] hover:text-[#4E3629]/80 transition-colors">
            {word}
          </h3>
        </Link>
        {showVoting && definitionId && (
          <VoteButtons 
            definitionId={definitionId}
            initialScore={score}
            initialUserVote={userVote}
            className="flex-shrink-0"
          />
        )}
      </div>
      
      <Link href={`/search?q=${encodeURIComponent(word)}`}>
        <p className="text-[#4E3629]/80 mb-3 leading-relaxed text-sm sm:text-base">{definition}</p>
        {example && (
          <p className="text-[#8E8B82]/80 italic mb-4 text-sm">"{example}"</p>
        )}
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span key={index} className="bruno-badge bruno-badge-tag text-xs">
              {tag}
            </span>
          ))}
        </div>

        {showSharing && (
          <button
            onClick={handleShare}
            className="p-3 sm:p-2 rounded-[2px] hover:bg-[#8E8B82] hover:text-white transition-colors self-start sm:self-auto min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Share word"
          >
            <Share2 size={18} className="sm:w-4 sm:h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default WordCard;
