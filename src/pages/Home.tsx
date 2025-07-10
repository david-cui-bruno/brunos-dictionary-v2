import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WordCard from "@/components/WordCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Home = () => {
  const wordOfTheDay = {
    word: "Ratty",
    definition: "The Sharpe Refectory, Brown's main dining hall where students grab meals between classes.",
    example: "Let's meet at the Ratty for lunch before our next class.",
    votes: 47,
    slug: "ratty"
  };

  const topSearched = [
    { word: "SciLi", count: 23 },
    { word: "Spicy With", count: 19 },
    { word: "Shopping Period", count: 15 }, 
    { word: "Concentration", count: 12 },
    { word: "The Hill", count: 8 }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center py-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-brown-primary mb-4">
            Brown Slang Dictionary
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Decode campus life, one word at a time. From first-years to seniors, 
            understand the language that makes Brown home.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Type a Brown slang word..."
              className="pl-12 h-14 text-lg rounded-full border-2 border-brown-primary/20 focus:border-brown-primary focus-ring"
            />
          </div>
        </div>

        {/* Word of the Day */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-brown-primary mb-6 text-center">
            Word of the Day
          </h2>
          <div className="max-w-2xl mx-auto">
            <WordCard {...wordOfTheDay} />
          </div>
        </section>

        {/* Top Searched */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-brown-primary mb-6 text-center">
            Most Searched This Week
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {topSearched.map((item, index) => (
              <div 
                key={item.word}
                className="bg-cream rounded-full px-4 py-2 card-shadow hover:shadow-md transition-shadow"
              >
                <span className="text-brown-primary font-medium">{item.word}</span>
                <span className="text-muted-foreground ml-2 text-sm">({item.count})</span>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="text-center py-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-8 text-muted-foreground">
            <span className="flex items-center">
              <span className="font-semibold text-brown-primary">1,234</span>
              <span className="ml-1">words</span>
            </span>
            <span className="hidden md:block">•</span>
            <span className="flex items-center">
              <span className="font-semibold text-brown-primary">8,912</span>
              <span className="ml-1">votes</span>
            </span>
            <span className="hidden md:block">•</span>
            <span className="flex items-center">
              <span className="font-semibold text-brown-primary">142</span>
              <span className="ml-1">new this week</span>
            </span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
