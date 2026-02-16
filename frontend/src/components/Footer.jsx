import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-indigo-900 to-slate-900 text-gray-300 border-t border-indigo-900/50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">About</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-cyan-400 transition-colors duration-200 hover:translate-x-1 inline-block">About Us</Link></li>
              <li><Link to="/announcements" className="hover:text-cyan-400 transition-colors duration-200 hover:translate-x-1 inline-block">Announcements</Link></li>
              <li><Link to="/careers" className="hover:text-cyan-400 transition-colors duration-200 hover:translate-x-1 inline-block">Careers</Link></li>
              <li><Link to="/press" className="hover:text-cyan-400 transition-colors duration-200 hover:translate-x-1 inline-block">Press</Link></li>
            </ul>
          </div>

          {/* Help & Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Help & Contact</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/help" className="hover:text-cyan-400 transition-colors duration-200 hover:translate-x-1 inline-block">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-cyan-400 transition-colors duration-200 hover:translate-x-1 inline-block">Contact Us</Link></li>
              <li><Link to="/resolution" className="hover:text-cyan-400 transition-colors duration-200 hover:translate-x-1 inline-block">Resolution Center</Link></li>
              <li><Link to="/seller-center" className="hover:text-cyan-400 transition-colors duration-200 hover:translate-x-1 inline-block">Seller Center</Link></li>
            </ul>
          </div>

          {/* Selling */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Selling</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/sell" className="hover:text-cyan-400 transition-colors duration-200 hover:translate-x-1 inline-block">Start Selling</Link></li>
              <li><Link to="/seller-guide" className="hover:text-cyan-400 transition-colors duration-200 hover:translate-x-1 inline-block">Seller Guide</Link></li>
              <li><Link to="/affiliates" className="hover:text-cyan-400 transition-colors duration-200 hover:translate-x-1 inline-block">Affiliates</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Community</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/forums" className="hover:text-cyan-400 transition-colors duration-200 hover:translate-x-1 inline-block">Forums</Link></li>
              <li><Link to="/events" className="hover:text-cyan-400 transition-colors duration-200 hover:translate-x-1 inline-block">Events</Link></li>
              <li><Link to="/giving-works" className="hover:text-cyan-400 transition-colors duration-200 hover:translate-x-1 inline-block">Giving Works</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-indigo-900/50 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-400">
            <p>&copy; 2025 CheqMart. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm hover:text-cyan-400 transition-colors duration-200">Privacy Policy</Link>
            <Link to="/terms" className="text-sm hover:text-cyan-400 transition-colors duration-200">Terms of Service</Link>
            <Link to="/cookies" className="text-sm hover:text-cyan-400 transition-colors duration-200">Cookie Policy</Link>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-cyan-400 transition-all duration-200 hover:scale-110">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-cyan-400 transition-all duration-200 hover:scale-110">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-cyan-400 transition-all duration-200 hover:scale-110">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-cyan-400 transition-all duration-200 hover:scale-110">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
