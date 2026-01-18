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

const USAePayConnect = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [credentials, setCredentials] = useState({
    sourceKey: '',
    pin: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchConnectionStatus();
    }
  }, [user?.id]);

  const fetchConnectionStatus = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/users/${user.id}/usaepay-status`);
      setConnectionStatus(response.data);
    } catch (error) {
      console.error('Error fetching USAePay status:', error);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/usaepay/verify-credentials`, {
        user_id: user.id,
        source_key: credentials.sourceKey,
        pin: credentials.pin
      });

      if (response.data.success) {
        toast({
          title: "USAePay Connected!",
          description: "Your USAePay account has been successfully connected.",
        });
        updateUser({ usaepayConnected: true });
        fetchConnectionStatus();
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error.response?.data?.detail || "Failed to verify USAePay credentials.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/usaepay/disconnect`, {
        user_id: user.id
      });
      toast({
        title: "Disconnected",
        description: "USAePay has been disconnected from your account.",
      });
      updateUser({ usaepayConnected: false });
      setConnectionStatus(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect USAePay.",
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
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">USAe</span>
            </div>
            <div>
              <CardTitle className="text-2xl">USAePay</CardTitle>
              <CardDescription>High-volume payment processing gateway</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {connectionStatus?.connected ? (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Connected!</strong> Your USAePay account is active.
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

              <Button variant="destructive" onClick={handleDisconnect} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Disconnect USAePay
              </Button>
            </div>
          ) : (
            <form onSubmit={handleConnect} className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Enter your USAePay API credentials. Find these in your USAePay merchant console under Settings → Source Keys.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="sourceKey">Source Key</Label>
                <Input
                  id="sourceKey"
                  type="password"
                  placeholder="Enter your Source Key"
                  value={credentials.sourceKey}
                  onChange={(e) => setCredentials({...credentials, sourceKey: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin">PIN (Optional)</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Source Key PIN"
                  value={credentials.pin}
                  onChange={(e) => setCredentials({...credentials, pin: e.target.value})}
                />
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Manual Fee Collection:</strong> Platform fees (5.5%) will be invoiced monthly.
                </AlertDescription>
              </Alert>

              <Button type="submit" disabled={isLoading || !credentials.sourceKey} className="w-full bg-gradient-to-r from-green-600 to-teal-600">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Connect USAePay
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default USAePayConnect;
