'use client'

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { User, Plus, Search, Menu } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import SearchBar from './SearchBar'

const Navigation = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Only close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleHomeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRefreshing(true);
    
    try {
      await Promise.all([
        router.refresh(),
        new Promise(resolve => setTimeout(resolve, 100))
      ]);
      
      const response = await fetch('/', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      const timestamp = Date.now();
      router.push(`/?refresh=${timestamp}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const NavLinks = () => (
    <>
      {session && (
        <Link
          href="/add"
          className={`flex items-center space-x-1 px-3 py-2 rounded-[2px] transition-colors ${
            pathname === "/add" ? "bg-white text-[#65271c]" : "text-white hover:bg-white/10"
          } ${isRefreshing ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <Plus size={18} />
          <span>Add Word</span>
        </Link>
      )}

      {status === 'loading' ? (
        <div className="animate-pulse bg-[#8E8B82]/20 rounded h-8 w-20"></div>
      ) : session ? (
        <Link
          href="/profile"
          className={`flex items-center space-x-1 px-3 py-2 rounded-[2px] transition-colors ${
            pathname === "/profile" ? "bg-white text-[#65271c]" : "text-white hover:bg-white/10"
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
            className="bg-[#65271c] text-white border-white hover:bg-white hover:text-[#65271c] transition-colors w-24"
            disabled={isRefreshing}
          >
            Sign In
          </Button>
        </Link>
      )}
    </>
  );

  return (
    <nav className="bg-[#65271c] relative z-50">
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between h-16 relative">
          {/* Logo */}
          <a 
            href="/" 
            onClick={handleHomeClick} 
            className={`flex items-center space-x-2 ${isRefreshing ? 'opacity-70' : ''}`}
            style={{ pointerEvents: isRefreshing ? 'none' : 'auto' }}
          >
            <h1 className="text-2xl font-playfair font-bold text-white">
              {isRefreshing ? 'Refreshing...' : "Bruno's Dictionary"}
            </h1>
          </a>

          {/* Desktop Search Bar */}
          <div className="max-w-md w-full mx-8">
            <SearchBar />
          </div>

          {/* Desktop Navigation Links */}
          <div className="flex items-center space-x-4">
            <NavLinks />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Logo */}
            <a 
              href="/" 
              onClick={handleHomeClick} 
              className={`flex items-center ${isRefreshing ? 'opacity-70' : ''}`}
              style={{ pointerEvents: isRefreshing ? 'none' : 'auto' }}
            >
              <h1 className="text-xl font-playfair font-bold text-white">
                {isRefreshing ? 'Refreshing...' : "Bruno's Dictionary"}
              </h1>
            </a>

            {/* Mobile Search & Menu Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setIsMobileSearchOpen(!isMobileSearchOpen);
                  // Focus the search input when opening
                  if (!isMobileSearchOpen) {
                    setTimeout(() => {
                      searchInputRef.current?.focus();
                    }, 100);
                  }
                }}
                className="p-2 text-white hover:bg-white/10 rounded-[2px]"
              >
                <Search size={20} />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white hover:bg-white/10 rounded-[2px]"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isMobileSearchOpen && (
            <div className="py-2 px-4 bg-[#65271c] border-t border-white/10">
              <SearchBar mobile={true} />
            </div>
          )}

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="py-4 px-4 bg-[#65271c] border-t border-white/10 flex flex-col space-y-2">
              <NavLinks />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
