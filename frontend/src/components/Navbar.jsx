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
            {/* Premium Diamond Logo - Maximum Detail & Sparkles */}
            <div className="relative w-14 h-14 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full transition-transform group-hover:scale-110">
                <defs>
                  <linearGradient id="diamondMain" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="50%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                  <linearGradient id="diamondTop" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C7D2FE" />
                    <stop offset="50%" stopColor="#A5B4FC" />
                    <stop offset="100%" stopColor="#818CF8" />
                  </linearGradient>
                  <linearGradient id="diamondLeft" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#3730A3" />
                  </linearGradient>
                  <linearGradient id="diamondRight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#5B21B6" />
                  </linearGradient>
                  <linearGradient id="diamondCenter" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#4C1D95" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <filter id="sparkleGlow">
                    <feGaussianBlur stdDeviation="2" result="blur"/>
                    <feMerge>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <filter id="strongGlow">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* === DIAMOND BODY WITH DETAILED FACETS === */}
                
                {/* Crown - Top table facet (brightest) */}
                <polygon points="50,15 70,28 50,35 30,28" fill="url(#diamondTop)" />
                
                {/* Crown - Top left facet */}
                <polygon points="50,15 30,28 12,38" fill="#A5B4FC" opacity="0.9" />
                
                {/* Crown - Top right facet */}
                <polygon points="50,15 70,28 88,38" fill="#818CF8" opacity="0.85" />
                
                {/* Girdle - Left upper facet */}
                <polygon points="12,38 30,28 50,35 35,45" fill="url(#diamondLeft)" opacity="0.95" />
                
                {/* Girdle - Right upper facet */}
                <polygon points="88,38 70,28 50,35 65,45" fill="url(#diamondRight)" opacity="0.9" />
                
                {/* Pavilion - Left main facet */}
                <polygon points="12,38 35,45 50,90" fill="#4338CA" opacity="0.85" />
                
                {/* Pavilion - Center left facet */}
                <polygon points="35,45 50,35 50,90" fill="url(#diamondCenter)" opacity="0.9" />
                
                {/* Pavilion - Center right facet */}
                <polygon points="65,45 50,35 50,90" fill="url(#diamondMain)" opacity="0.95" />
                
                {/* Pavilion - Right main facet */}
                <polygon points="88,38 65,45 50,90" fill="#5B21B6" opacity="0.8" />
                
                {/* === EDGE HIGHLIGHTS === */}
                <line x1="50" y1="15" x2="12" y2="38" stroke="#E0E7FF" strokeWidth="2" opacity="0.9" />
                <line x1="50" y1="15" x2="88" y2="38" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.7" />
                <line x1="30" y1="28" x2="70" y2="28" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />
                <line x1="50" y1="35" x2="50" y2="90" stroke="#C4B5FD" strokeWidth="1.5" opacity="0.5" />
                <line x1="12" y1="38" x2="50" y2="90" stroke="#818CF8" strokeWidth="1" opacity="0.4" />
                <line x1="88" y1="38" x2="50" y2="90" stroke="#A78BFA" strokeWidth="1" opacity="0.3" />
                
                {/* Inner facet lines for detail */}
                <line x1="30" y1="28" x2="35" y2="45" stroke="#C4B5FD" strokeWidth="0.5" opacity="0.6" />
                <line x1="70" y1="28" x2="65" y2="45" stroke="#C4B5FD" strokeWidth="0.5" opacity="0.5" />
                <line x1="35" y1="45" x2="50" y2="90" stroke="#A78BFA" strokeWidth="0.5" opacity="0.4" />
                <line x1="65" y1="45" x2="50" y2="90" stroke="#A78BFA" strokeWidth="0.5" opacity="0.4" />
                
                {/* === BOLD CHECKMARK === */}
                <path 
                  d="M33 50 L45 63 L67 38" 
                  fill="none" 
                  stroke="#FFFFFF" 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  filter="url(#glow)"
                />
                
                {/* === LARGE SPARKLES === */}
                
                {/* TOP SPARKLE - Large 4-pointed star */}
                <g filter="url(#strongGlow)">
                  <polygon points="50,-5 54,10 50,25 46,10" fill="#FFFFFF" />
                  <polygon points="35,10 50,14 65,10 50,6" fill="#FFFFFF" />
                </g>
                
                {/* LEFT SPARKLE - Large 4-pointed star */}
                <g filter="url(#strongGlow)">
                  <polygon points="-2,38 10,34 22,38 10,42" fill="#FFFFFF" opacity="0.95" />
                  <polygon points="10,26 14,38 10,50 6,38" fill="#FFFFFF" opacity="0.95" />
                </g>
                
                {/* RIGHT SPARKLE - Large 4-pointed star */}
                <g filter="url(#strongGlow)">
                  <polygon points="78,38 90,34 102,38 90,42" fill="#FFFFFF" opacity="0.95" />
                  <polygon points="90,26 94,38 90,50 86,38" fill="#FFFFFF" opacity="0.95" />
                </g>
                
                {/* BOTTOM SPARKLE - Small accent */}
                <g filter="url(#sparkleGlow)">
                  <polygon points="50,88 53,94 50,100 47,94" fill="#FFFFFF" opacity="0.8" />
                  <polygon points="44,94 50,96 56,94 50,92" fill="#FFFFFF" opacity="0.8" />
                </g>
                
                {/* Corner accent sparkles */}
                <circle cx="22" cy="22" r="3" fill="#FFFFFF" opacity="0.8" filter="url(#sparkleGlow)" />
                <circle cx="78" cy="22" r="3" fill="#FFFFFF" opacity="0.8" filter="url(#sparkleGlow)" />
                
                {/* Facet reflection sparkles */}
                <circle cx="40" cy="30" r="2" fill="#FFFFFF" opacity="0.7" />
                <circle cx="58" cy="32" r="1.5" fill="#FFFFFF" opacity="0.6" />
                <circle cx="25" cy="42" r="1.5" fill="#FFFFFF" opacity="0.5" />
                <circle cx="75" cy="42" r="1.5" fill="#FFFFFF" opacity="0.5" />
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
