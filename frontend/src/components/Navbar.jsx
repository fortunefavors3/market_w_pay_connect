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
            {/* Diamond/Gem Logo Mark */}
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg transition-transform group-hover:scale-110">
                <defs>
                  <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="50%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                  <linearGradient id="diamondHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                  <linearGradient id="diamondShadow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3730A3" />
                    <stop offset="100%" stopColor="#4C1D95" />
                  </linearGradient>
                </defs>
                {/* Main diamond body */}
                <polygon points="50,5 95,35 50,95 5,35" fill="url(#diamondGradient)" />
                {/* Top facet - highlight */}
                <polygon points="50,5 95,35 50,45 5,35" fill="url(#diamondHighlight)" opacity="0.9" />
                {/* Left facet */}
                <polygon points="5,35 50,45 50,95" fill="url(#diamondShadow)" opacity="0.7" />
                {/* Right facet */}
                <polygon points="95,35 50,45 50,95" fill="url(#diamondGradient)" opacity="0.85" />
                {/* Center line accent */}
                <line x1="50" y1="45" x2="50" y2="95" stroke="#A78BFA" strokeWidth="1" opacity="0.5" />
                {/* Top edges */}
                <line x1="50" y1="5" x2="5" y2="35" stroke="#C4B5FD" strokeWidth="1.5" opacity="0.6" />
                <line x1="50" y1="5" x2="95" y2="35" stroke="#C4B5FD" strokeWidth="1.5" opacity="0.6" />
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
