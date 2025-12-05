import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Conditional Navbar component
const ConditionalNavbar = () => {
  const location = useLocation();
  const hideNavbarRoutes = ['/checkout', '/listing-preview'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);
  
  return shouldShowNavbar ? <Navbar /> : null;
};
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import SearchResults from './pages/SearchResults';
import EnhancedSellItem from './pages/EnhancedSellItem';
import ListingPreview from './pages/ListingPreview';
import Dashboard from './pages/Dashboard';
import ProductCustomizer from './pages/ProductCustomizer';
import SellerProfile from './pages/SellerProfile';
import Cart from './pages/Cart';
import EnhancedCheckout from './pages/EnhancedCheckout';
import AuthPage from './pages/AuthPage';
import OrderSuccess from './pages/OrderSuccess';
import Messages from './pages/Messages';
import OrderTracking from './pages/OrderTracking';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-white">
        <ConditionalNavbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/category/:category" element={<SearchResults />} />
            <Route path="/category/:category/:subcategory" element={<SearchResults />} />
            <Route path="/sell" element={<EnhancedSellItem />} />
            <Route path="/listing-preview" element={<ListingPreview />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customize/:id" element={<ProductCustomizer />} />
            <Route path="/seller/:id" element={<SellerProfile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/orders/:id" element={<OrderTracking />} />
            <Route path="/watchlist" element={<SearchResults />} />
          </Routes>
        </main>
        <Footer />
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;
