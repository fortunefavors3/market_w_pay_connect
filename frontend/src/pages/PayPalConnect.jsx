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
  Loader2,
  Mail,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const PayPalConnect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, updateUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [paypalStatus, setPaypalStatus] = useState({
    connected: false,
    payer_id: null,
    email: null,
    has_access_token: false
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: '/paypal-connect' } } });
    }
  }, [isAuthenticated, navigate]);

  // Check if returning from PayPal OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      handleOAuthCallback(code, state);
    }
  }, [location]);

  // Fetch PayPal status on mount
  useEffect(() => {
    if (user?.id) {
      fetchPayPalStatus();
    }
  }, [user?.id]);

  const fetchPayPalStatus = async () => {
    if (!user?.id) return;

    try {
      setRefreshing(true);
      const response = await axios.get(`${BACKEND_URL}/api/users/${user.id}/paypal-status`);
      setPaypalStatus(response.data);

      // Update user context
      updateUser({
        paypalConnected: response.data.connected
      });
    } catch (error) {
      console.error('Error fetching PayPal status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch PayPal account status",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleConnectPayPal = async () => {
    try {
      setLoading(true);

      const redirectUrl = `${window.location.origin}/paypal-connect`;

      // Step 1: Get OAuth authorization URL
      const response = await axios.post(`${BACKEND_URL}/api/paypal-connect/initiate-oauth`, {
        user_id: user.id,
        redirect_url: redirectUrl
      });

      // Step 2: Redirect to PayPal OAuth
      window.location.href = response.data.authorization_url;

    } catch (error) {
      console.error('Error connecting PayPal:', error);
      toast({
        title: "Connection Failed",
        description: error.response?.data?.detail || "Failed to connect with PayPal. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleOAuthCallback = async (code, state) => {
    try {
      setLoading(true);
      
      toast({
        title: "Processing...",
        description: "Completing PayPal connection...",
      });

      // Extract user_id from state
      const userId = state.split('_')[0];
      const redirectUrl = `${window.location.origin}/paypal-connect`;

      // Step 1: Exchange code for access token
      const tokenResponse = await axios.post(
        `${BACKEND_URL}/api/paypal-connect/exchange-token?redirect_url=${encodeURIComponent(redirectUrl)}`,
        {
          code: code,
          state: state
        }
      );

      const { access_token, refresh_token, payer_id, email } = tokenResponse.data;

      // Step 2: Save tokens to user account
      await axios.post(`${BACKEND_URL}/api/users/paypal-account`, {
        user_id: userId,
        payer_id: payer_id,
        email: email,
        access_token: access_token,
        refresh_token: refresh_token
      });

      // Step 3: Update local state
      setPaypalStatus({
        connected: true,
        payer_id: payer_id,
        email: email,
        has_access_token: true
      });

      updateUser({
        paypalConnected: true
      });

      toast({
        title: "Success!",
        description: "Your PayPal account has been connected successfully.",
      });

      // Clean up URL
      window.history.replaceState({}, document.title, "/paypal-connect");

    } catch (error) {
      console.error('Error in OAuth callback:', error);
      toast({
        title: "Connection Failed",
        description: error.response?.data?.detail || "Failed to complete PayPal connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your PayPal account?')) {
      return;
    }

    try {
      setLoading(true);

      // Update local state
      setPaypalStatus({
        connected: false,
        payer_id: null,
        email: null,
        has_access_token: false
      });

      updateUser({
        paypalConnected: false
      });

      toast({
        title: "Disconnected",
        description: "Your PayPal account has been disconnected.",
      });

    } catch (error) {
      console.error('Error disconnecting PayPal:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect PayPal account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderConnectionStatus = () => {
    if (!paypalStatus.connected) {
      return (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Connect your PayPal account to start accepting payments from buyers.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Your PayPal account is fully connected! You can now accept payments from buyers.
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/payment-setup')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Payment Setup
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PayPal Payment Setup</h1>
        <p className="text-gray-600">Connect your PayPal account to accept payments</p>
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
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 border border-gray-200">
                <img 
                  src="https://www.paypalobjects.com/marketing/web/logos/paypal-mark-color.svg"
                  alt="PayPal logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <CardTitle className="text-xl">PayPal</CardTitle>
                <CardDescription>Accept payments with PayPal's trusted platform</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchPayPalStatus}
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
              <Badge className={paypalStatus.connected ? 'bg-green-500' : 'bg-gray-400'}>
                {paypalStatus.connected ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </>
                ) : (
                  'Not Connected'
                )}
              </Badge>
            </div>
            {paypalStatus.email && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">PayPal Email</p>
                <div className="flex items-center gap-1 text-sm">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="truncate">{paypalStatus.email}</span>
                </div>
              </div>
            )}
          </div>

          {paypalStatus.payer_id && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">
                  Payer ID: <span className="font-mono font-semibold">{paypalStatus.payer_id}</span>
                </span>
              </div>
            </div>
          )}

          {/* Information Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-gray-900">How PayPal Payments Work</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Secure payment processing powered by PayPal</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Funds deposited directly to your PayPal account</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Effinsure platform fee: 5.5% per transaction</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>PayPal processing fee: 2.99% per transaction</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Accept payments from PayPal and credit cards</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!paypalStatus.connected ? (
              <Button 
                onClick={handleConnectPayPal} 
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Connect with PayPal
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => window.open('https://www.paypal.com/myaccount', '_blank')}
                  variant="outline"
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View PayPal Account
                </Button>
                <Button 
                  onClick={handleDisconnect}
                  variant="outline"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    'Disconnect'
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Help Text */}
          <div className="text-sm text-gray-600 pt-4 border-t">
            <p className="mb-2">
              <strong>About PayPal OAuth:</strong> You'll be redirected to PayPal to authorize this application.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Securely connects your existing PayPal account</li>
              <li>No API keys needed - OAuth handles authentication</li>
              <li>You can revoke access anytime from your PayPal settings</li>
              <li>Works with both PayPal balance and linked payment methods</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayPalConnect;
