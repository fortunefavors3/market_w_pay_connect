import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { mockCategories, mockCart } from '../mock';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const cartItemCount = mockCart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center text-sm">
          <div className="flex gap-4">
            <Link to="/sell" className="text-white hover:text-gray-100 transition-colors font-medium">
              Start Selling
            </Link>
            <Link to="/watchlist" className="text-white hover:text-gray-100 transition-colors font-medium">
              Watchlist
            </Link>
          </div>
          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-white hover:text-gray-100 transition-colors font-medium">
                  Dashboard
                </Link>
                <span className="text-white/50">|</span>
                <button 
                  onClick={logout}
                  className="text-white hover:text-gray-100 transition-colors font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="text-white hover:text-gray-100 transition-colors font-medium">
                  Sign In
                </Link>
                <span className="text-white/50">|</span>
                <Link to="/auth" className="text-white hover:text-gray-100 transition-colors font-medium">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            {/* Enhanced Diamond Logo - Bold Checkmark & Sparkles */}
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full transition-transform group-hover:scale-110">
                <defs>
                  <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="50%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                  <linearGradient id="diamondHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A5B4FC" />
                    <stop offset="100%" stopColor="#818CF8" />
                  </linearGradient>
                  <linearGradient id="diamondShadow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3730A3" />
                    <stop offset="100%" stopColor="#4C1D95" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <filter id="sparkleGlow">
                    <feGaussianBlur stdDeviation="1.5" result="blur"/>
                    <feMerge>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Main diamond body with glow */}
                <g filter="url(#glow)">
                  <polygon points="50,8 92,35 50,92 8,35" fill="url(#diamondGradient)" />
                </g>
                
                {/* Top facet - bright highlight */}
                <polygon points="50,8 92,35 50,45 8,35" fill="url(#diamondHighlight)" opacity="0.95" />
                
                {/* Left facet - shadow */}
                <polygon points="8,35 50,45 50,92" fill="url(#diamondShadow)" opacity="0.8" />
                
                {/* Right facet */}
                <polygon points="92,35 50,45 50,92" fill="url(#diamondGradient)" opacity="0.9" />
                
                {/* Center facet line */}
                <line x1="50" y1="45" x2="50" y2="92" stroke="#C4B5FD" strokeWidth="1.5" opacity="0.6" />
                
                {/* Edge highlights */}
                <line x1="50" y1="8" x2="8" y2="35" stroke="#E0E7FF" strokeWidth="2" opacity="0.8" />
                <line x1="50" y1="8" x2="92" y2="35" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
                <line x1="8" y1="35" x2="50" y2="92" stroke="#6366F1" strokeWidth="1" opacity="0.4" />
                <line x1="92" y1="35" x2="50" y2="92" stroke="#A78BFA" strokeWidth="1" opacity="0.3" />
                
                {/* BOLD Checkmark */}
                <path 
                  d="M32 52 L45 65 L68 38" 
                  fill="none" 
                  stroke="#FFFFFF" 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  filter="url(#glow)"
                />
                
                {/* TOP SPARKLE - Large 4-pointed star */}
                <g filter="url(#sparkleGlow)">
                  <polygon points="50,0 52,6 50,12 48,6" fill="#FFFFFF" />
                  <polygon points="44,6 50,8 56,6 50,4" fill="#FFFFFF" />
                </g>
                
                {/* LEFT SPARKLE - 4-pointed star */}
                <g filter="url(#sparkleGlow)">
                  <polygon points="2,35 6,33 10,35 6,37" fill="#FFFFFF" opacity="0.9" />
                  <polygon points="6,31 8,35 6,39 4,35" fill="#FFFFFF" opacity="0.9" />
                </g>
                
                {/* RIGHT SPARKLE - 4-pointed star */}
                <g filter="url(#sparkleGlow)">
                  <polygon points="90,35 94,33 98,35 94,37" fill="#FFFFFF" opacity="0.9" />
                  <polygon points="94,31 96,35 94,39 92,35" fill="#FFFFFF" opacity="0.9" />
                </g>
                
                {/* Additional corner sparkles */}
                <circle cx="20" cy="25" r="2" fill="#FFFFFF" opacity="0.7" filter="url(#sparkleGlow)" />
                <circle cx="80" cy="25" r="2" fill="#FFFFFF" opacity="0.7" filter="url(#sparkleGlow)" />
                
                {/* Small accent sparkles on facets */}
                <circle cx="30" cy="40" r="1.5" fill="#FFFFFF" opacity="0.6" />
                <circle cx="70" cy="40" r="1.5" fill="#FFFFFF" opacity="0.5" />
              </svg>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                EFFINSURE
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 -mt-1">
                Fearless Commerce
              </span>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex">
            <div className="flex w-full">
              <Input
                type="text"
                placeholder="Search for anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-r-none border-r-0 h-11"
              />
              <Button 
                type="submit" 
                className="rounded-l-none bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-11 px-6"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>

          <div className="hidden md:flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/cart')} 
              className="relative hover:bg-indigo-50 hover:text-indigo-600"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-1">
                    <img 
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=667eea&color=fff`}
                      alt={user?.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover border-2 border-indigo-200"
                    />
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>My Orders</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Sign In
              </Button>
            )}
          </div>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
