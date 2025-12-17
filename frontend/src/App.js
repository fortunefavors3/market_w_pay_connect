import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Conditional Navbar component
const ConditionalNavbar = () => {
  const location = useLocation();
  const hideNavbarRoutes = ['/checkout', '/listing-preview', '/auth', '/order-success'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);
  
  return shouldShowNavbar ? <Navbar /> : null;
};
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import SearchResults from './pages/SearchResults';
import EnhancedSellItem from './pages/EnhancedSellItem';
import ListingPreview from './pages/ListingPreview';
import Dashboard from './pages/Dashboard';
import PersonalDetails from './pages/PersonalDetails';
import PaymentProcessors from './pages/PaymentProcessors';
import PaymentSetup from './pages/PaymentSetup';
import StripeConnect from './pages/StripeConnect';
import SquareConnect from './pages/SquareConnect';
import PayPalConnect from './pages/PayPalConnect';
import IntegrationGuides from './pages/IntegrationGuides';
import SellerPageEditor from './pages/SellerPageEditor';
import ProductCustomizer from './pages/ProductCustomizer';
import SellerProfile from './pages/SellerProfile';
import Cart from './pages/Cart';
import EnhancedCheckout from './pages/EnhancedCheckout';
import MarketplaceCheckout from './pages/MarketplaceCheckout';
import AuthPage from './pages/AuthPage';
import OrderSuccess from './pages/OrderSuccess';
import Messages from './pages/Messages';
import OrderTracking from './pages/OrderTracking';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Help from './pages/Help';
import Cookies from './pages/Cookies';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
              <Route path="/personal-details" element={<PersonalDetails />} />
              <Route path="/payment-processors" element={<PaymentProcessors />} />
              <Route path="/payment-setup" element={<PaymentSetup />} />
              <Route path="/stripe-connect" element={<StripeConnect />} />
              <Route path="/square-connect" element={<SquareConnect />} />
              <Route path="/paypal-connect" element={<PayPalConnect />} />
              <Route path="/integration-guides" element={<IntegrationGuides />} />
              <Route path="/seller-page-editor" element={<SellerPageEditor />} />
              <Route path="/customize/:id" element={<ProductCustomizer />} />
              <Route path="/seller/:id" element={<SellerProfile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<EnhancedCheckout />} />
              <Route path="/marketplace-checkout" element={<MarketplaceCheckout />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/orders/:id" element={<OrderTracking />} />
              <Route path="/watchlist" element={<SearchResults />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/help" element={<Help />} />
              <Route path="/cookies" element={<Cookies />} />
            </Routes>
          </main>
          <Footer />
          <Toaster />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
