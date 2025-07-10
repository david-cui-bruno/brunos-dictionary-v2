import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  return (
    <nav className="sticky top-0 z-50 bg-brown-primary shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-semibold text-white">
              Brown Slang Dictionary
            </span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link 
              to="/browse" 
              className="text-white hover:text-cream transition-colors focus-ring rounded-md px-3 py-2"
            >
              Browse All Words
            </Link>
            <Link 
              to="/profile" 
              className="text-white hover:text-cream transition-colors focus-ring rounded-md px-3 py-2"
            >
              Profile
            </Link>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-brown-primary focus-ring"
              size="sm"
            >
              Log In
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
