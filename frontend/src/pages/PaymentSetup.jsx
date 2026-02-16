import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  CreditCard,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const PaymentSetup = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [paymentStatus, setPaymentStatus] = useState({
    has_any_processor: false,
    stripe_connected: false,
    square_connected: false,
    paypal_connected: false,
    authorizenet_connected: false,
    epicpayment_connected: false
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: '/payment-setup' } } });
    }
  }, [isAuthenticated, navigate]);

  // Fetch payment status
  useEffect(() => {
    if (user?.id) {
      fetchPaymentStatus();
    }
  }, [user?.id]);

  const fetchPaymentStatus = async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get(`${BACKEND_URL}/api/users/${user.id}/payment-status`);
      setPaymentStatus(response.data);
    } catch (error) {
      console.error('Error fetching payment status:', error);
    }
  };

  const processors = [
    {
      id: 'stripe',
      name: 'Stripe Connect',
      logoUrl: 'https://images.stripeassets.com/fzn2n1nzq965/HTTOloNPhisV9P4hlMPNA/cacf1bb88b9fc492dfad34378d844280/Stripe_icon_-_square.svg?q=80&w=1082',
      description: 'Industry-leading payment processing',
      connected: paymentStatus.stripe_connected,
      fee: '2.9% + $0.30',
      route: '/stripe-connect',
      gradient: 'from-purple-600 to-blue-500',
      feeType: 'automatic',
      features: [
        'Express Connected Accounts',
        'Automatic payouts',
        'Global payment support',
        'Built-in fraud protection'
      ]
    },
    {
      id: 'square',
      name: 'Square',
      logoUrl: 'https://images.ctfassets.net/2d5q1td6cyxq/aXlc4MSO8ZGKTDIsPuIeW/c2b899a80016ca75b88086647cdd61f7/PD04490_-_white_logo_on_black.png?w=553&h=283&fm=jpg&q=85&bg=rgb%3Affffff&fit=scale&fl=progressive',
      description: 'Simple & Powerful payment solution',
      connected: paymentStatus.square_connected,
      fee: '2.6% + $0.10',
      route: '/square-connect',
      gradient: 'from-slate-800 to-gray-600',
      feeType: 'automatic',
      features: [
        'OAuth integration',
        'Instant deposits available',
        'In-person & online payments',
        'Free POS hardware'
      ]
    },
    {
      id: 'paypal',
      name: 'PayPal',
      logoUrl: 'https://www.paypalobjects.com/marketing/web/logos/paypal-mark-color.svg',
      description: 'Trusted worldwide payment platform',
      connected: paymentStatus.paypal_connected,
      fee: '2.99%',
      route: '/paypal-connect',
      gradient: 'from-blue-600 to-blue-400',
      feeType: 'automatic',
      features: [
        'OAuth integration',
        'PayPal & credit card payments',
        'Buyer & seller protection',
        'Recognized worldwide'
      ]
    },
    {
      id: 'authorizenet',
      name: 'Authorize.net',
      logoUrl: 'https://raw.githubusercontent.com/fortunefavors3/image-hosting/main/authorizeNet.png',
      description: 'For high-risk & specialty merchants',
      connected: paymentStatus.authorizenet_connected,
      fee: '2.9% + $0.30',
      route: '/authorizenet-connect',
      gradient: 'from-blue-600 to-indigo-900',
      feeType: 'manual',
      isManualEntry: true,
      features: [
        'Manual credential entry',
        'High-risk merchant friendly',
        'Established & reliable',
        'Works with existing accounts'
      ]
    },
    
    // New OAuth processor
    {
      id: 'braintree',
      name: 'Braintree',
      logoUrl: 'https://raw.githubusercontent.com/fortunefavors3/image-hosting/main/braintree.png',
      description: 'PayPal-owned payment platform',
      connected: paymentStatus.braintree_connected,
      fee: '2.59% + $0.49',
      route: '/braintree-connect',
      gradient: 'from-slate-900 to-gray-800',
      feeType: 'automatic',
      features: [
        'OAuth integration',
        'PayPal & Venmo support',
        'Advanced fraud protection',
        'Drop-in UI components'
      ]
    },
    // New manual entry processors
    {
      id: 'nmi',
      name: 'NMI',
      logoUrl: 'https://raw.githubusercontent.com/fortunefavors3/image-hosting/main/nmipayments_logo.jpg',
      description: 'Network Merchants Inc - Popular gateway',
      connected: paymentStatus.nmi_connected,
      fee: 'Varies',
      route: '/nmi-connect',
      gradient: 'from-emerald-500 to-teal-600',
      feeType: 'manual',
      isManualEntry: true,
      features: [
        'Supports 100+ processors',
        'High-risk friendly',
        'Flexible integration',
        'Virtual terminal included'
      ]
    },
    {
      id: 'paykickstart',
      name: 'PayKickstart',
      logoUrl: 'https://raw.githubusercontent.com/fortunefavors3/image-hosting/main/paykickstart.png',
      description: 'Shopping cart & subscription platform',
      connected: paymentStatus.paykickstart_connected,
      fee: 'Varies',
      route: '/paykickstart-connect',
      gradient: 'from-teal-400 to-slate-700',
      feeType: 'manual',
      isManualEntry: true,
      features: [
        'Digital goods support',
        'Subscription management',
        'Affiliate tracking',
        'One-click upsells'
      ]
    },
    {
      id: 'usaepay',
      name: 'USAePay',
      logoUrl: 'https://raw.githubusercontent.com/fortunefavors3/image-hosting/main/usaepay.jpg',
      description: 'High-volume payment processing',
      connected: paymentStatus.usaepay_connected,
      fee: 'Varies',
      route: '/usaepay-connect',
      gradient: 'from-slate-600 to-indigo-700',
      feeType: 'manual',
      isManualEntry: true,
      features: [
        'High-volume friendly',
        'Level 3 processing',
        'Recurring billing',
        'Mobile payments'
      ]
    },
    {
      id: 'hostmerchant',
      name: 'Host Merchant',
      logoUrl: 'https://raw.githubusercontent.com/fortunefavors3/image-hosting/main/cropped-HMS-favicon-512x512-SR19-8R1.webp',
      description: 'Competitive rates for all businesses',
      connected: paymentStatus.hostmerchant_connected,
      fee: 'Interchange+',
      route: '/hostmerchant-connect',
      gradient: 'from-rose-500 to-red-700',
      feeType: 'manual',
      isManualEntry: true,
      features: [
        'Low interchange+ pricing',
        'No long-term contracts',
        'Free terminal equipment',
        'Same-day funding available'
      ]
    },
     {
      id: 'durango',
      name: 'Durango',
      logoUrl: 'https://raw.githubusercontent.com/fortunefavors3/image-hosting/main/durango.png',
      description: 'High-risk merchant specialist',
      connected: paymentStatus.durango_connected,
      fee: 'Varies',
      route: '/durango-connect',
      gradient: 'from-slate-400 to-sky-600',
      feeType: 'manual',
      isManualEntry: true,
      features: [
        'High-risk industries',
        'CBD & cannabis friendly',
        'Adult merchants welcome',
        'Nutraceuticals support'
      ]
    },
    {
      id: 'adyen',
      name: 'Adyen',
      logoUrl: 'https://raw.githubusercontent.com/fortunefavors3/image-hosting/main/ADYEN.AS-76bbfafc.png',
      description: 'Enterprise - Used by Uber, Spotify',
      connected: paymentStatus.adyen_connected,
      fee: 'Custom',
      route: '/adyen-connect',
      gradient: 'from-lime-400 to-emerald-400',
      feeType: 'manual',
      isManualEntry: true,
      features: [
        'Enterprise-grade',
        'Global payment methods',
        'Real-time analytics',
        'Unified commerce platform'
      ]
    },
    {
      id: 'epicpayment',
      name: 'Epic Payment Solutions',
      logoUrl: 'https://raw.githubusercontent.com/fortunefavors3/image-hosting/main/epic.jpg', // Will use icon
      description: 'Flexible payment solutions for all merchants',
      connected: paymentStatus.epicpayment_connected,
      fee: '2.75% + $0.25',
      route: '/epicpayment-connect',
      gradient: 'from-orange-700 to-red-600',
      feeType: 'manual',
      isManualEntry: true,
      features: [
        'Manual credential entry',
        'Competitive rates',
        'Multiple currency support',
        'Easy integration'
      ]
    },
    {
      id: 'worldpay',
      name: 'WorldPay',
      logoUrl: 'https://raw.githubusercontent.com/fortunefavors3/image-hosting/main/worldpay825476.png',
      description: 'Global payment processing leader',
      connected: paymentStatus.worldpay_connected,
      fee: 'Custom',
      route: '/worldpay-connect',
      gradient: 'from-rose-500 to-orange-500',
      feeType: 'manual',
      isManualEntry: true,
      features: [
        'Global coverage',
        '120+ currencies',
        'PCI DSS certified',
        'Industry leader'
      ]
    },
    {
      id: 'checkoutcom',
      name: 'Checkout.com',
      logoUrl: 'https://raw.githubusercontent.com/fortunefavors3/image-hosting/main/checkoutcom.jpg',
      description: 'Modern payment infrastructure',
      connected: paymentStatus.checkoutcom_connected,
      fee: 'Custom',
      route: '/checkoutcom-connect',
      gradient: 'from-blue-600 to-sky-300',
      feeType: 'manual',
      isManualEntry: true,
      features: [
        'High-growth companies',
        'Fast onboarding',
        'Intelligent acceptance',
        'Real-time reporting'
      ]
    }
  ];

  // Separate processors by fee collection type
  const automaticProcessors = processors.filter(p => p.feeType === 'automatic');
  const manualProcessors = processors.filter(p => p.feeType === 'manual');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Setup</h1>
        <p className="text-gray-600">Connect your payment processors to start selling</p>
      </div>

      {/* Important Notices */}
      <div className="space-y-4 mb-8">
        {!paymentStatus.has_any_processor && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Action Required:</strong> Connect at least one payment processor to start listing items for sale.
            </AlertDescription>
          </Alert>
        )}

        <Alert className="border-blue-200 bg-blue-50">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Platform Fee:</strong> CheqMart charges 5.5% per transaction, in addition to the processor's fees shown below.
          </AlertDescription>
        </Alert>
      </div>

      {/* Overall Status */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                paymentStatus.has_any_processor ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {paymentStatus.has_any_processor ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {paymentStatus.has_any_processor ? 'Ready to Sell' : 'Setup Required'}
                </h3>
                <p className="text-sm text-gray-600">
                  {paymentStatus.has_any_processor 
                    ? 'You can now list items and accept payments'
                    : 'Connect a payment processor to start selling'}
                </p>
              </div>
            </div>
            <Badge className={paymentStatus.has_any_processor ? 'bg-green-500' : 'bg-gray-400'}>
              {paymentStatus.has_any_processor ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Automatic Fee Collection Processors */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Automatic Fee Collection</h2>
          <Badge className="bg-green-100 text-green-800">Recommended</Badge>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          These processors support OAuth integration with automatic 5.5% platform fee deduction per transaction.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {automaticProcessors.map((processor) => (
            <Card key={processor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-16 h-16 bg-gradient-to-br ${processor.gradient} rounded-xl flex items-center justify-center p-3`}>
                      <img 
                        src={processor.logoUrl} 
                        alt={`${processor.name} logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{processor.name}</CardTitle>
                      <CardDescription>{processor.description}</CardDescription>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={processor.connected ? 'bg-green-500' : 'bg-gray-400'}>
                    {processor.connected ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      'Not Connected'
                    )}
                  </Badge>
                  <span className="text-sm text-gray-600">Fee: {processor.fee}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Features:</p>
                  <ul className="space-y-1">
                    {processor.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <Button 
                  onClick={() => navigate(processor.route)}
                  className={`w-full ${processor.connected ? '' : `bg-gradient-to-r ${processor.gradient} hover:opacity-90`}`}
                  variant={processor.connected ? 'outline' : 'default'}
                >
                  {processor.connected ? (
                    <>
                      Manage Connection
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Connect {processor.name}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Manual Entry Processors */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <h2 className="text-xl font-semibold text-gray-900">Manual Credential Entry</h2>
          <Badge className="bg-amber-100 text-amber-800">High-Risk Friendly</Badge>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          For merchants who can't use OAuth processors. Platform fees are invoiced monthly instead of automatic deduction.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {manualProcessors.map((processor) => (
            <Card key={processor.id} className="hover:shadow-lg transition-shadow border-amber-200">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-16 h-16 bg-gradient-to-br ${processor.gradient} rounded-xl flex items-center justify-center p-3`}>
                      {processor.logoUrl ? (
                        <img 
                          src={processor.logoUrl} 
                          alt={`${processor.name} logo`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <CreditCard className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{processor.name}</CardTitle>
                      <CardDescription>{processor.description}</CardDescription>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={processor.connected ? 'bg-green-500' : 'bg-gray-400'}>
                    {processor.connected ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      'Not Connected'
                    )}
                  </Badge>
                  <span className="text-sm text-gray-600">Fee: {processor.fee}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Manual Entry Notice */}
                <div className="p-2 bg-amber-50 rounded border border-amber-200 text-xs text-amber-800">
                  ⚠️ Platform fee (5.5%) billed monthly via invoice
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Features:</p>
                  <ul className="space-y-1">
                    {processor.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <Button 
                  onClick={() => navigate(processor.route)}
                  className={`w-full ${processor.connected ? '' : `bg-gradient-to-r ${processor.gradient} hover:opacity-90`}`}
                  variant={processor.connected ? 'outline' : 'default'}
                >
                  {processor.connected ? (
                    <>
                      Manage Connection
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Setup {processor.name}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <Card className="mt-8 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Need Help Choosing?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            <strong>Stripe</strong> is ideal if you want advanced features, global payments, and don't have an existing processor.
          </p>
          <p>
            <strong>Square</strong> is perfect if you already use Square for in-person sales or prefer their all-in-one ecosystem.
          </p>
          <p>
            <strong>PayPal</strong> is ideal if your buyers prefer PayPal's trusted platform or you want to accept PayPal balance payments.
          </p>
          <p>
            <strong>Multiple?</strong> You can connect all three processors and choose per transaction, giving your buyers maximum flexibility.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSetup;
