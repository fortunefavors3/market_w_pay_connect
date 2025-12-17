import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  CreditCard, 
  ShieldCheck, 
  ArrowLeft, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const PLATFORM_FEE_RATE = 0.055; // 5.5%

const MarketplaceCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, saveShippingAddress } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProcessor, setSelectedProcessor] = useState(null);
  const [sellerPaymentStatus, setSellerPaymentStatus] = useState(null);
  
  // Get cart/order details from location state or mock
  const orderDetails = location.state?.orderDetails || {
    items: [
      { id: '1', title: 'Sample Product', price: 99.99, quantity: 1, sellerId: 'seller1' }
    ],
    sellerId: 'seller1',
    sellerName: 'TechDeals Pro'
  };
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  // Calculate totals
  const subtotal = orderDetails.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE * 100) / 100;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shipping + tax;

  // Auth redirect
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: '/marketplace-checkout' } } });
    }
  }, [isAuthenticated, navigate]);

  // Pre-fill shipping from user profile
  useEffect(() => {
    if (user?.shippingAddress) {
      setFormData(prev => ({ ...prev, ...user.shippingAddress }));
    }
  }, [user]);

  // Fetch seller's payment processor status
  useEffect(() => {
    const fetchSellerStatus = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/users/${orderDetails.sellerId}/payment-status`
        );
        setSellerPaymentStatus(response.data);
        
        // Auto-select first available processor
        if (response.data.stripe_connected) {
          setSelectedProcessor('stripe');
        } else if (response.data.square_connected) {
          setSelectedProcessor('square');
        } else if (response.data.paypal_connected) {
          setSelectedProcessor('paypal');
        }
      } catch (error) {
        console.error('Failed to fetch seller payment status:', error);
      }
    };
    
    if (orderDetails.sellerId) {
      fetchSellerStatus();
    }
  }, [orderDetails.sellerId]);

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    
    saveShippingAddress({
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: formData.country,
    });
    
    toast({
      title: "Shipping address saved",
      description: "Proceeding to payment selection.",
    });
    
    setStep(2);
  };

  const handlePayment = async () => {
    if (!selectedProcessor) {
      toast({
        title: "Select payment method",
        description: "Please select a payment processor to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/payments/process`, {
        seller_id: orderDetails.sellerId,
        buyer_id: user.id,
        amount: total,
        currency: "USD",
        processor: selectedProcessor,
        description: `CheqMart Order - ${orderDetails.items.length} item(s)`,
        order_id: `order_${Date.now()}`
      });

      if (response.data.success) {
        // Handle processor-specific flows
        if (selectedProcessor === 'stripe' && response.data.client_secret) {
          // In production, use Stripe Elements to confirm payment
          toast({
            title: "Payment initiated",
            description: "Redirecting to complete payment...",
          });
          
          // For demo, simulate success
          setTimeout(() => {
            navigate('/order-success', { 
              state: { 
                orderId: response.data.payment_id,
                total,
                platformFee: response.data.platform_fee,
                processor: 'Stripe'
              } 
            });
          }, 2000);
          
        } else if (selectedProcessor === 'paypal' && response.data.approve_url) {
          // Redirect to PayPal for approval
          window.location.href = response.data.approve_url;
          
        } else if (selectedProcessor === 'square') {
          // Square payment completed
          navigate('/order-success', { 
            state: { 
              orderId: response.data.payment_id,
              total,
              platformFee: response.data.platform_fee,
              processor: 'Square'
            } 
          });
        }
        
        // Record the payment
        await axios.post(`${BACKEND_URL}/api/payments/record`, null, {
          params: {
            payment_id: response.data.payment_id,
            buyer_id: user.id,
            seller_id: orderDetails.sellerId,
            amount: total,
            platform_fee: response.data.platform_fee,
            processor: selectedProcessor,
            status: response.data.status
          }
        });
        
      } else {
        throw new Error(response.data.error || 'Payment failed');
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment failed",
        description: error.response?.data?.detail || error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProcessorInfo = (processor) => {
    const processors = {
      stripe: {
        name: 'Credit/Debit Card',
        description: 'Pay securely with your card via Stripe',
        icon: '💳',
        fee: '2.9% + $0.30'
      },
      square: {
        name: 'Square',
        description: 'Pay with Square secure checkout',
        icon: '⬛',
        fee: '2.6% + $0.10'
      },
      paypal: {
        name: 'PayPal',
        description: 'Pay with your PayPal account',
        icon: '🅿️',
        fee: '2.99%'
      }
    };
    return processors[processor];
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Checkout</h1>
      <p className="text-gray-600 mb-8">Complete your purchase securely</p>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {['Shipping', 'Payment', 'Confirm'].map((label, index) => (
          <React.Fragment key={label}>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step > index + 1
                  ? 'bg-green-600 text-white'
                  : step === index + 1
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step > index + 1 ? <CheckCircle className="w-5 h-5" /> : index + 1}
              </div>
              <span className={`ml-2 font-medium hidden md:inline ${
                step >= index + 1 ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {label}
              </span>
            </div>
            {index < 2 && <div className="w-12 md:w-16 h-0.5 bg-gray-300 mx-2" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>Enter your delivery address</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Zip Code *</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    size="lg"
                  >
                    Continue to Payment
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Payment Selection */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Payment Method</CardTitle>
                <CardDescription>
                  Choose how you'd like to pay {orderDetails.sellerName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Platform Fee Notice */}
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Platform Fee:</strong> CheqMart charges a 5.5% service fee (${platformFee.toFixed(2)}) 
                    to facilitate this secure transaction.
                  </AlertDescription>
                </Alert>

                {/* Payment Processor Options */}
                {sellerPaymentStatus ? (
                  <RadioGroup 
                    value={selectedProcessor} 
                    onValueChange={setSelectedProcessor}
                    className="space-y-3"
                  >
                    {sellerPaymentStatus.stripe_connected && (
                      <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedProcessor === 'stripe' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <RadioGroupItem value="stripe" id="stripe" />
                        <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">💳</span>
                              <div>
                                <p className="font-semibold">Credit/Debit Card</p>
                                <p className="text-sm text-gray-600">Powered by Stripe</p>
                              </div>
                            </div>
                            <Badge variant="outline">Recommended</Badge>
                          </div>
                        </Label>
                      </div>
                    )}

                    {sellerPaymentStatus.square_connected && (
                      <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedProcessor === 'square' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <RadioGroupItem value="square" id="square" />
                        <Label htmlFor="square" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">⬛</span>
                            <div>
                              <p className="font-semibold">Square</p>
                              <p className="text-sm text-gray-600">Secure checkout with Square</p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    )}

                    {sellerPaymentStatus.paypal_connected && (
                      <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedProcessor === 'paypal' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🅿️</span>
                            <div>
                              <p className="font-semibold">PayPal</p>
                              <p className="text-sm text-gray-600">Pay with your PayPal account</p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    )}
                  </RadioGroup>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">Loading payment options...</span>
                  </div>
                )}

                {sellerPaymentStatus && !sellerPaymentStatus.has_any_processor && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      This seller hasn't set up payment processing yet. Please contact them directly.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    onClick={() => setStep(3)}
                    disabled={!selectedProcessor}
                  >
                    Review Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Confirm & Pay */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-center">Review & Confirm Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Shipping Summary */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
                  <p className="text-gray-700 text-sm">
                    {formData.firstName} {formData.lastName}<br />
                    {formData.address}<br />
                    {formData.city}, {formData.state} {formData.zipCode}
                  </p>
                </div>
                
                <Separator />
                
                {/* Payment Method Summary */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
                  {selectedProcessor && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <span className="text-xl">{getProcessorInfo(selectedProcessor).icon}</span>
                      <div>
                        <p className="font-medium">{getProcessorInfo(selectedProcessor).name}</p>
                        <p className="text-sm text-gray-500">{getProcessorInfo(selectedProcessor).description}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* Items */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Items ({orderDetails.items.length})</h3>
                  {orderDetails.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-2">
                      <span className="text-gray-700">{item.title} × {item.quantity}</span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    onClick={handlePayment}
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Pay ${total.toFixed(2)}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({orderDetails.items.length} item{orderDetails.items.length > 1 ? 's' : ''})</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Fee Breakdown */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                <p className="font-medium text-gray-700 mb-2">Fee Breakdown:</p>
                <div className="space-y-1 text-gray-600">
                  <div className="flex justify-between">
                    <span>Platform Fee (5.5%)</span>
                    <span>${platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seller Receives</span>
                    <span>${(subtotal - platformFee).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {/* Security Badge */}
              <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-sm font-semibold">Buyer Protection</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Your purchase is protected by CheqMart
                </p>
              </div>

              {/* Seller Info */}
              <div className="mt-4 p-3 border rounded-lg">
                <p className="text-sm font-medium text-gray-700">Seller</p>
                <p className="text-sm text-gray-600">{orderDetails.sellerName}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceCheckout;
