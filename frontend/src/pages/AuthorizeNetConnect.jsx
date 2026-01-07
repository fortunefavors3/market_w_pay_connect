import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  EyeOff,
  Shield,
  CreditCard,
  Loader2,
  Info,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AuthorizeNetConnect = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showTransactionKey, setShowTransactionKey] = useState(false);
  
  const [credentials, setCredentials] = useState({
    apiLoginId: '',
    transactionKey: '',
    environment: 'sandbox' // 'sandbox' or 'production'
  });
  
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    verified: false,
    lastVerified: null,
    environment: null
  });

  // Fetch existing connection status
  useEffect(() => {
    if (user?.id) {
      fetchConnectionStatus();
    }
  }, [user?.id]);

  const fetchConnectionStatus = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/users/${user.id}/authorizenet-status`);
      setConnectionStatus(response.data);
    } catch (error) {
      console.error('Error fetching Authorize.net status:', error);
    }
  };

  const handleCredentialChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const verifyCredentials = async () => {
    if (!credentials.apiLoginId || !credentials.transactionKey) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both API Login ID and Transaction Key.",
        variant: "destructive"
      });
      return;
    }

    try {
      setVerifying(true);
      
      const response = await axios.post(`${BACKEND_URL}/api/authorizenet/verify-credentials`, {
        api_login_id: credentials.apiLoginId,
        transaction_key: credentials.transactionKey,
        environment: credentials.environment
      });

      if (response.data.valid) {
        toast({
          title: "Credentials Verified",
          description: "Your Authorize.net credentials are valid!",
        });
        return true;
      } else {
        toast({
          title: "Invalid Credentials",
          description: response.data.error || "Please check your API credentials.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.response?.data?.detail || "Could not verify credentials.",
        variant: "destructive"
      });
      return false;
    } finally {
      setVerifying(false);
    }
  };

  const handleConnect = async () => {
    // First verify credentials
    const isValid = await verifyCredentials();
    if (!isValid) return;

    try {
      setLoading(true);
      
      // Save credentials to backend
      const response = await axios.post(`${BACKEND_URL}/api/authorizenet/connect`, {
        user_id: user.id,
        api_login_id: credentials.apiLoginId,
        transaction_key: credentials.transactionKey,
        environment: credentials.environment
      });

      if (response.data.success) {
        setConnectionStatus({
          connected: true,
          verified: true,
          lastVerified: new Date().toISOString(),
          environment: credentials.environment
        });

        updateUser({
          authorizeNetConnected: true
        });

        toast({
          title: "Successfully Connected!",
          description: "Your Authorize.net account is now connected to CheqMart.",
        });

        // Clear sensitive data from state
        setCredentials(prev => ({
          ...prev,
          apiLoginId: '',
          transactionKey: ''
        }));
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.response?.data?.detail || "Failed to save credentials.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      
      await axios.post(`${BACKEND_URL}/api/authorizenet/disconnect`, {
        user_id: user.id
      });

      setConnectionStatus({
        connected: false,
        verified: false,
        lastVerified: null,
        environment: null
      });

      updateUser({
        authorizeNetConnected: false
      });

      toast({
        title: "Disconnected",
        description: "Your Authorize.net account has been disconnected.",
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect account.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/payment-setup')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Payment Setup
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Authorize.net Setup</h1>
        <p className="text-gray-600">Connect your Authorize.net account for payment processing</p>
      </div>

      {/* Important Notice for Manual Entry */}
      <Alert className="mb-6 border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Manual Credentials Entry:</strong> Authorize.net requires manual credential setup. 
          Unlike Stripe Connect, automatic platform fee collection is not available. 
          <strong className="block mt-1">CheqMart will invoice you separately for platform fees based on your transaction volume.</strong>
        </AlertDescription>
      </Alert>

      {/* Connection Status */}
      {connectionStatus.connected && (
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Account Connected</h3>
                  <p className="text-sm text-green-600">
                    Environment: {connectionStatus.environment === 'production' ? 'Production' : 'Sandbox'}
                  </p>
                  {connectionStatus.lastVerified && (
                    <p className="text-xs text-green-500">
                      Last verified: {new Date(connectionStatus.lastVerified).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleDisconnect}
                disabled={loading}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Authorize.net</CardTitle>
              <CardDescription>Traditional payment gateway for high-risk merchants</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Why Choose Authorize.net?</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Accepts high-risk merchants that other processors decline</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Established since 1996 with proven reliability</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Advanced fraud detection and prevention tools</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Works with existing merchant accounts</span>
              </li>
            </ul>
          </div>

          <Separator />

          {/* Credential Entry Form */}
          {!connectionStatus.connected && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Enter Your API Credentials</h4>
              <p className="text-sm text-gray-600">
                Find these in your Authorize.net Merchant Interface under Account → API Credentials & Keys
              </p>

              {/* Environment Selection */}
              <div className="space-y-2">
                <Label>Environment</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="environment"
                      value="sandbox"
                      checked={credentials.environment === 'sandbox'}
                      onChange={(e) => handleCredentialChange('environment', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Sandbox (Testing)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="environment"
                      value="production"
                      checked={credentials.environment === 'production'}
                      onChange={(e) => handleCredentialChange('environment', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Production (Live)</span>
                  </label>
                </div>
              </div>

              {/* API Login ID */}
              <div className="space-y-2">
                <Label htmlFor="apiLoginId">API Login ID</Label>
                <Input
                  id="apiLoginId"
                  type="text"
                  value={credentials.apiLoginId}
                  onChange={(e) => handleCredentialChange('apiLoginId', e.target.value)}
                  placeholder="Enter your API Login ID"
                />
              </div>

              {/* Transaction Key */}
              <div className="space-y-2">
                <Label htmlFor="transactionKey">Transaction Key</Label>
                <div className="relative">
                  <Input
                    id="transactionKey"
                    type={showTransactionKey ? 'text' : 'password'}
                    value={credentials.transactionKey}
                    onChange={(e) => handleCredentialChange('transactionKey', e.target.value)}
                    placeholder="Enter your Transaction Key"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTransactionKey(!showTransactionKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showTransactionKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <Shield className="w-4 h-4 text-gray-600 mt-0.5" />
                <p className="text-xs text-gray-600">
                  Your credentials are encrypted and stored securely. We never share your API keys with third parties.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={verifyCredentials}
                  disabled={verifying || !credentials.apiLoginId || !credentials.transactionKey}
                  className="flex-1"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Credentials
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleConnect}
                  disabled={loading || !credentials.apiLoginId || !credentials.transactionKey}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Connect Account
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Pricing Info */}
          <Separator />
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Fee Structure</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Authorize.net Fees</p>
                <p className="text-lg font-bold text-gray-900">2.9% + $0.30</p>
                <p className="text-xs text-gray-500">+ $25/month gateway fee</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-sm font-medium text-indigo-700">CheqMart Platform Fee</p>
                <p className="text-lg font-bold text-indigo-900">5.5% (Invoiced)</p>
                <p className="text-xs text-indigo-600">Billed monthly based on volume</p>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="text-sm text-gray-600 pt-4 border-t">
            <p className="mb-2">
              <strong>Need an Authorize.net account?</strong>
            </p>
            <a 
              href="https://www.authorize.net/sign-up/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Sign up at Authorize.net →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthorizeNetConnect;
