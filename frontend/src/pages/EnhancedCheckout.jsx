import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { mockCart } from '../mock';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const EnhancedCheckout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, saveShippingAddress, savePaymentMethod } = useAuth();
  const [step, setStep] = useState(1);
  const [cartUUID] = useState(`cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCouponCode, setGeneratedCouponCode] = useState('');
  const [couponExpiry, setCouponExpiry] = useState(null);
  
  const [formData, setFormData] = useState({
    // Shipping
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    // Payment
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const subtotal = mockCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Auto-fill for returning users
  useEffect(() => {
    if (user?.shippingAddress) {
      setFormData(prev => ({ ...prev, ...user.shippingAddress }));
      
      // Skip to step 2 ONLY for returning users with saved info
      // This happens automatically because they have shipping saved
      if (user?.paymentMethods?.length > 0) {
        setStep(2);
      }
    }
  }, [user]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: '/checkout' } } });
    }
  }, [isAuthenticated, navigate]);

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    
    // Save shipping address to user profile
    const shippingAddress = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: formData.country,
    };
    
    saveShippingAddress(shippingAddress);
    
    toast({
      title: "Shipping address saved",
      description: "Your address has been saved to your account.",
    });
    
    setStep(2);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    
    // Only save payment method if it's a new card (not already saved)
    if (!user?.paymentMethods?.length) {
      const paymentMethod = {
        cardNumber: formData.cardNumber,
        cardName: formData.cardName,
        expiryDate: formData.expiryDate,
      };
      savePaymentMethod(paymentMethod);
      
      toast({
        title: "Payment method saved",
        description: "Your card has been saved to your account.",
      });
    }
    
    // Generate 6-digit coupon code
    const couponCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCouponCode(couponCode);
    
    // Set expiry to 1 hour from now
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);
    setCouponExpiry(expiry);
    
    // Mock SMS send
    toast({
      title: "Verification code sent!",
      description: `Code sent to ${user.phone}. Expires in 1 hour. (Mock: ${couponCode})`,
      duration: 10000,
    });
    
    // Automatically move to step 3 (no need to click again)
    setStep(3);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    
    // Verify coupon code
    if (verificationCode !== generatedCouponCode) {
      toast({
        title: "Invalid verification code",
        description: "Please enter the correct 6-digit code sent to your phone.",
        variant: "destructive",
      });
      return;
    }
    
    // Check expiry
    if (new Date() > couponExpiry) {
      toast({
        title: "Code expired",
        description: "Your verification code has expired. Please restart checkout.",
        variant: "destructive",
      });
      return;
    }
    
    // Mock payment processing
    toast({
      title: "Processing payment...",
      description: "Please wait while we process your payment.",
    });
    
    setTimeout(() => {
      // Simulate successful payment
      toast({
        title: "Payment successful!",
        description: `Your order has been confirmed. Order ID: ${cartUUID}`,
      });
      
      navigate('/order-success', { state: { orderId: cartUUID, total } });
    }, 2000);
  };

  if (!isAuthenticated) {
    return null; // Will redirect to auth
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Secure Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {['Shipping', 'Payment', 'Confirm'].map((label, index) => (
          <React.Fragment key={label}>
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step > index + 1
                    ? 'bg-green-600 text-white'
                    : step === index + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step > index + 1 ? '✓' : index + 1}
              </div>
              <span
                className={`ml-2 font-medium hidden md:inline ${
                  step >= index + 1 ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
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
          <form onSubmit={step === 1 ? handleShippingSubmit : step === 2 ? handlePaymentSubmit : handleConfirmPayment}>
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Information */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg bg-blue-50">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Credit/Debit Card</span>
                  </div>

                  <div className="space-y-4">
                    {user?.paymentMethods?.length > 0 ? (
                      <>
                        {/* Show saved card info */}
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-green-900">Saved Card</span>
                          </div>
                          <p className="text-sm text-gray-700">
                            Card ending in {user.paymentMethods[0].last4}
                          </p>
                          <p className="text-sm text-gray-600">
                            Expires: {user.paymentMethods[0].expiryMonth}/{user.paymentMethods[0].expiryYear}
                          </p>
                        </div>
                        
                        {/* Only CVV required for saved cards */}
                        <div>
                          <Label htmlFor="cvv">CVV * (Security Code)</Label>
                          <Input
                            id="cvv"
                            type="password"
                            placeholder="123"
                            maxLength="4"
                            value={formData.cvv}
                            onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">Enter the 3-4 digit code on the back of your card</p>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* New card entry */}
                        <div>
                          <Label htmlFor="cardNumber">Card Number *</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={formData.cardNumber}
                            onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardName">Name on Card *</Label>
                          <Input
                            id="cardName"
                            value={formData.cardName}
                            onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiryDate">Expiry Date *</Label>
                            <Input
                              id="expiryDate"
                              placeholder="MM/YY"
                              value={formData.expiryDate}
                              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV *</Label>
                            <Input
                              id="cvv"
                              type="password"
                              placeholder="123"
                              maxLength="4"
                              value={formData.cvv}
                              onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" size="lg">
                      Continue to Confirm
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Confirm Order */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-center">Confirm Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
                    <p className="text-gray-700 text-sm">
                      {formData.firstName} {formData.lastName}<br />
                      {formData.address}<br />
                      {formData.city}, {formData.state} {formData.zipCode}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
                    <p className="text-gray-700 text-sm flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Card ending in {formData.cardNumber.slice(-4) || user?.paymentMethods?.[0]?.last4}
                    </p>
                  </div>
                  <Separator />
                  
                  {/* Verification Code */}
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <Label htmlFor="verificationCode" className="text-base font-semibold mb-2 block">
                      Enter Verification Code
                    </Label>
                    <p className="text-sm text-gray-600 mb-4">
                      A 6-digit code was sent to {user.phone}. Code expires in 1 hour.
                    </p>
                    <Input
                      id="verificationCode"
                      type="text"
                      maxLength="6"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      className="text-center text-2xl tracking-widest"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Mock Code: {generatedCouponCode}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" size="lg">
                      Confirm Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
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
                  <span>Subtotal ({mockCart.length} items)</span>
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
              
              {/* Security Badge */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-sm font-semibold">Secure Checkout</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  2FA verification protects your purchase
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCheckout;
