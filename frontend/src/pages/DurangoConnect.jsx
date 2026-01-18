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

const DurangoConnect = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [credentials, setCredentials] = useState({
    merchantId: '',
    apiKey: '',
    terminalId: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchConnectionStatus();
    }
  }, [user?.id]);

  const fetchConnectionStatus = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/users/${user.id}/durango-status`);
      setConnectionStatus(response.data);
    } catch (error) {
      console.error('Error fetching Durango status:', error);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/durango/verify-credentials`, {
        user_id: user.id,
        merchant_id: credentials.merchantId,
        api_key: credentials.apiKey,
        terminal_id: credentials.terminalId
      });

      if (response.data.success) {
        toast({
          title: "Durango Connected!",
          description: "Your Durango Merchant Services account has been successfully connected.",
        });
        updateUser({ durangoConnected: true });
        fetchConnectionStatus();
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error.response?.data?.detail || "Failed to verify Durango credentials.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/durango/disconnect`, {
        user_id: user.id
      });
      toast({
        title: "Disconnected",
        description: "Durango has been disconnected from your account.",
      });
      updateUser({ durangoConnected: false });
      setConnectionStatus(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect Durango.",
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
            <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">Durango</span>
            </div>
            <div>
              <CardTitle className="text-2xl">Durango Merchant Services</CardTitle>
              <CardDescription>Specializing in high-risk merchant accounts</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {connectionStatus?.connected ? (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Connected!</strong> Your Durango account is active.
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
                Disconnect Durango
              </Button>
            </div>
          ) : (
            <form onSubmit={handleConnect} className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Enter your Durango Merchant Services credentials. Contact your Durango representative if you need your API credentials.
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
                <Label htmlFor="terminalId">Terminal ID (Optional)</Label>
                <Input
                  id="terminalId"
                  type="text"
                  placeholder="Terminal ID"
                  value={credentials.terminalId}
                  onChange={(e) => setCredentials({...credentials, terminalId: e.target.value})}
                />
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Manual Fee Collection:</strong> Platform fees (5.5%) will be invoiced monthly.
                </AlertDescription>
              </Alert>

              <Button type="submit" disabled={isLoading || !credentials.merchantId || !credentials.apiKey} className="w-full bg-gradient-to-r from-amber-600 to-orange-700">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Connect Durango
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DurangoConnect;
