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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center text-sm">
          <div className="flex gap-4">
            <Link to="/sell" className="text-gray-700 hover:text-gray-900 transition-colors">
              Sell
            </Link>
            <Link to="/watchlist" className="text-gray-700 hover:text-gray-900 transition-colors">
              Watchlist
            </Link>
          </div>
          <div className="flex gap-4 items-center">
            <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 transition-colors">
              My Account
            </Link>
            <span className="text-gray-400">|</span>
            <span className="text-gray-700">Hi, {mockUser.name}!</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 hidden sm:block">BayMarket</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex">
            <div className="flex w-full">
              <Input
                type="text"
                placeholder="Search for anything"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-r-none border-r-0 focus:ring-2 focus:ring-blue-500"
              />
              <Button type="submit" className="rounded-l-none bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/cart')} className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <User className="w-5 h-5" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="mt-3 md:hidden">
          <div className="flex w-full">
            <Input
              type="text"
              placeholder="Search for anything"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-r-none border-r-0"
            />
            <Button type="submit" className="rounded-l-none bg-blue-600 hover:bg-blue-700">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Categories Bar */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="hidden md:flex gap-6 overflow-x-auto">
            {mockCategories.map((category) => (
              <DropdownMenu key={category.id}>
                <DropdownMenuTrigger className="text-sm text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1 whitespace-nowrap">
                  {category.name}
                  <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {category.subcategories.map((sub, idx) => (
                    <DropdownMenuItem key={idx} onClick={() => navigate(`/category/${category.name}/${sub}`)}>
                      {sub}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4">
          <div className="px-4 space-y-3">
            <Link to="/cart" className="flex items-center gap-3 py-2 text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
              <ShoppingCart className="w-5 h-5" />
              <span>Cart ({cartItemCount})</span>
            </Link>
            <Link to="/dashboard" className="flex items-center gap-3 py-2 text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
              <User className="w-5 h-5" />
              <span>My Account</span>
            </Link>
            <div className="border-t border-gray-200 pt-3 mt-3">
              <p className="text-sm font-semibold text-gray-900 mb-2">Categories</p>
              {mockCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.name}`}
                  className="block py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
