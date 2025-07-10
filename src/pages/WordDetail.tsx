import { useState } from "react";
import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronUp, ChevronDown, Flag, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const WordDetail = () => {
  const { slug } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDefinition, setNewDefinition] = useState("");
  const [newExample, setNewExample] = useState("");

  // Mock data - in real app, this would come from API based on slug
  const wordData = {
    word: "Ratty",
    definitions: [
      {
        id: 1,
        definition: "The Sharpe Refectory, Brown's main dining hall where students grab meals between classes.",
        example: "Let's meet at the Ratty for lunch before our next class.",
        votes: 47,
        userVote: null // null, 'up', or 'down'
      },
      {
        id: 2,
        definition: "Short for 'ratty' meaning worn-out or shabby, often used to describe old dorm furniture.",
        example: "This ratty couch has been in our common room since the 90s.",
        votes: 12,
        userVote: null
      }
    ]
  };

  const handleVote = (definitionId: number, voteType: 'up' | 'down') => {
    console.log(`Voted ${voteType} on definition ${definitionId}`);
  };

  const handleSubmitDefinition = () => {
    if (newDefinition.trim()) {
      console.log("New definition:", { definition: newDefinition, example: newExample });
      setNewDefinition("");
      setNewExample("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-brown-primary mb-2">
            {wordData.word}
          </h1>
          <p className="text-muted-foreground">
            {wordData.definitions.length} definition{wordData.definitions.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Definitions */}
        <div className="space-y-6 mb-8">
          {wordData.definitions.map((def) => (
            <Card key={def.id} className="bg-cream card-shadow p-6 rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-foreground text-lg leading-relaxed mb-3">
                    {def.definition}
                  </p>
                  {def.example && (
                    <p className="text-muted-foreground italic mb-4">
                      "{def.example}"
                    </p>
                  )}
                  <button className="text-muted-foreground hover:text-bruno-red text-sm flex items-center focus-ring rounded px-2 py-1">
                    <Flag className="w-4 h-4 mr-1" />
                    Flag
                  </button>
                </div>
                
                <div className="flex flex-col items-center ml-6">
                  <button 
                    onClick={() => handleVote(def.id, 'up')}
                    className={`p-2 rounded-lg transition-colors focus-ring ${
                      def.userVote === 'up' 
                        ? 'text-bruno-red bg-red-50' 
                        : 'text-bruno-red hover:bg-red-50'
                    }`}
                  >
                    <ChevronUp className="w-6 h-6" />
                  </button>
                  <span className="text-lg font-semibold text-brown-primary my-2">
                    {def.votes}
                  </span>
                  <button 
                    onClick={() => handleVote(def.id, 'down')}
                    className={`p-2 rounded-lg transition-colors focus-ring ${
                      def.userVote === 'down' 
                        ? 'text-muted-foreground bg-gray-100' 
                        : 'text-muted-foreground hover:bg-gray-100'
                    }`}
                  >
                    <ChevronDown className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Floating Add Definition Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-brown-primary hover:bg-brown-primary/90 shadow-lg focus-ring"
            size="icon"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-brown-primary">Add Definition</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="definition">Definition *</Label>
              <Textarea
                id="definition"
                placeholder={`Define "${wordData.word}"...`}
                value={newDefinition}
                onChange={(e) => setNewDefinition(e.target.value)}
                className="mt-1 focus-ring"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {newDefinition.length}/500 characters
              </p>
            </div>
            <div>
              <Label htmlFor="example">Example sentence (optional)</Label>
              <Input
                id="example"
                placeholder="Use it in a sentence..."
                value={newExample}
                onChange={(e) => setNewExample(e.target.value)}
                className="mt-1 focus-ring"
              />
            </div>
            <Button 
              onClick={handleSubmitDefinition}
              disabled={!newDefinition.trim()}
              className="w-full bg-brown-primary hover:bg-brown-primary/90 focus-ring"
            >
              Submit Definition
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default WordDetail;
