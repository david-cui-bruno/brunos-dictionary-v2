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
  showSharing = false
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
    <div className="bruno-card">
      <div className="flex justify-between items-start mb-3">
        <Link href={`/search?q=${encodeURIComponent(word)}`} className="flex-1">
          <h3 className="text-2xl font-playfair font-bold text-[#4E3629] hover:text-[#4E3629]/80 transition-colors">
            {word}
          </h3>
        </Link>
        {showVoting && definitionId && (
          <VoteButtons 
            definitionId={definitionId}
            initialScore={score}
            initialUserVote={userVote}
          />
        )}
      </div>
      
      <Link href={`/search?q=${encodeURIComponent(word)}`}>
        <p className="text-[#4E3629]/80 mb-3 leading-relaxed">{definition}</p>
        {example && (
          <p className="text-[#8E8B82]/80 italic mb-4">"{example}"</p>
        )}
      </Link>

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
  );
};

export default WordCard;
