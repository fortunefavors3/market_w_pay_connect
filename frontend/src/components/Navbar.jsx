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
            <img 
              src="https://customer-assets.emergentagent.com/job_d5504b06-2603-41d4-bd91-1b5586e00e8a/artifacts/8ef2uzh5_ChatGPT%20Image%20Dec%205%2C%202025%2C%2011_16_20%20AM.png" 
              alt="CheqMart Logo" 
              className="h-10 w-auto transition-transform group-hover:scale-105"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent hidden sm:block">
              CheqMart
            </span>
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
