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

const PayKickstartConnect = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [credentials, setCredentials] = useState({
    apiKey: '',
    secretKey: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchConnectionStatus();
    }
  }, [user?.id]);

  const fetchConnectionStatus = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/users/${user.id}/paykickstart-status`);
      setConnectionStatus(response.data);
    } catch (error) {
      console.error('Error fetching PayKickstart status:', error);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/paykickstart/verify-credentials`, {
        user_id: user.id,
        api_key: credentials.apiKey,
        secret_key: credentials.secretKey
      });

      if (response.data.success) {
        toast({
          title: "PayKickstart Connected!",
          description: "Your PayKickstart account has been successfully connected.",
        });
        updateUser({ paykickstartConnected: true });
        fetchConnectionStatus();
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error.response?.data?.detail || "Failed to verify PayKickstart credentials.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/paykickstart/disconnect`, {
        user_id: user.id
      });
      toast({
        title: "Disconnected",
        description: "PayKickstart has been disconnected from your account.",
      });
      updateUser({ paykickstartConnected: false });
      setConnectionStatus(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect PayKickstart.",
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
                src="https://raw.githubusercontent.com/fortunefavors3/image-hosting/main/paykickstart.png"
                alt="PayKickstart Logo"
                className="w-full h-full object-contain p-1"
              />
            </div>

            <div>
              <CardTitle className="text-2xl">PayKickstart</CardTitle>
              <CardDescription>
                Shopping cart & affiliate management platform
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
                  <strong>Connected!</strong> Your PayKickstart account is active.
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Connected</span>
                  <span className="font-medium">{new Date(connectionStatus.lastVerified).toLocaleDateString()}</span>
                </div>
              </div>

              <Button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-400 to-slate-700 text-white hover:from-teal-500 hover:to-slate-800 border-none"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Disconnect PayKickstart
              </Button>
            </div>
          ) : (
            <form onSubmit={handleConnect} className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Enter your PayKickstart API credentials. Find these in your PayKickstart dashboard under Settings → API.
                </AlertDescription>
              </Alert>

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
                <Label htmlFor="secretKey">Secret Key</Label>
                <Input
                  id="secretKey"
                  type="password"
                  placeholder="Enter your Secret Key"
                  value={credentials.secretKey}
                  onChange={(e) => setCredentials({...credentials, secretKey: e.target.value})}
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
                disabled={isLoading || !credentials.apiKey || !credentials.secretKey}
                className="w-full bg-gradient-to-r from-teal-400 to-slate-700 text-white hover:from-teal-500 hover:to-slate-800 border-none"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Connect PayKickstart
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayKickstartConnect;
