import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  CreditCard,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const StripeConnect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, updateUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stripeStatus, setStripeStatus] = useState({
    has_account: false,
    stripe_account_id: null,
    onboarding_complete: false,
    charges_enabled: false,
    payouts_enabled: false
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: '/stripe-connect' } } });
    }
  }, [isAuthenticated, navigate]);

  // Check if returning from Stripe onboarding
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('stripe_return') === 'success') {
      toast({
        title: "Welcome back!",
        description: "Checking your Stripe account status...",
      });
      fetchStripeStatus();
    }
  }, [location]);

  // Fetch Stripe status on mount
  useEffect(() => {
    if (user?.id) {
      fetchStripeStatus();
    }
  }, [user?.id]);

  const fetchStripeStatus = async () => {
    if (!user?.id) return;

    try {
      setRefreshing(true);
      const response = await axios.get(`${BACKEND_URL}/api/users/${user.id}/stripe-status`);
      setStripeStatus(response.data);

      // If they have an account, update status from Stripe
      if (response.data.stripe_account_id) {
        await updateStripeStatus();
      }
    } catch (error) {
      console.error('Error fetching Stripe status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Stripe account status",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const updateStripeStatus = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/users/${user.id}/stripe-status-update`);
      if (response.data.success) {
        setStripeStatus(prev => ({
          ...prev,
          onboarding_complete: response.data.onboarding_complete,
          charges_enabled: response.data.charges_enabled,
          payouts_enabled: response.data.payouts_enabled
        }));

        // Update user context with Stripe status
        updateUser({
          stripeConnected: response.data.charges_enabled && response.data.payouts_enabled
        });
      }
    } catch (error) {
      console.error('Error updating Stripe status:', error);
    }
  };

  const handleConnectStripe = async () => {
    try {
      setLoading(true);

      // Step 1: Create Stripe Connected Account
      const createAccountResponse = await axios.post(`${BACKEND_URL}/api/stripe-connect/create-account`, {
        user_id: user.id,
        email: user.email,
        business_type: 'individual',
        country: 'US'
      });

      const accountId = createAccountResponse.data.account_id;

      // Step 2: Save account ID to user
      await axios.post(`${BACKEND_URL}/api/users/stripe-account`, {
        user_id: user.id,
        stripe_account_id: accountId
      });

      // Step 3: Create onboarding link
      const linkResponse = await axios.post(`${BACKEND_URL}/api/stripe-connect/create-account-link`, {
        account_id: accountId,
        refresh_url: `${window.location.origin}/stripe-connect?stripe_return=refresh`,
        return_url: `${window.location.origin}/stripe-connect?stripe_return=success`
      });

      // Step 4: Redirect to Stripe onboarding
      window.location.href = linkResponse.data.url;

    } catch (error) {
      console.error('Error connecting Stripe:', error);
      toast({
        title: "Connection Failed",
        description: error.response?.data?.detail || "Failed to connect with Stripe. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleContinueOnboarding = async () => {
    try {
      setLoading(true);

      // Create a new account link for existing account
      const linkResponse = await axios.post(`${BACKEND_URL}/api/stripe-connect/create-account-link`, {
        account_id: stripeStatus.stripe_account_id,
        refresh_url: `${window.location.origin}/stripe-connect?stripe_return=refresh`,
        return_url: `${window.location.origin}/stripe-connect?stripe_return=success`
      });

      window.location.href = linkResponse.data.url;

    } catch (error) {
      console.error('Error continuing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to resume onboarding. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleViewDashboard = async () => {
    try {
      setLoading(true);

      const response = await axios.post(`${BACKEND_URL}/api/stripe-connect/create-login-link/${stripeStatus.stripe_account_id}`);
      
      window.open(response.data.url, '_blank');
      setLoading(false);

    } catch (error) {
      console.error('Error creating login link:', error);
      toast({
        title: "Error",
        description: "Failed to access Stripe dashboard.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const renderConnectionStatus = () => {
    if (!stripeStatus.has_account) {
      return (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Connect your Stripe account to start receiving payments from buyers.
          </AlertDescription>
        </Alert>
      );
    }

    if (!stripeStatus.onboarding_complete) {
      return (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Your Stripe account setup is incomplete. Please continue the onboarding process.
          </AlertDescription>
        </Alert>
      );
    }

    if (!stripeStatus.charges_enabled || !stripeStatus.payouts_enabled) {
      return (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Your Stripe account is under review. You'll be able to receive payments once approved.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Your Stripe account is fully connected! You can now receive payments from buyers.
        </AlertDescription>
      </Alert>
    );
  };

  const isFullyConnected = stripeStatus.charges_enabled && stripeStatus.payouts_enabled;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Setup</h1>
        <p className="text-gray-600">Connect your Stripe account to receive payments</p>
      </div>

      {/* Status Alert */}
      <div className="mb-6">
        {renderConnectionStatus()}
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center p-2">
                <img 
                  src="https://images.stripeassets.com/fzn2n1nzq965/HTTOloNPhisV9P4hlMPNA/cacf1bb88b9fc492dfad34378d844280/Stripe_icon_-_square.svg?q=80&w=1082"
                  alt="Stripe logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <CardTitle className="text-xl">Stripe Connect</CardTitle>
                <CardDescription>Secure payment processing for your marketplace</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchStripeStatus}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Account Status</p>
              <Badge className={stripeStatus.has_account ? 'bg-blue-500' : 'bg-gray-400'}>
                {stripeStatus.has_account ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Onboarding</p>
              <Badge className={stripeStatus.onboarding_complete ? 'bg-green-500' : 'bg-gray-400'}>
                {stripeStatus.onboarding_complete ? 'Complete' : 'Pending'}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Accept Payments</p>
              <Badge className={stripeStatus.charges_enabled ? 'bg-green-500' : 'bg-gray-400'}>
                {stripeStatus.charges_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Receive Payouts</p>
              <Badge className={stripeStatus.payouts_enabled ? 'bg-green-500' : 'bg-gray-400'}>
                {stripeStatus.payouts_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>

          {/* Information Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-gray-900">How Stripe Connect Works</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Secure payment processing powered by Stripe</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Funds deposited directly to your bank account</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>CheqMart platform fee: 5.5% per transaction</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Stripe processing fee: 2.9% + $0.30 per transaction</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Track all transactions in your Stripe dashboard</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!stripeStatus.has_account && (
              <Button 
                onClick={handleConnectStripe} 
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Connect with Stripe
                  </>
                )}
              </Button>
            )}

            {stripeStatus.has_account && !stripeStatus.onboarding_complete && (
              <Button 
                onClick={handleContinueOnboarding} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Continue Onboarding
                  </>
                )}
              </Button>
            )}

            {isFullyConnected && (
              <Button 
                onClick={handleViewDashboard} 
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Stripe Dashboard
                  </>
                )}
              </Button>
            )}

            {stripeStatus.has_account && (
              <Button 
                onClick={fetchStripeStatus}
                variant="outline"
                disabled={refreshing}
              >
                {refreshing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Status
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="text-sm text-gray-600 pt-4 border-t">
            <p className="mb-2">
              <strong>Need help?</strong> Stripe's onboarding process is quick and secure. You'll need:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Government-issued ID</li>
              <li>Bank account details</li>
              <li>Business information (if applicable)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StripeConnect;
