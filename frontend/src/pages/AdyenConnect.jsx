import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, CheckCircle, AlertTriangle, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AdyenConnect = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [credentials, setCredentials] = useState({
    merchantAccount: '',
    apiKey: '',
    environment: 'test'
  });

  useEffect(() => {
    if (user?.id) {
      fetchConnectionStatus();
    }
  }, [user?.id]);

  const fetchConnectionStatus = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/users/${user.id}/adyen-status`);
      setConnectionStatus(response.data);
    } catch (error) {
      console.error('Error fetching Adyen status:', error);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/adyen/verify-credentials`, {
        user_id: user.id,
        merchant_account: credentials.merchantAccount,
        api_key: credentials.apiKey,
        environment: credentials.environment
      });

      if (response.data.success) {
        toast({
          title: "Adyen Connected!",
          description: "Your Adyen account has been successfully connected.",
        });
        updateUser({ adyenConnected: true });
        fetchConnectionStatus();
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error.response?.data?.detail || "Failed to verify Adyen credentials.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/adyen/disconnect`, {
        user_id: user.id
      });
      toast({
        title: "Disconnected",
        description: "Adyen has been disconnected from your account.",
      });
      updateUser({ adyenConnected: false });
      setConnectionStatus(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect Adyen.",
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
            <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center bg-white">
              <img
                src="https://raw.githubusercontent.com/fortunefavors3/image-hosting/main/ADYEN.AS-76bbfafc.png"
                alt="Adyen Logo"
                className="w-full h-full object-contain p-1"
              />
            </div>

            <div>
              <CardTitle className="text-2xl">Adyen</CardTitle>
              <CardDescription>
                Enterprise payment platform - Used by Uber, Spotify, eBay
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
                  <strong>Connected!</strong> Your Adyen account is active.
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Merchant Account</span>
                  <span className="font-medium font-mono">{connectionStatus.merchantAccount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Environment</span>
                  <Badge variant="outline">{connectionStatus.environment}</Badge>
                </div>
              </div>

              <Button variant="destructive" onClick={handleDisconnect} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Disconnect Adyen
              </Button>
            </div>
          ) : (
            <form onSubmit={handleConnect} className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Enter your Adyen API credentials. Find these in your Adyen Customer Area under Developers → API credentials.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="merchantAccount">Merchant Account</Label>
                <Input
                  id="merchantAccount"
                  type="text"
                  placeholder="YourCompanyECOM"
                  value={credentials.merchantAccount}
                  onChange={(e) => setCredentials({...credentials, merchantAccount: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="AQE..."
                  value={credentials.apiKey}
                  onChange={(e) => setCredentials({...credentials, apiKey: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <Select value={credentials.environment} onValueChange={(v) => setCredentials({...credentials, environment: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Manual Fee Collection:</strong> Platform fees (5.5%) will be invoiced monthly.
                </AlertDescription>
              </Alert>

              <Button type="submit" disabled={isLoading || !credentials.merchantAccount || !credentials.apiKey} className="w-full bg-gradient-to-r from-green-500 to-emerald-600">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Connect Adyen
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdyenConnect;
