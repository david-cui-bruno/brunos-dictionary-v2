import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

interface WordCardProps {
  word: string;
  definition: string;
  votes: number;
  example?: string;
  slug: string;
}

const WordCard = ({ word, definition, votes, example, slug }: WordCardProps) => {
  return (
    <Card className="bg-cream card-shadow hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-brown-primary mb-2">
            {word}
          </h3>
          <p className="text-foreground mb-3 leading-relaxed">
            {definition}
          </p>
          {example && (
            <p className="text-muted-foreground italic text-sm mb-4">
              "{example}"
            </p>
          )}
          <Link to={`/word/${slug}`}>
            <Button 
              variant="outline" 
              size="sm"
              className="border-brown-primary text-brown-primary hover:bg-brown-primary hover:text-white focus-ring"
            >
              View Details
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col items-center ml-4">
          <button className="text-bruno-red hover:text-red-600 focus-ring rounded p-1">
            <ChevronUp className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-brown-primary my-1">
            {votes}
          </span>
          <button className="text-muted-foreground hover:text-foreground focus-ring rounded p-1">
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default WordCard;
