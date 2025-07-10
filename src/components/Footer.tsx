import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-cream border-t border-border mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-muted-foreground text-sm">
            © 2024 Brown Slang Dictionary
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <Link 
              to="/conduct" 
              className="text-muted-foreground hover:text-brown-primary transition-colors focus-ring rounded px-2 py-1"
            >
              Code of Conduct
            </Link>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-brown-primary transition-colors focus-ring rounded px-2 py-1"
            >
              Source on GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
