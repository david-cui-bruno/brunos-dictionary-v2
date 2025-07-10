import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WordCard from "@/components/WordCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Browse = () => {
  const [selectedLetter, setSelectedLetter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  
  const sampleWords = [
    {
      word: "SciLi",
      definition: "The Sciences Library, a popular study spot known for its quiet atmosphere and group study rooms.",
      example: "I'll be at the SciLi all night cramming for my organic chemistry exam.",
      votes: 34,
      slug: "scili"
    },
    {
      word: "Spicy With",
      definition: "A romantic relationship or dating situation, often used to describe campus couples.",
      example: "Did you hear that Sarah is spicy with that guy from her econ class?",
      votes: 28,
      slug: "spicy-with"
    },
    {
      word: "Shopping Period",
      definition: "The first two weeks of each semester when students can attend any class to decide their schedule.",
      example: "I'm still shopping for my fourth class during shopping period.",
      votes: 22,
      slug: "shopping-period"
    },
    {
      word: "The Hill",
      definition: "Pembroke Hill, the area of campus housing several dorms and known for its steep incline.",
      example: "My dorm is on the Hill, so I get a workout every day walking to class.",
      votes: 19,
      slug: "the-hill"
    },
    {
      word: "Concentration",
      definition: "Brown's term for a major field of study, reflecting the university's open curriculum philosophy.",
      example: "I'm thinking about concentrating in International Relations.",
      votes: 16,
      slug: "concentration"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-brown-primary mb-6">
            Browse All Words
          </h1>
          
          {/* A-Z Filter Pills */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedLetter("all")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors focus-ring ${
                  selectedLetter === "all"
                    ? "bg-brown-primary text-white"
                    : "bg-cream text-brown-primary hover:bg-brown-primary/10"
                }`}
              >
                All
              </button>
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors focus-ring ${
                    selectedLetter === letter
                      ? "bg-brown-primary text-white"
                      : "bg-cream text-brown-primary hover:bg-brown-primary/10"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-4 mb-8">
            <span className="text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 focus-ring">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Highest Voted</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Words Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sampleWords.map((word) => (
            <div key={word.slug} className="animate-fade-in">
              <WordCard {...word} />
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-brown-primary text-white px-8 py-3 rounded-xl hover:bg-brown-primary/90 transition-colors focus-ring">
            Load More Words
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Browse;
