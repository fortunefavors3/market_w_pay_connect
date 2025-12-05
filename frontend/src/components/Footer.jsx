import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4">About</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/announcements" className="hover:text-white transition-colors">Announcements</Link></li>
              <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/press" className="hover:text-white transition-colors">Press</Link></li>
            </ul>
          </div>

          {/* Help & Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Help & Contact</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/resolution" className="hover:text-white transition-colors">Resolution Center</Link></li>
              <li><Link to="/seller-center" className="hover:text-white transition-colors">Seller Center</Link></li>
            </ul>
          </div>

          {/* Selling */}
          <div>
            <h3 className="text-white font-semibold mb-4">Selling</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/sell" className="hover:text-white transition-colors">Start Selling</Link></li>
              <li><Link to="/seller-guide" className="hover:text-white transition-colors">Seller Guide</Link></li>
              <li><Link to="/affiliates" className="hover:text-white transition-colors">Affiliates</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-white font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/forums" className="hover:text-white transition-colors">Forums</Link></li>
              <li><Link to="/events" className="hover:text-white transition-colors">Events</Link></li>
              <li><Link to="/giving-works" className="hover:text-white transition-colors">Giving Works</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm">
            <p>&copy; 2025 CheqMart. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-sm hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="text-sm hover:text-white transition-colors">Cookie Policy</Link>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
