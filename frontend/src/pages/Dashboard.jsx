import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { 
  Package, ShoppingBag, MessageSquare, Heart, Settings, Plus, Edit, Trash2, Eye, 
  User, CreditCard, DollarSign, TrendingUp, AlertTriangle, Ban, Calendar,
  Shield, Palette, Percent, ShieldCheck, BarChart3, Target
} from 'lucide-react';
import { mockOrders, mockMyListings, mockMessages } from '../mock';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';
import AvatarUpload from '../components/AvatarUpload';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeListings] = useState(mockMyListings.filter(l => l.status === 'active'));
  const [soldListings] = useState(mockMyListings.filter(l => l.status === 'sold'));
  
  // Sales statistics state
  const [salesStats, setSalesStats] = useState({
    all_time: { total_sales: 0, total_orders: 0 },
    last_30_days: { total_sales: 0, total_orders: 0 }
  });
  
  // Fee information state (for manual processor users)
  const [feeInfo, setFeeInfo] = useState({
    has_manual_processor: false,
    pending_fees: [],
    total_due: 0,
    past_due_amount: 0,
    grace_period_amount: 0,
    is_suspended: false
  });
  
  // Fraud prevention analytics for sellers
  const [fraudStats, setFraudStats] = useState(null);
  
  const [loadingStats, setLoadingStats] = useState(true);
  const [payingFees, setPayingFees] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: '/dashboard' } } });
    }
  }, [isAuthenticated, navigate]);

  // Fetch sales stats and fee info
  useEffect(() => {
    if (user?.id) {
      fetchSalesStats();
      fetchFeeInfo();
      fetchFraudStats();
    }
  }, [user?.id]);

  const fetchSalesStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/users/${user.id}/sales-stats`);
      setSalesStats(response.data);
    } catch (error) {
      console.error('Error fetching sales stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchFeeInfo = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/users/${user.id}/pending-fees`);
      setFeeInfo(response.data);
    } catch (error) {
      console.error('Error fetching fee info:', error);
    }
  };

  const fetchFraudStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/checkout-analytics/fraud-prevention-stats?days=30`);
      setFraudStats(response.data);
    } catch (error) {
      console.error('Error fetching fraud stats:', error);
    }
  };

  const handlePayFees = async () => {
    setPayingFees(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/users/pay-fees`, {
        user_id: user.id
      });
      
      if (response.data.payment_pending) {
        toast({
          title: "Payment Processing Coming Soon",
          description: response.data.message,
        });
      } else {
        toast({
          title: "No Fees Due",
          description: response.data.message,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process fee payment request.",
        variant: "destructive"
      });
    } finally {
      setPayingFees(false);
    }
  };

  const handleDeleteListing = (id) => {
    toast({
      title: "Listing deleted",
      description: "Your listing has been removed.",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get fee amount color based on status
  const getFeeAmountColor = (status) => {
    switch (status) {
      case 'past_due':
        return 'text-red-600';
      case 'grace_period':
        return 'text-orange-500';
      default:
        return 'text-gray-900';
    }
  };

  // Format due date with status
  const formatDueDate = (dueDateStr, status) => {
    const dueDate = new Date(dueDateStr);
    const formattedDate = dueDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    if (status === 'past_due') {
      return `Overdue since ${formattedDate}`;
    } else if (status === 'grace_period') {
      return `Due ${formattedDate} (Grace Period)`;
    }
    return `Due ${formattedDate}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Account Suspension Banner */}
      {feeInfo.is_suspended && (
        <Alert className="mb-6 border-red-500 bg-red-50">
          <Ban className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800 font-bold">Account Suspended</AlertTitle>
          <AlertDescription className="text-red-700">
            Your account has been temporarily suspended due to past-due platform fees totaling {formatCurrency(feeInfo.past_due_amount)}. 
            Your listings are hidden and you cannot create new listings until your fees are paid.
            <Button 
              onClick={handlePayFees}
              className="ml-4 bg-red-600 hover:bg-red-700"
              size="sm"
              disabled={payingFees}
            >
              {payingFees ? 'Processing...' : 'Pay Now'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Seller Benefits Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-6 mb-8 shadow-lg">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 text-white">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Zero Fraud</h3>
              <p className="text-sm text-purple-100">2FA verification blocks fraudulent purchases automatically</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <Percent className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Low Fees</h3>
              <p className="text-sm text-purple-100">Just 5.5% platform fee, keep more of your profits</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <Palette className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Custom Storefronts</h3>
              <p className="text-sm text-purple-100">Design beautiful product pages that convert</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <AvatarUpload size="lg" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-600">Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">⭐ 5.0</Badge>
                <Badge variant="outline">0 reviews</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => navigate('/personal-details')}>
              <User className="w-4 h-4 mr-2" />
              Personal Details
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/payment-setup')}
              className={(!user?.stripeConnected && !user?.squareConnected && !user?.paypalConnected) ? 'border-amber-500 text-amber-700' : ''}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Setup
              {(!user?.stripeConnected && !user?.squareConnected && !user?.paypalConnected) && (
                <Badge className="ml-2 bg-amber-500 hover:bg-amber-600">Required</Badge>
              )}
            </Button>
            <Button variant="outline" onClick={() => navigate('/billing-settings')}>
              <DollarSign className="w-4 h-4 mr-2" />
              Billing Settings
            </Button>
            <Button variant="outline" onClick={() => navigate('/seller-page-editor')}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Seller Page
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Setup Alert */}
      {(!user?.stripeConnected && !user?.squareConnected && !user?.paypalConnected) && !feeInfo.is_suspended && (
        <Card className="mb-6 bg-amber-50 border-amber-500">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-1">Action Required: Connect Payment Processor</h3>
                <p className="text-sm text-amber-800 mb-3">
                  Connect Stripe, Square, or PayPal to start receiving payments from buyers. 
                  This is required before you can list items for sale.
                </p>
                <Button 
                  onClick={() => navigate('/payment-setup')}
                  className="bg-amber-600 hover:bg-amber-700"
                  size="sm"
                >
                  Set Up Payments
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Integrations Card */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Integrate with Your Platform</h3>
              <p className="text-sm text-gray-700 mb-3">
                Already have a store on Shopify, Wix, WooCommerce, Etsy, or BigCommerce? 
                Get step-by-step instructions to integrate Effinsure checkout.
              </p>
              <Button 
                onClick={() => navigate('/integration-guides')}
                variant="outline"
                className="border-blue-500 text-blue-700 hover:bg-blue-50"
                size="sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                View Integration Guides
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* All-Time Sales */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">All-Time Sales</p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {loadingStats ? '...' : formatCurrency(salesStats.all_time.total_sales)}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {salesStats.all_time.total_orders} orders
                </p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Last 30 Days Sales */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Last 30 Days</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {loadingStats ? '...' : formatCurrency(salesStats.last_30_days.total_sales)}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {salesStats.last_30_days.total_orders} orders
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Prevention Analytics Section */}
      {fraudStats && (
        <Card className="mb-8 border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-red-900">Fraud Prevention Analytics</CardTitle>
                <p className="text-sm text-red-600">Your store's protection status (Last 30 days)</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-700">Fraud Blocked</span>
                </div>
                <p className="text-3xl font-bold text-red-600">{fraudStats.summary?.total_prevented_attempts || 0}</p>
                <p className="text-xs text-gray-500 mt-1">fraudulent attempts stopped</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-700">Value Protected</span>
                </div>
                <p className="text-3xl font-bold text-red-600">{formatCurrency(fraudStats.summary?.total_value_prevented || 0)}</p>
                <p className="text-xs text-gray-500 mt-1">saved from chargebacks</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Verified Orders</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{fraudStats.summary?.completed_checkouts || 0}</p>
                <p className="text-xs text-gray-500 mt-1">legitimate purchases</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded-lg border border-red-100">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">How Effinsure Protects You</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Every checkout requires 2FA verification. Fraudsters who enter stolen card info are stopped when they can't verify the phone number. 
                    This eliminates chargebacks and protects your revenue.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Fees Section (Only for Manual Processor Users) */}
      {feeInfo.has_manual_processor && feeInfo.total_due > 0 && (
        <Card className={`mb-6 ${feeInfo.past_due_amount > 0 ? 'border-red-300 bg-red-50' : feeInfo.grace_period_amount > 0 ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${feeInfo.past_due_amount > 0 ? 'text-red-600' : feeInfo.grace_period_amount > 0 ? 'text-orange-500' : 'text-gray-600'}`} />
                <CardTitle className="text-lg">Platform Fees Due</CardTitle>
              </div>
              <Button 
                onClick={handlePayFees}
                disabled={payingFees}
                className={feeInfo.past_due_amount > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}
              >
                {payingFees ? 'Processing...' : 'Pay Now'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Total Summary */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <p className="text-sm text-gray-600">Total Amount Due</p>
                  <p className={`text-2xl font-bold ${feeInfo.past_due_amount > 0 ? 'text-red-600' : feeInfo.grace_period_amount > 0 ? 'text-orange-500' : 'text-gray-900'}`}>
                    {formatCurrency(feeInfo.total_due)}
                  </p>
                </div>
                {feeInfo.past_due_amount > 0 && (
                  <Badge className="bg-red-500">Past Due: {formatCurrency(feeInfo.past_due_amount)}</Badge>
                )}
                {feeInfo.grace_period_amount > 0 && feeInfo.past_due_amount === 0 && (
                  <Badge className="bg-orange-500">Grace Period: {formatCurrency(feeInfo.grace_period_amount)}</Badge>
                )}
              </div>

              {/* Individual Fee Invoices */}
              <div className="space-y-2">
                {feeInfo.pending_fees.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Calendar className={`w-4 h-4 ${getFeeAmountColor(fee.status)}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {fee.billing_period} Platform Fees
                        </p>
                        <p className={`text-xs ${fee.status === 'past_due' ? 'text-red-600' : fee.status === 'grace_period' ? 'text-orange-500' : 'text-gray-500'}`}>
                          {formatDueDate(fee.due_date, fee.status)}
                        </p>
                      </div>
                    </div>
                    <p className={`font-bold ${getFeeAmountColor(fee.status)}`}>
                      {formatCurrency(fee.amount)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Fee Schedule Info */}
              <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
                <p><strong>Fee Schedule:</strong> Platform fees (5.5%) are due on the 5th of each month for the previous month's transactions.</p>
                <p className="mt-1"><strong>Grace Period:</strong> 15 days after due date. Accounts with fees past the grace period are temporarily suspended.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">{activeListings.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Orders</p>
                <p className="text-2xl font-bold text-gray-900">{mockOrders.length}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Messages</p>
                <p className="text-2xl font-bold text-gray-900">{mockMessages.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Watching</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="listings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        </TabsList>

        {/* My Listings */}
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Listings</CardTitle>
                <Button 
                variant="outline"
                  onClick={() => {
                    if (feeInfo.is_suspended) {
                      toast({
                        title: "Account Suspended",
                        description: "Please pay your past-due fees to create new listings.",
                        variant: "destructive"
                      });
                      return;
                    }
                    navigate('/sell');
                  }}
                  disabled={feeInfo.is_suspended}
                  className={`text-gray hover:bg-blue-500 hover:text-white ${
                    feeInfo.is_suspended ? 'opacity-50 cursor-not-allowed hover:bg-blue-500' : ''
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Listing
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active">
                <TabsList>
                  <TabsTrigger value="active">Active ({activeListings.length})</TabsTrigger>
                  <TabsTrigger value="sold">Sold ({soldListings.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="active" className="space-y-4 mt-4">
                  {activeListings.map((listing) => (
                    <div key={listing.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <img src={listing.images[0]} alt={listing.title} className="w-24 h-24 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                        <p className="text-lg font-bold text-gray-900 mt-1">${listing.price.toFixed(2)}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {listing.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {listing.watchers} watching
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/product/${listing.id}`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/customize/${listing.id}`)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteListing(listing.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="sold" className="space-y-4 mt-4">
                  {soldListings.map((listing) => (
                    <div key={listing.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <img src={listing.images[0]} alt={listing.title} className="w-24 h-24 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                        <p className="text-lg font-bold text-gray-900 mt-1">${listing.price.toFixed(2)}</p>
                        <Badge className="mt-2 bg-green-500">Sold on {new Date(listing.soldDate).toLocaleDateString()}</Badge>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>My Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <img src={order.product.images[0]} alt={order.product.title} className="w-24 h-24 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{order.product.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">Order #{order.id} • {new Date(order.orderDate).toLocaleDateString()}</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">${order.totalPrice.toFixed(2)}</p>
                      <Badge
                      className={`mt-2 text-white hover:text-white ${
                        order.status === 'delivered'
                          ? 'bg-green-500 hover:bg-green-500'
                          : order.status === 'in_transit'
                          ? 'bg-blue-500 hover:bg-blue-500'
                          : 'bg-gray-500 hover:bg-gray-500'
                      }`}
                    >
                      {order.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    </div>
                    <Button 
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="bg-blue-600 text-white hover:bg-blue-700 border-none"
                  >
                    Track Order
                  </Button> 
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages */}
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockMessages.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate('/messages')}
                  >
                    <img src={conversation.sender.avatar} alt={conversation.sender.name} className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{conversation.sender.name}</h3>
                        {conversation.unread > 0 && (
                          <Badge className="bg-blue-600">{conversation.unread} new</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">{conversation.productTitle}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {conversation.messages[conversation.messages.length - 1].text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Watchlist */}
        <TabsContent value="watchlist">
          <Card>
            <CardHeader>
              <CardTitle>Watchlist</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600 py-8">Your watchlist is empty. Start adding items you're interested in!</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
