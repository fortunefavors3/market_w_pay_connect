import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { 
  CreditCard, Plus, Trash2, Check, AlertTriangle, Shield, Clock, 
  DollarSign, ArrowLeft, Loader2, CheckCircle2, XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51R0H4pBBCoEfvDrxfxEhNSii9WnYd5L0MJxS5Ucw7BZIHTHRjjt8r3HEREuaE6xsG9la6af5PptpsBGoCEya19LQ00C6X4W4QE';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Card Element Styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      '::placeholder': {
        color: '#aab7c4',
      },
      padding: '12px',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
};

// Add Card Form Component
const AddCardForm = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Create Setup Intent
      const setupResponse = await axios.post(`${BACKEND_URL}/api/billing/setup-intent`, {
        user_id: user.id
      });

      const { client_secret } = setupResponse.data;

      // 2. Confirm card setup with Stripe
      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(
        client_secret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setIsLoading(false);
        return;
      }

      // 3. Save payment method to backend
      await axios.post(`${BACKEND_URL}/api/billing/save-payment-method`, {
        user_id: user.id,
        payment_method_id: setupIntent.payment_method,
        set_as_default: true
      });

      toast({
        title: "Card Added",
        description: "Your payment method has been saved successfully.",
      });

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add card. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <CardElement options={cardElementOptions} />
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex gap-3">
        <Button 
          type="submit" 
          disabled={!stripe || isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Card
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 flex items-center gap-1">
        <Shield className="w-3 h-3" />
        Your card information is securely processed by Stripe
      </p>
    </form>
  );
};

// Main Billing Settings Component
const BillingSettingsContent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billingInfo, setBillingInfo] = useState(null);
  const [chargeHistory, setChargeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [terms, setTerms] = useState(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [savingAutoCharge, setSavingAutoCharge] = useState(false);
  const [deletingCard, setDeletingCard] = useState(null);

  // Fetch billing info
  const fetchBillingInfo = async () => {
    if (!user?.id) return;
    
    try {
      const [billingRes, historyRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/billing/info/${user.id}`),
        axios.get(`${BACKEND_URL}/api/billing/charge-history/${user.id}`)
      ]);
      
      setBillingInfo(billingRes.data);
      setChargeHistory(historyRes.data.charges || []);
    } catch (error) {
      console.error('Error fetching billing info:', error);
      toast({
        title: "Error",
        description: "Failed to load billing information.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingInfo();
  }, [user?.id]);

  // Fetch terms
  const fetchTerms = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/billing/auto-charge-terms`);
      setTerms(response.data);
    } catch (error) {
      console.error('Error fetching terms:', error);
    }
  };

  // Handle auto-charge toggle
  const handleAutoChargeToggle = async (enabled) => {
    if (enabled && !billingInfo?.auto_charge_agreed_at) {
      // Need to show terms first
      await fetchTerms();
      setShowTermsDialog(true);
      return;
    }

    // If disabling, just update
    if (!enabled) {
      await updateAutoCharge(false);
    }
  };

  const updateAutoCharge = async (enabled, agreed = false) => {
    setSavingAutoCharge(true);
    try {
      await axios.post(`${BACKEND_URL}/api/billing/update-auto-charge`, {
        user_id: user.id,
        auto_charge_enabled: enabled,
        agreed_to_terms: agreed
      });

      setBillingInfo(prev => ({
        ...prev,
        auto_charge_enabled: enabled,
        auto_charge_agreed_at: agreed ? new Date().toISOString() : prev?.auto_charge_agreed_at
      }));

      toast({
        title: enabled ? "Auto-Charge Enabled" : "Auto-Charge Disabled",
        description: enabled 
          ? "Your fees will be automatically charged daily."
          : "You will receive invoices for your platform fees.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update auto-charge settings.",
        variant: "destructive"
      });
    } finally {
      setSavingAutoCharge(false);
      setShowTermsDialog(false);
      setTermsAgreed(false);
    }
  };

  // Handle delete card
  const handleDeleteCard = async (paymentMethodId) => {
    setDeletingCard(paymentMethodId);
    try {
      await axios.post(`${BACKEND_URL}/api/billing/delete-payment-method`, {
        user_id: user.id,
        payment_method_id: paymentMethodId
      });

      toast({
        title: "Card Removed",
        description: "Payment method has been deleted.",
      });

      fetchBillingInfo();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove payment method.",
        variant: "destructive"
      });
    } finally {
      setDeletingCard(null);
    }
  };

  // Handle set default
  const handleSetDefault = async (paymentMethodId) => {
    try {
      await axios.post(`${BACKEND_URL}/api/billing/set-default-payment-method`, {
        user_id: user.id,
        payment_method_id: paymentMethodId
      });

      toast({
        title: "Default Updated",
        description: "Default payment method has been changed.",
      });

      fetchBillingInfo();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update default payment method.",
        variant: "destructive"
      });
    }
  };

  // Format card brand
  const formatCardBrand = (brand) => {
    const brands = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      amex: 'American Express',
      discover: 'Discover',
    };
    return brands[brand] || brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing Settings</h1>
          <p className="text-gray-600">Manage your payment methods and fee collection preferences</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Auto-Charge Card */}
        <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Automatic Fee Collection</CardTitle>
                  <CardDescription>
                    Never worry about overdue fees or account suspension
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={billingInfo?.auto_charge_enabled || false}
                onCheckedChange={handleAutoChargeToggle}
                disabled={!billingInfo?.has_billing_setup || savingAutoCharge}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {billingInfo?.auto_charge_enabled ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Auto-Charge Active</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Your platform fees (5.5%) will be automatically charged daily from your saved card.
                    {billingInfo?.auto_charge_agreed_at && (
                      <span className="block text-xs mt-1 text-green-600">
                        Terms accepted on {new Date(billingInfo.auto_charge_agreed_at).toLocaleDateString()}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">No Suspensions</p>
                      <p className="text-sm text-gray-600">Keep selling without interruption</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Daily Charges</p>
                      <p className="text-sm text-gray-600">Small, manageable daily amounts</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <Clock className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Set & Forget</p>
                      <p className="text-sm text-gray-600">We handle fee collection automatically</p>
                    </div>
                  </div>
                </div>
              )}

              {!billingInfo?.has_billing_setup && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Add a payment method below to enable automatic fee collection.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Cards saved for platform fee payments</CardDescription>
                </div>
              </div>
              {!showAddCard && (
                <Button onClick={() => setShowAddCard(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Card
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {showAddCard ? (
              <AddCardForm 
                onSuccess={() => {
                  setShowAddCard(false);
                  fetchBillingInfo();
                }}
                onCancel={() => setShowAddCard(false)}
              />
            ) : billingInfo?.payment_methods?.length > 0 ? (
              <div className="space-y-3">
                {billingInfo.payment_methods.map((method) => (
                  <div 
                    key={method.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {formatCardBrand(method.brand)} •••• {method.last4}
                          </p>
                          {method.is_default && (
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Expires {method.exp_month}/{method.exp_year}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!method.is_default && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteCard(method.id)}
                        disabled={deletingCard === method.id}
                      >
                        {deletingCard === method.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No payment methods saved</p>
                <Button onClick={() => setShowAddCard(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Card
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charge History Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Fee Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chargeHistory.length > 0 ? (
              <div className="space-y-2">
                {chargeHistory.map((charge) => (
                  <div 
                    key={charge.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {charge.status === 'succeeded' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{charge.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(charge.created_at).toLocaleDateString()} at{' '}
                          {new Date(charge.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${charge.status === 'succeeded' ? 'text-green-600' : 'text-red-600'}`}>
                        ${charge.amount.toFixed(2)}
                      </p>
                      <Badge 
                        variant="outline"
                        className={charge.status === 'succeeded' ? 'text-green-600' : 'text-red-600'}
                      >
                        {charge.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No fee payments yet. Charges will appear here once you start selling.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Terms Dialog */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Automatic Fee Collection Agreement</DialogTitle>
            <DialogDescription>
              Please read and accept the terms to enable automatic fee collection.
            </DialogDescription>
          </DialogHeader>
          
          {terms && (
            <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
              {terms.terms}
            </div>
          )}

          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Checkbox 
              id="agree-terms"
              checked={termsAgreed}
              onCheckedChange={setTermsAgreed}
            />
            <Label htmlFor="agree-terms" className="text-sm cursor-pointer">
              I have read and agree to the Automatic Fee Collection Agreement. I authorize CheqMart 
              to charge my saved payment method daily for platform fees.
            </Label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTermsDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => updateAutoCharge(true, true)}
              disabled={!termsAgreed || savingAutoCharge}
            >
              {savingAutoCharge ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enabling...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Accept & Enable
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Wrap with Stripe Elements
const BillingSettings = () => {
  return (
    <Elements stripe={stripePromise}>
      <BillingSettingsContent />
    </Elements>
  );
};

export default BillingSettings;
