import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-brown-primary text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Bruno's Dictionary</h3>
            <p className="text-gray-300 text-sm">
              Decode campus life, one word at a time. From first-years to seniors, understand the language that makes Brown home.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://brown.edu" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                  Brown University
                </a>
              </li>
              <li>
                <a href="mailto:contact@example.com" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300 text-sm">
            © 2024 Brown University. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
