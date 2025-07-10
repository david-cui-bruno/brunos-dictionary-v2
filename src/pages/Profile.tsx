import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const Profile = () => {
  const [emailRecap, setEmailRecap] = useState(true);

  const userData = {
    name: "Alex Chen",
    gradYear: "2025",
    initials: "AC",
    wordsContributed: 23,
    totalVotes: 156
  };

  const myWords = [
    { word: "Gate-io", definition: "The main entrance to campus on Prospect Street...", votes: 8 },
    { word: "Blue Room", definition: "The music venue in the basement of Faunce House...", votes: 15 },
    { word: "CAP", definition: "Course Action Plan, what you submit when you want to...", votes: 3 }
  ];

  const myVotes = [
    { word: "Ratty", action: "upvoted", date: "2 days ago" },
    { word: "SciLi", action: "upvoted", date: "1 week ago" },
    { word: "Spicy With", action: "upvoted", date: "1 week ago" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-brown-primary rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-white">
                {userData.initials}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-brown-primary">
                {userData.name}
              </h1>
              <p className="text-muted-foreground">Class of {userData.gradYear}</p>
            </div>
          </div>
          
          <div className="flex space-x-8 text-center">
            <div>
              <div className="text-2xl font-semibold text-brown-primary">
                {userData.wordsContributed}
              </div>
              <div className="text-sm text-muted-foreground">Words Added</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-brown-primary">
                {userData.totalVotes}
              </div>
              <div className="text-sm text-muted-foreground">Votes Cast</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="words" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="words" className="focus-ring">My Words</TabsTrigger>
            <TabsTrigger value="votes" className="focus-ring">My Votes</TabsTrigger>
            <TabsTrigger value="settings" className="focus-ring">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="words" className="space-y-4">
            {myWords.map((item, index) => (
              <Card key={index} className="bg-cream card-shadow p-4 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-brown-primary mb-1">
                      {item.word}
                    </h3>
                    <p className="text-foreground text-sm mb-2">
                      {item.definition}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.votes} votes
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="votes" className="space-y-4">
            {myVotes.map((item, index) => (
              <Card key={index} className="bg-cream card-shadow p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-brown-primary">
                      {item.word}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      • {item.action}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.date}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-cream card-shadow p-6 rounded-xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-recap" className="text-base font-medium">
                      Weekly recap email
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get a summary of new words and popular definitions each week
                    </p>
                  </div>
                  <Switch
                    id="email-recap"
                    checked={emailRecap}
                    onCheckedChange={setEmailRecap}
                    className="focus-ring"
                  />
                </div>
                
                <div className="pt-4 border-t border-border">
                  <Button 
                    variant="destructive" 
                    className="focus-ring"
                  >
                    Delete Account
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    This action cannot be undone. All your contributions will remain anonymous.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
