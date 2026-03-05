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

const EpicPaymentConnect = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  
  const [credentials, setCredentials] = useState({
    merchantId: '',
    apiKey: '',
    secretKey: '',
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
      const response = await axios.get(`${BACKEND_URL}/api/users/${user.id}/epicpayment-status`);
      setConnectionStatus(response.data);
    } catch (error) {
      console.error('Error fetching Epic Payment Solutions status:', error);
    }
  };

  const handleCredentialChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const verifyCredentials = async () => {
    if (!credentials.merchantId || !credentials.apiKey || !credentials.secretKey) {
      toast({
        title: "Missing Credentials",
        description: "Please enter Merchant ID, API Key, and Secret Key.",
        variant: "destructive"
      });
      return;
    }

    try {
      setVerifying(true);
      
      const response = await axios.post(`${BACKEND_URL}/api/epicpayment/verify-credentials`, {
        merchant_id: credentials.merchantId,
        api_key: credentials.apiKey,
        secret_key: credentials.secretKey,
        environment: credentials.environment
      });

      if (response.data.valid) {
        toast({
          title: "Credentials Verified",
          description: "Your Epic Payment Solutions credentials are valid!",
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
      const response = await axios.post(`${BACKEND_URL}/api/epicpayment/connect`, {
        user_id: user.id,
        merchant_id: credentials.merchantId,
        api_key: credentials.apiKey,
        secret_key: credentials.secretKey,
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
          epicPaymentConnected: true
        });

        toast({
          title: "Successfully Connected!",
          description: "Your Epic Payment Solutions account is now connected to Effinsure.",
        });

        // Clear sensitive data from state
        setCredentials(prev => ({
          ...prev,
          merchantId: '',
          apiKey: '',
          secretKey: ''
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
      
      await axios.post(`${BACKEND_URL}/api/epicpayment/disconnect`, {
        user_id: user.id
      });

      setConnectionStatus({
        connected: false,
        verified: false,
        lastVerified: null,
        environment: null
      });

      updateUser({
        epicPaymentConnected: false
      });

      toast({
        title: "Disconnected",
        description: "Your Epic Payment Solutions account has been disconnected.",
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Epic Payment Solutions Setup</h1>
        <p className="text-gray-600">Connect your Epic Payment Solutions account for payment processing</p>
      </div>

      {/* Important Notice for Manual Entry */}
      <Alert className="mb-6 border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Manual Credentials Entry:</strong> Epic Payment Solutions requires manual credential setup. 
          Unlike Stripe Connect, automatic platform fee collection is not available. 
          <strong className="block mt-1">Effinsure will invoice you separately for platform fees based on your transaction volume.</strong>
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
            <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-white">
              <img
                src="https://raw.githubusercontent.com/fortunefavors3/image-hosting/main/epic.jpg"
                alt="Epic Payment Solutions Logo"
                className="w-full h-full object-contain p-1"
              />
            </div>

            <div>
              <CardTitle className="text-xl">Epic Payment Solutions</CardTitle>
              <CardDescription>
                Flexible payment solutions for all merchants
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-900 mb-3">Why Choose Epic Payment Solutions?</h4>
            <ul className="space-y-2 text-sm text-emerald-800">
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Competitive processing rates with transparent pricing</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Support for multiple currencies and payment methods</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Advanced fraud protection and security features</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Easy integration with existing merchant accounts</span>
              </li>
            </ul>
          </div>

          <Separator />

          {/* Credential Entry Form */}
          {!connectionStatus.connected && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Enter Your API Credentials</h4>
              <p className="text-sm text-gray-600">
                Find these in your Epic Payment Solutions Dashboard under Settings → API Keys
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
                      className="w-4 h-4 text-emerald-600"
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
                      className="w-4 h-4 text-emerald-600"
                    />
                    <span className="text-sm">Production (Live)</span>
                  </label>
                </div>
              </div>

              {/* Merchant ID */}
              <div className="space-y-2">
                <Label htmlFor="merchantId">Merchant ID</Label>
                <Input
                  id="merchantId"
                  type="text"
                  value={credentials.merchantId}
                  onChange={(e) => handleCredentialChange('merchantId', e.target.value)}
                  placeholder="Enter your Merchant ID"
                />
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    value={credentials.apiKey}
                    onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
                    placeholder="Enter your API Key"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Secret Key */}
              <div className="space-y-2">
                <Label htmlFor="secretKey">Secret Key</Label>
                <div className="relative">
                  <Input
                    id="secretKey"
                    type={showSecretKey ? 'text' : 'password'}
                    value={credentials.secretKey}
                    onChange={(e) => handleCredentialChange('secretKey', e.target.value)}
                    placeholder="Enter your Secret Key"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  disabled={verifying || !credentials.merchantId || !credentials.apiKey || !credentials.secretKey}
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
                  disabled={
                    loading ||
                    !credentials.merchantId ||
                    !credentials.apiKey ||
                    !credentials.secretKey
                  }
                  className="flex-1 bg-gradient-to-r from-orange-700 to-red-600 text-white hover:from-orange-800 hover:to-red-700 border-none"
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
                <p className="text-sm font-medium text-gray-700">Epic Payment Solutions Fees</p>
                <p className="text-lg font-bold text-gray-900">2.75% + $0.25</p>
                <p className="text-xs text-gray-500">per transaction</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-sm font-medium text-indigo-700">Effinsure Platform Fee</p>
                <p className="text-lg font-bold text-indigo-900">5.5% (Invoiced)</p>
                <p className="text-xs text-indigo-600">Billed monthly based on volume</p>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="text-sm text-gray-600 pt-4 border-t">
            <p className="mb-2">
              <strong>Need an Epic Payment Solutions account?</strong>
            </p>
            <p className="text-gray-500">
              Contact Epic Payment Solutions support to create a merchant account and obtain your API credentials.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EpicPaymentConnect;
