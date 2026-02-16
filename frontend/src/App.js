import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

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
import AuthorizeNetConnect from './pages/AuthorizeNetConnect';
import EpicPaymentConnect from './pages/EpicPaymentConnect';
import NMIConnect from './pages/NMIConnect';
import BraintreeConnect from './pages/BraintreeConnect';
import USAePayConnect from './pages/USAePayConnect';
import PayKickstartConnect from './pages/PayKickstartConnect';
import DurangoConnect from './pages/DurangoConnect';
import HostMerchantConnect from './pages/HostMerchantConnect';
import AdyenConnect from './pages/AdyenConnect';
import WorldPayConnect from './pages/WorldPayConnect';
import CheckoutComConnect from './pages/CheckoutComConnect';
import AdminDashboard from './pages/AdminDashboard';
import IntegrationGuides from './pages/IntegrationGuides';
import BillingSettings from './pages/BillingSettings';
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
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/category/:category" element={<SearchResults />} />
              <Route path="/category/:category/:subcategory" element={<SearchResults />} />
              <Route path="/seller/:id" element={<SellerProfile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/help" element={<Help />} />
              <Route path="/cookies" element={<Cookies />} />
              
              {/* Protected Routes - Require Authentication */}
              <Route path="/sell" element={<ProtectedRoute><EnhancedSellItem /></ProtectedRoute>} />
              <Route path="/listing-preview" element={<ProtectedRoute><ListingPreview /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/personal-details" element={<ProtectedRoute><PersonalDetails /></ProtectedRoute>} />
              <Route path="/payment-processors" element={<ProtectedRoute><PaymentProcessors /></ProtectedRoute>} />
              <Route path="/payment-setup" element={<ProtectedRoute><PaymentSetup /></ProtectedRoute>} />
              <Route path="/stripe-connect" element={<ProtectedRoute><StripeConnect /></ProtectedRoute>} />
              <Route path="/square-connect" element={<ProtectedRoute><SquareConnect /></ProtectedRoute>} />
              <Route path="/paypal-connect" element={<ProtectedRoute><PayPalConnect /></ProtectedRoute>} />
              <Route path="/authorizenet-connect" element={<ProtectedRoute><AuthorizeNetConnect /></ProtectedRoute>} />
              <Route path="/epicpayment-connect" element={<ProtectedRoute><EpicPaymentConnect /></ProtectedRoute>} />
              <Route path="/nmi-connect" element={<ProtectedRoute><NMIConnect /></ProtectedRoute>} />
              <Route path="/braintree-connect" element={<ProtectedRoute><BraintreeConnect /></ProtectedRoute>} />
              <Route path="/usaepay-connect" element={<ProtectedRoute><USAePayConnect /></ProtectedRoute>} />
              <Route path="/paykickstart-connect" element={<ProtectedRoute><PayKickstartConnect /></ProtectedRoute>} />
              <Route path="/durango-connect" element={<ProtectedRoute><DurangoConnect /></ProtectedRoute>} />
              <Route path="/hostmerchant-connect" element={<ProtectedRoute><HostMerchantConnect /></ProtectedRoute>} />
              <Route path="/adyen-connect" element={<ProtectedRoute><AdyenConnect /></ProtectedRoute>} />
              <Route path="/worldpay-connect" element={<ProtectedRoute><WorldPayConnect /></ProtectedRoute>} />
              <Route path="/checkoutcom-connect" element={<ProtectedRoute><CheckoutComConnect /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/integration-guides" element={<ProtectedRoute><IntegrationGuides /></ProtectedRoute>} />
              <Route path="/billing-settings" element={<ProtectedRoute><BillingSettings /></ProtectedRoute>} />
              <Route path="/seller-page-editor" element={<ProtectedRoute><SellerPageEditor /></ProtectedRoute>} />
              <Route path="/customize/:id" element={<ProtectedRoute><ProductCustomizer /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><EnhancedCheckout /></ProtectedRoute>} />
              <Route path="/marketplace-checkout" element={<ProtectedRoute><MarketplaceCheckout /></ProtectedRoute>} />
              <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
              <Route path="/watchlist" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
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
