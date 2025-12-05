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
    paypal_connected: false
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
      gradient: 'from-gray-800 to-gray-600',
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
      features: [
        'OAuth integration',
        'PayPal & credit card payments',
        'Buyer & seller protection',
        'Recognized worldwide'
      ]
    }
  ];

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

      {/* Processor Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {processors.map((processor) => (
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

      {/* Help Section */}
      <Card className="mt-8 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Need Help Choosing?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            <strong>Stripe Connect</strong> is ideal if you want advanced features, global payments, and don't have an existing processor.
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
