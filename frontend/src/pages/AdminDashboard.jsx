import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { 
  Users, DollarSign, AlertTriangle, Shield, Search, 
  CheckCircle, XCircle, Ban, Unlock, Eye, RefreshCw,
  TrendingUp, CreditCard, Activity, ArrowLeft, Loader2,
  ShoppingCart, Target, AlertOctagon, BarChart3
} from 'lucide-react';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Funnel Step Component for visualization
const FunnelStep = ({ label, count, percentage, color, highlight, isNegative }) => (
  <div className={`flex items-center gap-4 ${highlight ? 'bg-green-50 p-3 rounded-lg border border-green-200' : ''}`}>
    <div className="w-32 text-right">
      <span className={`text-sm font-medium ${isNegative ? 'text-red-600' : 'text-gray-700'}`}>{label}</span>
    </div>
    <div className="flex-1">
      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
    <div className="w-24 text-right">
      <span className={`text-lg font-bold ${isNegative ? 'text-red-600' : 'text-gray-900'}`}>{count}</span>
      <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [blockedIdentifiers, setBlockedIdentifiers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [checkoutAnalytics, setCheckoutAnalytics] = useState(null);
  const [fraudStats, setFraudStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sellerFilter, setSellerFilter] = useState('all');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showSellerDetail, setShowSellerDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, sellersRes, invoicesRes, blockedRes, activityRes, checkoutRes, fraudRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/dashboard-stats`),
        axios.get(`${BACKEND_URL}/api/admin/sellers?limit=100`),
        axios.get(`${BACKEND_URL}/api/admin/invoices?limit=100`),
        axios.get(`${BACKEND_URL}/api/admin/blocked-identifiers?limit=100`),
        axios.get(`${BACKEND_URL}/api/admin/recent-activity`),
        axios.get(`${BACKEND_URL}/api/checkout-analytics/funnel-stats?days=30`).catch(() => ({ data: null })),
        axios.get(`${BACKEND_URL}/api/checkout-analytics/fraud-prevention-stats?days=30`).catch(() => ({ data: null }))
      ]);

      setStats(statsRes.data);
      setSellers(sellersRes.data.sellers);
      setInvoices(invoicesRes.data.invoices);
      setBlockedIdentifiers(blockedRes.data.blocked_identifiers);
      setRecentActivity(activityRes.data.activities);
      setCheckoutAnalytics(checkoutRes.data);
      setFraudStats(fraudRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toggle seller suspension
  const toggleSuspension = async (userId, currentStatus) => {
    setActionLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/admin/sellers/update-status`, {
        user_id: userId,
        is_suspended: !currentStatus,
        reason: !currentStatus ? 'manual_admin_action' : null
      });

      toast({
        title: currentStatus ? "Seller Unsuspended" : "Seller Suspended",
        description: `Seller ${userId} has been ${currentStatus ? 'unsuspended' : 'suspended'}.`,
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update seller status.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Mark invoice as paid
  const markInvoicePaid = async (invoiceId) => {
    setActionLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/admin/invoices/mark-paid`, {
        invoice_id: invoiceId
      });

      toast({
        title: "Invoice Marked Paid",
        description: response.data.seller_unsuspended 
          ? "Invoice paid and seller has been unsuspended."
          : "Invoice has been marked as paid.",
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark invoice as paid.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  // View seller details
  const viewSellerDetails = async (userId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/sellers/${userId}`);
      setSelectedSeller(response.data);
      setShowSellerDetail(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load seller details.",
        variant: "destructive"
      });
    }
  };

  // Filter sellers
  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = !searchTerm || 
      seller.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.phone?.includes(searchTerm) ||
      seller.id?.includes(searchTerm);
    
    const matchesFilter = sellerFilter === 'all' ||
      (sellerFilter === 'suspended' && seller.is_suspended) ||
      (sellerFilter === 'active' && !seller.is_suspended);
    
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage sellers, fees, and platform operations</p>
              </div>
            </div>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Sellers</p>
                  <p className="text-3xl font-bold">{stats?.sellers?.total || 0}</p>
                  <p className="text-blue-200 text-xs mt-1">
                    {stats?.sellers?.active || 0} active
                  </p>
                </div>
                <Users className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Suspended</p>
                  <p className="text-3xl font-bold">{stats?.sellers?.suspended || 0}</p>
                  <p className="text-red-200 text-xs mt-1">
                    accounts on hold
                  </p>
                </div>
                <Ban className="w-10 h-10 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Unpaid Fees</p>
                  <p className="text-3xl font-bold">{formatCurrency(stats?.fees?.total_unpaid)}</p>
                  <p className="text-amber-200 text-xs mt-1">
                    {stats?.fees?.unpaid_invoices_count || 0} invoices
                  </p>
                </div>
                <AlertTriangle className="w-10 h-10 text-amber-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Platform Sales</p>
                  <p className="text-3xl font-bold">{formatCurrency(stats?.platform?.total_sales)}</p>
                  <p className="text-green-200 text-xs mt-1">
                    all time
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="sellers" className="space-y-4">
          <TabsList className="bg-white">
            <TabsTrigger value="sellers" className="data-[state=active]:bg-blue-100">
              <Users className="w-4 h-4 mr-2" />
              Sellers
            </TabsTrigger>
            <TabsTrigger value="checkout" className="data-[state=active]:bg-blue-100">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Checkout Analytics
            </TabsTrigger>
            <TabsTrigger value="invoices" className="data-[state=active]:bg-blue-100">
              <DollarSign className="w-4 h-4 mr-2" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="fraud" className="data-[state=active]:bg-blue-100">
              <Shield className="w-4 h-4 mr-2" />
              Fraud Prevention
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-blue-100">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Sellers Tab */}
          <TabsContent value="sellers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Seller Management</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search sellers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    <select
                      value={sellerFilter}
                      onChange={(e) => setSellerFilter(e.target.value)}
                      className="border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="all">All Sellers</option>
                      <option value="active">Active Only</option>
                      <option value="suspended">Suspended Only</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-gray-600">
                        <th className="pb-3 font-medium">Seller</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Total Sales</th>
                        <th className="pb-3 font-medium">Pending Fees</th>
                        <th className="pb-3 font-medium">Processors</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSellers.map((seller) => (
                        <tr key={seller.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">
                            <div>
                              <p className="font-medium text-gray-900">{seller.email || 'No email'}</p>
                              <p className="text-sm text-gray-500">{seller.phone || seller.id}</p>
                            </div>
                          </td>
                          <td className="py-3">
                            {seller.is_suspended ? (
                              <Badge className="bg-red-100 text-red-700">
                                <XCircle className="w-3 h-3 mr-1" />
                                Suspended
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 font-medium">{formatCurrency(seller.total_sales)}</td>
                          <td className="py-3">
                            {seller.pending_fees > 0 ? (
                              <span className="text-red-600 font-medium">{formatCurrency(seller.pending_fees)}</span>
                            ) : (
                              <span className="text-gray-400">$0.00</span>
                            )}
                          </td>
                          <td className="py-3">
                            <div className="flex flex-wrap gap-1">
                              {seller.processors?.length > 0 ? (
                                seller.processors.map((p, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                                ))
                              ) : (
                                <span className="text-gray-400 text-sm">None</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => viewSellerDetails(seller.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant={seller.is_suspended ? "outline" : "destructive"}
                                size="sm"
                                onClick={() => toggleSuspension(seller.id, seller.is_suspended)}
                                disabled={actionLoading}
                              >
                                {seller.is_suspended ? (
                                  <><Unlock className="w-4 h-4 mr-1" /> Unsuspend</>
                                ) : (
                                  <><Ban className="w-4 h-4 mr-1" /> Suspend</>
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredSellers.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No sellers found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Checkout Analytics Tab - Fraud Prevention Metrics */}
          <TabsContent value="checkout">
            <div className="space-y-6">
              {/* Key Fraud Prevention Metric */}
              <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <AlertOctagon className="w-6 h-6" />
                    Fraud Prevention Effectiveness
                  </CardTitle>
                  <CardDescription className="text-red-100">
                    Checkouts abandoned at 2FA step = Potential fraud attempts blocked
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-red-100 text-sm">Potential Fraud Blocked</p>
                      <p className="text-4xl font-bold">{fraudStats?.summary?.total_prevented_attempts || 0}</p>
                      <p className="text-red-200 text-sm mt-1">abandoned at 2FA</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-red-100 text-sm">Value Protected</p>
                      <p className="text-4xl font-bold">{formatCurrency(fraudStats?.summary?.total_value_prevented || 0)}</p>
                      <p className="text-red-200 text-sm mt-1">prevented losses</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-red-100 text-sm">Prevention Rate</p>
                      <p className="text-4xl font-bold">{fraudStats?.summary?.prevention_rate || 0}%</p>
                      <p className="text-red-200 text-sm mt-1">of 2FA drop-offs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Checkout Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Checkout Funnel (Last 30 Days)
                  </CardTitle>
                  <CardDescription>
                    Track where users drop off in the checkout process
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Funnel Visualization */}
                    <div className="space-y-3">
                      <FunnelStep 
                        label="Checkouts Started" 
                        count={checkoutAnalytics?.funnel?.checkouts_started || 0}
                        percentage={100}
                        color="bg-blue-500"
                      />
                      <FunnelStep 
                        label="Shipping Completed" 
                        count={checkoutAnalytics?.funnel?.shipping_completed || 0}
                        percentage={checkoutAnalytics?.rates?.step1_to_step2 || 0}
                        color="bg-indigo-500"
                      />
                      <FunnelStep 
                        label="Payment Entered" 
                        count={checkoutAnalytics?.funnel?.payment_entered || 0}
                        percentage={checkoutAnalytics?.rates?.step2_to_buynow || 0}
                        color="bg-purple-500"
                      />
                      <FunnelStep 
                        label="'Buy Now' Clicked" 
                        count={checkoutAnalytics?.funnel?.buy_now_clicked || 0}
                        percentage={100}
                        color="bg-green-500"
                        highlight
                      />
                      <div className="border-t-2 border-dashed border-red-300 pt-3 mt-3">
                        <p className="text-sm text-red-600 font-medium mb-2">⚠️ 2FA Verification Step (Fraud Detection Point)</p>
                      </div>
                      <FunnelStep 
                        label="2FA Completed (Legitimate)" 
                        count={checkoutAnalytics?.funnel?.tfa_completed || 0}
                        percentage={checkoutAnalytics?.rates?.buynow_to_complete || 0}
                        color="bg-green-600"
                      />
                      <FunnelStep 
                        label="2FA Abandoned (Potential Fraud)" 
                        count={checkoutAnalytics?.funnel?.tfa_abandoned || 0}
                        percentage={checkoutAnalytics?.rates?.tfa_abandonment_rate || 0}
                        color="bg-red-500"
                        isNegative
                      />
                    </div>

                    {/* Conversion Rates */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{checkoutAnalytics?.rates?.step1_to_step2 || 0}%</p>
                        <p className="text-xs text-gray-600">Shipping → Payment</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{checkoutAnalytics?.rates?.step2_to_buynow || 0}%</p>
                        <p className="text-xs text-gray-600">Payment → Buy Now</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{checkoutAnalytics?.rates?.buynow_to_complete || 0}%</p>
                        <p className="text-xs text-gray-600">Buy Now → Complete</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-2xl font-bold text-red-600">{checkoutAnalytics?.rates?.tfa_abandonment_rate || 0}%</p>
                        <p className="text-xs text-red-700 font-medium">2FA Abandonment</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Insight Card */}
              <Alert className="bg-amber-50 border-amber-200">
                <Target className="w-5 h-5 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Key Insight:</strong> Users who click "Buy Now" but abandon at 2FA verification are likely attempting fraud. 
                  Legitimate users have a {checkoutAnalytics?.rates?.buynow_to_complete || 0}% completion rate after clicking Buy Now.
                  <br />
                  <span className="text-sm">The 2FA step catches fraudsters who didn't expect verification.</span>
                </AlertDescription>
              </Alert>

              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Successful Checkouts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-5xl font-bold text-green-600">{fraudStats?.summary?.completed_checkouts || 0}</p>
                      <p className="text-gray-600 mt-2">orders completed with 2FA</p>
                      <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Overall Conversion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-5xl font-bold text-blue-600">{checkoutAnalytics?.rates?.overall_conversion || 0}%</p>
                      <p className="text-gray-600 mt-2">checkout start to completion</p>
                      <p className="text-sm text-gray-500 mt-1">includes legitimate drop-offs</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Fee Invoices</CardTitle>
                <CardDescription>Manage platform fee invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-gray-600">
                        <th className="pb-3 font-medium">Invoice</th>
                        <th className="pb-3 font-medium">Seller</th>
                        <th className="pb-3 font-medium">Amount</th>
                        <th className="pb-3 font-medium">Due Date</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">
                            <p className="font-medium">{invoice.billing_period}</p>
                            <p className="text-xs text-gray-500 font-mono">{invoice.id?.slice(0, 8)}...</p>
                          </td>
                          <td className="py-3">
                            <p className="text-sm">{invoice.seller_email || invoice.seller_id}</p>
                          </td>
                          <td className="py-3 font-medium">{formatCurrency(invoice.amount)}</td>
                          <td className="py-3 text-sm">{invoice.due_date}</td>
                          <td className="py-3">
                            {invoice.paid ? (
                              <Badge className="bg-green-100 text-green-700">Paid</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700">Unpaid</Badge>
                            )}
                          </td>
                          <td className="py-3">
                            {!invoice.paid && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markInvoicePaid(invoice.id)}
                                disabled={actionLoading}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Mark Paid
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {invoices.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No invoices found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fraud Prevention Tab */}
          <TabsContent value="fraud">
            <Card>
              <CardHeader>
                <CardTitle>Blocked Identifiers</CardTitle>
                <CardDescription>
                  Phone numbers, emails, and cards blocked from creating new accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {blockedIdentifiers.length > 0 ? (
                    blockedIdentifiers.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.type === 'phone' ? 'bg-blue-100' :
                            item.type === 'email' ? 'bg-purple-100' : 'bg-amber-100'
                          }`}>
                            {item.type === 'phone' ? '📱' : item.type === 'email' ? '✉️' : '💳'}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{item.type.replace('_', ' ')}</p>
                            <p className="text-sm text-gray-600 font-mono">
                              {item.type === 'card_fingerprint' 
                                ? `****${item.card_last4} (${item.card_brand})`
                                : item.original_value || item.value
                              }
                            </p>
                            <p className="text-xs text-gray-400">
                              Blocked: {formatDate(item.blocked_at)} • Reason: {item.reason}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-red-600">
                          Original: {item.original_user_id}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No blocked identifiers</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'sale' ? 'bg-green-100' :
                        activity.type === 'suspension' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {activity.type === 'sale' ? (
                          <DollarSign className="w-5 h-5 text-green-600" />
                        ) : activity.type === 'suspension' ? (
                          <Ban className="w-5 h-5 text-red-600" />
                        ) : (
                          <CreditCard className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-gray-500">{activity.seller_id}</p>
                      </div>
                      <div className="text-right">
                        {activity.amount && (
                          <p className="font-medium text-green-600">{formatCurrency(activity.amount)}</p>
                        )}
                        <p className="text-xs text-gray-400">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Seller Detail Dialog */}
      <Dialog open={showSellerDetail} onOpenChange={setShowSellerDetail}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seller Details</DialogTitle>
            <DialogDescription>
              {selectedSeller?.seller?.email || selectedSeller?.seller?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSeller && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{selectedSeller.seller?.phone || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={selectedSeller.seller?.is_suspended ? 'bg-red-500' : 'bg-green-500'}>
                    {selectedSeller.seller?.is_suspended ? 'Suspended' : 'Active'}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Recent Payments ({selectedSeller.payments?.length || 0})</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {selectedSeller.payments?.slice(0, 5).map((p, i) => (
                    <div key={i} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                      <span>{formatDate(p.created_at)}</span>
                      <span className="font-medium">{formatCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Fee Invoices ({selectedSeller.invoices?.length || 0})</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {selectedSeller.invoices?.map((inv, i) => (
                    <div key={i} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                      <span>{inv.billing_period}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatCurrency(inv.amount)}</span>
                        <Badge className={inv.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {inv.paid ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSellerDetail(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
