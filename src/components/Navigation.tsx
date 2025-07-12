'use client'

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Plus, Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const Navigation = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleHomeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRefreshing(true);
    
    try {
      // Force a complete refresh of the page data
      await Promise.all([
        router.refresh(),
        // Add a small delay to ensure the refresh completes
        new Promise(resolve => setTimeout(resolve, 100))
      ]);
      
      // Force revalidation of the page
      const response = await fetch('/', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      // Navigate home with a cache-busting query parameter
      const timestamp = Date.now();
      router.push(`/?refresh=${timestamp}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <nav className="bg-white border-b border-[#8E8B82] shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <a 
            href="/" 
            onClick={handleHomeClick} 
            className={`flex items-center space-x-2 ${isRefreshing ? 'opacity-70' : ''}`}
            style={{ pointerEvents: isRefreshing ? 'none' : 'auto' }}
          >
            <h1 className="text-2xl font-playfair font-bold text-[#4E3629]">
              {isRefreshing ? 'Refreshing...' : "Bruno's Dictionary"}
            </h1>
          </a>

          {/* Centered Search Bar */}
          <div className="absolute left-1/2 transform -translate-x-1/2 max-w-md w-full">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8E8B82] h-4 w-4" />
              <Input
                type="text"
                placeholder="Search words..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white text-[#4E3629] placeholder:text-[#8E8B82] border-[#8E8B82] focus:border-[#4E3629] focus:ring-[#4E3629]"
                disabled={isRefreshing}
              />
            </form>
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center space-x-4">
            {session && (
              <Link
                href="/add"
                className={`flex items-center space-x-1 px-3 py-2 rounded-[2px] transition-colors ${
                  pathname === "/add" ? "bg-[#4E3629] text-white" : "text-[#4E3629] hover:bg-[#FAF7F3]"
                } ${isRefreshing ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <Plus size={18} />
                <span>Add Word</span>
              </Link>
            )}

            {/* User Profile / Sign In */}
            {status === 'loading' ? (
              <div className="animate-pulse bg-[#8E8B82]/20 rounded h-8 w-20"></div>
            ) : session ? (
              <Link
                href="/profile"
                className={`flex items-center space-x-1 px-3 py-2 rounded-[2px] transition-colors ${
                  pathname === "/profile" ? "bg-[#4E3629] text-white" : "text-[#4E3629] hover:bg-[#FAF7F3]"
                } ${isRefreshing ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <User size={18} />
                <span>Profile</span>
              </Link>
            ) : (
              <Link 
                href="/auth/signin"
                className={isRefreshing ? 'opacity-50 pointer-events-none' : ''}
              >
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-[#4E3629] border-[#8E8B82] hover:bg-[#4E3629] hover:text-white hover:border-[#4E3629]"
                  disabled={isRefreshing}
                >
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
