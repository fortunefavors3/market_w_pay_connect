import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ArrowLeft, CheckCircle, AlertTriangle, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const HostMerchantConnect = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [credentials, setCredentials] = useState({
    merchantId: '',
    apiKey: '',
    apiSecret: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchConnectionStatus();
    }
  }, [user?.id]);

  const fetchConnectionStatus = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/users/${user.id}/hostmerchant-status`);
      setConnectionStatus(response.data);
    } catch (error) {
      console.error('Error fetching Host Merchant status:', error);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/hostmerchant/verify-credentials`, {
        user_id: user.id,
        merchant_id: credentials.merchantId,
        api_key: credentials.apiKey,
        api_secret: credentials.apiSecret
      });

      if (response.data.success) {
        toast({
          title: "Host Merchant Services Connected!",
          description: "Your account has been successfully connected.",
        });
        updateUser({ hostmerchantConnected: true });
        fetchConnectionStatus();
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error.response?.data?.detail || "Failed to verify credentials.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/hostmerchant/disconnect`, {
        user_id: user.id
      });
      toast({
        title: "Disconnected",
        description: "Host Merchant Services has been disconnected.",
      });
      updateUser({ hostmerchantConnected: false });
      setConnectionStatus(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect.",
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
            <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center bg-white border">
              <img
                src="https://raw.githubusercontent.com/fortunefavors3/image-hosting/main/cropped-HMS-favicon-512x512-SR19-8R1.webp"
                alt="Host Merchant Services Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <CardTitle className="text-2xl">Host Merchant Services</CardTitle>
              <CardDescription>
                Competitive rates for all business types
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {connectionStatus?.connected ? (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Connected!</strong> Your Host Merchant account is active.
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

              <Button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-rose-500 to-red-700 text-white hover:from-rose-600 hover:to-red-800 border-none"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Disconnect Host Merchant
              </Button>
            </div>
          ) : (
            <form onSubmit={handleConnect} className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Enter your Host Merchant Services API credentials from your merchant portal.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="merchantId">Merchant ID</Label>
                <Input
                  id="merchantId"
                  type="text"
                  placeholder="Enter your Merchant ID"
                  value={credentials.merchantId}
                  onChange={(e) => setCredentials({...credentials, merchantId: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API Key"
                  value={credentials.apiKey}
                  onChange={(e) => setCredentials({...credentials, apiKey: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiSecret">API Secret</Label>
                <Input
                  id="apiSecret"
                  type="password"
                  placeholder="Enter your API Secret"
                  value={credentials.apiSecret}
                  onChange={(e) => setCredentials({...credentials, apiSecret: e.target.value})}
                  required
                />
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Manual Fee Collection:</strong> Platform fees (5.5%) will be invoiced monthly.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                disabled={isLoading || !credentials.merchantId || !credentials.apiKey}
                className="w-full bg-gradient-to-r from-rose-500 to-red-700 text-white hover:from-rose-600 hover:to-red-800 border-none"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Connect Host Merchant
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HostMerchantConnect;
