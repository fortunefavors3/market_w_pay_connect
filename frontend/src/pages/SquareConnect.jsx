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

const SquareConnect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, updateUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [squareStatus, setSquareStatus] = useState({
    connected: false,
    merchant_id: null,
    has_access_token: false
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: '/square-connect' } } });
    }
  }, [isAuthenticated, navigate]);

  // Check if returning from Square OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      handleOAuthCallback(code, state);
    }
  }, [location]);

  // Fetch Square status on mount
  useEffect(() => {
    if (user?.id) {
      fetchSquareStatus();
    }
  }, [user?.id]);

  const fetchSquareStatus = async () => {
    if (!user?.id) return;

    try {
      setRefreshing(true);
      const response = await axios.get(`${BACKEND_URL}/api/users/${user.id}/square-status`);
      setSquareStatus(response.data);

      // Update user context
      updateUser({
        squareConnected: response.data.connected
      });
    } catch (error) {
      console.error('Error fetching Square status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Square account status",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleConnectSquare = async () => {
    try {
      setLoading(true);

      const redirectUrl = `${window.location.origin}/square-connect`;
      console.log('Initiating Square OAuth with redirect URL:', redirectUrl);

      // Step 1: Get OAuth authorization URL
      const response = await axios.post(`${BACKEND_URL}/api/square-connect/initiate-oauth`, {
        user_id: user.id,
        redirect_url: redirectUrl
      });

      console.log('OAuth response:', response.data);

      if (response.data.authorization_url) {
        // Step 2: Redirect to Square OAuth
        console.log('Redirecting to:', response.data.authorization_url);
        window.location.href = response.data.authorization_url;
      } else {
        throw new Error('No authorization URL received');
      }

    } catch (error) {
      console.error('Error connecting Square:', error);
      toast({
        title: "Connection Failed",
        description: error.response?.data?.detail || "Failed to connect with Square. Please try again.",
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
        description: "Completing Square connection...",
      });

      // Extract user_id from state
      const userId = state.split('_')[0];

      // Step 1: Exchange code for access token
      const tokenResponse = await axios.post(`${BACKEND_URL}/api/square-connect/exchange-token`, {
        code: code,
        state: state
      });

      const { access_token, refresh_token, merchant_id } = tokenResponse.data;

      // Step 2: Save tokens to user account
      await axios.post(`${BACKEND_URL}/api/users/square-account`, {
        user_id: userId,
        merchant_id: merchant_id,
        access_token: access_token,
        refresh_token: refresh_token
      });

      // Step 3: Update local state
      setSquareStatus({
        connected: true,
        merchant_id: merchant_id,
        has_access_token: true
      });

      updateUser({
        squareConnected: true
      });

      toast({
        title: "Success!",
        description: "Your Square account has been connected successfully.",
      });

      // Clean up URL
      window.history.replaceState({}, document.title, "/square-connect");

    } catch (error) {
      console.error('Error in OAuth callback:', error);
      toast({
        title: "Connection Failed",
        description: error.response?.data?.detail || "Failed to complete Square connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Square account?')) {
      return;
    }

    try {
      setLoading(true);

      // For now, just update local state
      // In production, you'd call revoke-token endpoint
      setSquareStatus({
        connected: false,
        merchant_id: null,
        has_access_token: false
      });

      updateUser({
        squareConnected: false
      });

      toast({
        title: "Disconnected",
        description: "Your Square account has been disconnected.",
      });

    } catch (error) {
      console.error('Error disconnecting Square:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect Square account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderConnectionStatus = () => {
    if (!squareStatus.connected) {
      return (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Connect your Square account to start accepting payments from buyers.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Your Square account is fully connected! You can now accept payments from buyers.
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Square Payment Setup</h1>
        <p className="text-gray-600">Connect your Square account to accept payments</p>
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
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center p-2">
                <img 
                  src="https://images.ctfassets.net/2d5q1td6cyxq/aXlc4MSO8ZGKTDIsPuIeW/c2b899a80016ca75b88086647cdd61f7/PD04490_-_white_logo_on_black.png?w=553&h=283&fm=jpg&q=85&bg=rgb%3Affffff&fit=scale&fl=progressive"
                  alt="Square logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <CardTitle className="text-xl">Square</CardTitle>
                <CardDescription>Accept payments with Square's trusted platform</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchSquareStatus}
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
              <Badge className={squareStatus.connected ? 'bg-green-500' : 'bg-gray-400'}>
                {squareStatus.connected ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Merchant ID</p>
              <Badge variant="outline">
                {squareStatus.merchant_id ? `${squareStatus.merchant_id.substring(0, 12)}...` : 'N/A'}
              </Badge>
            </div>
          </div>

          {/* Information Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-gray-900">How Square Payments Work</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Secure payment processing powered by Square</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Funds deposited directly to your Square account</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>CheqMart platform fee: 5.5% per transaction</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Square processing fee: 2.6% + $0.10 per transaction</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Track all transactions in your Square dashboard</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!squareStatus.connected ? (
              <Button 
                onClick={handleConnectSquare} 
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-gray-800 to-gray-600 hover:from-gray-900 hover:to-gray-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Connect with Square
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => window.open('https://squareup.com/dashboard', '_blank')}
                  variant="outline"
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Square Dashboard
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
              <strong>About Square OAuth:</strong> You'll be redirected to Square to authorize this application.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Securely connects your existing Square account</li>
              <li>No API keys needed - OAuth handles authentication</li>
              <li>You can revoke access anytime from your Square dashboard</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SquareConnect;
