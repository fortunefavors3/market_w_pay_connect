import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import SearchResults from './pages/SearchResults';
import EnhancedSellItem from './pages/EnhancedSellItem';
import Dashboard from './pages/Dashboard';
import ProductCustomizer from './pages/ProductCustomizer';
import SellerProfile from './pages/SellerProfile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Messages from './pages/Messages';
import OrderTracking from './pages/OrderTracking';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/category/:category" element={<SearchResults />} />
            <Route path="/category/:category/:subcategory" element={<SearchResults />} />
            <Route path="/sell" element={<SellItem />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customize/:id" element={<ProductCustomizer />} />
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
