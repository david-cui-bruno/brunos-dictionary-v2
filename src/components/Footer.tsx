import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-brown-primary text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Brown Slang Dictionary</h3>
            <p className="text-gray-300 text-sm">
              Decode campus life, one word at a time. From first-years to seniors, 
              understand the language that makes Brown home.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/browse" className="text-gray-300 hover:text-white transition-colors">
                  Browse All Words
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://brown.edu" className="text-gray-300 hover:text-white transition-colors">
                  Brown University
                </a>
              </li>
              <li>
                <a href="mailto:web@brown.edu" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
          <p>&copy; 2024 Brown University. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
