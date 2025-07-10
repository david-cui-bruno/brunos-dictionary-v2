import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
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
}

const WordCard = ({ 
  word, 
  definition, 
  example, 
  slug, 
  definitionId,
  score = 0,
  userVote = 0
}: WordCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
      <div className="flex justify-between items-start mb-3">
        <Link href={`/word/${slug}`} className="flex-1">
          <h3 className="text-xl font-semibold text-brown-primary hover:text-brown-primary/80 transition-colors">
            {word}
          </h3>
        </Link>
        {definitionId && (
          <VoteButtons 
            definitionId={definitionId}
            initialScore={score}
            initialUserVote={userVote}
          />
        )}
      </div>
      
      <Link href={`/word/${slug}`}>
        <p className="text-gray-700 mb-3 line-clamp-3">{definition}</p>
        {example && (
          <p className="text-sm text-gray-600 italic line-clamp-2">
            "{example}"
          </p>
        )}
      </Link>
    </div>
  );
};

export default WordCard;
