'use client'

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Navigation = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <nav className="bg-brown-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">
            Bruno's Dictionary
          </Link>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search words..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white text-gray-900 placeholder:text-gray-500"
              />
            </form>
          </div>
          
          <div className="flex items-center space-x-4">
            {session && (
              <Link href="/add" className="hover:text-cream transition-colors">
                <Plus className="h-4 w-4 mr-1 inline" />
                Add Word
              </Link>
            )}
            
            {status === 'loading' ? (
              <div className="animate-pulse bg-white/20 rounded h-8 w-20"></div>
            ) : session ? (
              <Link 
                href="/profile" 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <User className="h-4 w-4" />
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-brown-primary">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
