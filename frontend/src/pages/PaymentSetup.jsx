import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Check
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
      name: 'Stripe',
      logoUrl: 'https://images.stripeassets.com/fzn2n1nzq965/HTTOloNPhisV9P4hlMPNA/cacf1bb88b9fc492dfad34378d844280/Stripe_icon_-_square.svg?q=80&w=1082',
      description: 'Industry-leading payment processing for online businesses',
      connected: paymentStatus.stripe_connected,
      fee: '2.9% + $0.30',
      route: '/stripe-connect',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      features: [
        'Instant payouts',
        'Global payments',
        'Fraud protection',
        'Advanced reporting'
      ]
    },
    {
      id: 'square',
      name: 'Square',
      logoUrl: 'https://images.ctfassets.net/2d5q1td6cyxq/aXlc4MSO8ZGKTDIsPuIeW/c2b899a80016ca75b88086647cdd61f7/PD04490_-_white_logo_on_black.png?w=553&h=283&fm=jpg&q=85&bg=rgb%3Affffff&fit=scale&fl=progressive',
      description: 'Simple and powerful payment solution for sellers',
      connected: paymentStatus.square_connected,
      fee: '2.6% + $0.10',
      route: '/square-connect',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      buttonColor: 'bg-gray-800 hover:bg-gray-900',
      features: [
        'Lower fees',
        'Fast deposits',
        'POS integration',
        'Easy setup'
      ]
    },
    {
      id: 'paypal',
      name: 'PayPal',
      logoUrl: 'https://www.paypalobjects.com/marketing/web/logos/paypal-mark-color.svg',
      description: 'Trusted worldwide payment platform with buyer protection',
      connected: paymentStatus.paypal_connected,
      fee: '2.99%',
      route: '/paypal-connect',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      features: [
        'Buyer protection',
        'No setup fees',
        'Mobile payments',
        'PayPal credit'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')} 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Payment Setup</h1>
          <p className="text-gray-600 mt-2">
            Connect a payment processor to start receiving payments from buyers
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Alert if no processor connected */}
        {!paymentStatus.has_any_processor && (
          <Alert className="mb-8 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Action Required:</strong> Please connect at least one payment processor to start selling on CheqMart.
            </AlertDescription>
          </Alert>
        )}

        {/* Platform Fee Notice */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Platform Fee:</strong> CheqMart charges a 5.5% platform fee on each transaction, plus the payment processor fees shown below.
          </p>
        </div>

        {/* Processor Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {processors.map((processor) => (
            <Card 
              key={processor.id}
              className={`relative overflow-hidden ${processor.bgColor} ${processor.borderColor} border-2 hover:shadow-xl transition-all duration-300`}
            >
              <CardContent className="p-6">
                {/* Connected Badge */}
                {processor.connected && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                )}

                {/* Logo */}
                <div className="flex items-center justify-center h-20 mb-6">
                  <img 
                    src={processor.logoUrl} 
                    alt={`${processor.name} logo`}
                    className="h-16 w-auto object-contain"
                  />
                </div>

                {/* Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  {processor.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 text-center min-h-[40px]">
                  {processor.description}
                </p>

                {/* Fee */}
                <div className="mb-6 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Processing Fee</p>
                    <p className="text-lg font-bold text-gray-900">{processor.fee}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {processor.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => navigate(processor.route)}
                  className={`w-full ${processor.buttonColor} text-white`}
                >
                  {processor.connected ? 'Manage Connection' : 'Connect'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help Choosing?</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div>
                <p className="font-semibold mb-1">Choose Stripe if:</p>
                <ul className="space-y-1 text-xs">
                  <li>• You want the most features</li>
                  <li>• You sell internationally</li>
                  <li>• You need advanced reporting</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-1">Choose Square if:</p>
                <ul className="space-y-1 text-xs">
                  <li>• You want lower fees</li>
                  <li>• You need POS integration</li>
                  <li>• You want fast deposits</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-1">Choose PayPal if:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Your buyers prefer PayPal</li>
                  <li>• You want buyer protection</li>
                  <li>• You need mobile payments</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSetup;
