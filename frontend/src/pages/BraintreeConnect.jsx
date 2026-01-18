import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ArrowLeft, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const BraintreeConnect = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchConnectionStatus();
    }
  }, [user?.id]);

  const fetchConnectionStatus = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/users/${user.id}/braintree-status`);
      setConnectionStatus(response.data);
    } catch (error) {
      console.error('Error fetching Braintree status:', error);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/braintree/create-oauth-url`, {
        user_id: user.id,
        redirect_url: `${window.location.origin}/braintree-connect`
      });

      if (response.data.oauth_url) {
        window.location.href = response.data.oauth_url;
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to initiate Braintree connection.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/braintree/disconnect`, {
        user_id: user.id
      });
      toast({
        title: "Disconnected",
        description: "Braintree has been disconnected from your account.",
      });
      updateUser({ braintreeConnected: false });
      setConnectionStatus(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect Braintree.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/payment-setup')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Payment Setup
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-700 to-purple-700 rounded-xl flex items-center justify-center p-2">
              <img 
                src="https://www.braintreepayments.com/images/braintree-logo-white.svg" 
                alt="Braintree"
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="text-white font-bold text-sm">Braintree</span>'; }}
              />
            </div>
            <div>
              <CardTitle className="text-2xl">Braintree</CardTitle>
              <CardDescription>A PayPal service for seamless payments</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {connectionStatus?.connected ? (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Connected!</strong> Your Braintree account is active.
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Merchant ID</span>
                  <span className="font-medium font-mono">{connectionStatus.merchantId}</span>
                </div>
              </div>

              <Button variant="destructive" onClick={handleDisconnect} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Disconnect Braintree
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">Processing Fee</p>
                  <p className="text-gray-600">2.59% + $0.49</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">Platform Fee</p>
                  <p className="text-gray-600">5.5% (auto-deducted)</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Features:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    OAuth integration (one-click connect)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    PayPal, Venmo, credit card support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Advanced fraud protection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Drop-in UI components
                  </li>
                </ul>
              </div>

              <Button onClick={handleConnect} disabled={isLoading} className="w-full bg-gradient-to-r from-blue-700 to-purple-700">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                Connect with Braintree
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BraintreeConnect;
