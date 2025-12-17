import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle, ExternalLink, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const PaymentSetup = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: '/payment-setup' } } });
    }
  }, [isAuthenticated, navigate]);
  
  const [processors, setProcessors] = useState({
    stripe: {
      enabled: false,
      configured: false,
      apiKey: '',
      secretKey: '',
    },
    square: {
      enabled: false,
      configured: false,
      applicationId: '',
      accessToken: '',
      locationId: '',
    },
    paypal: {
      enabled: false,
      configured: false,
      clientId: '',
      clientSecret: '',
    },
    authorizenet: {
      enabled: false,
      configured: false,
      apiLoginId: '',
      transactionKey: '',
    },
    braintree: {
      enabled: false,
      configured: false,
      merchantId: '',
      publicKey: '',
      privateKey: '',
    },
    adyen: {
      enabled: false,
      configured: false,
      apiKey: '',
      merchantAccount: '',
    },
  });

  const processorInfo = {
    stripe: {
      name: 'Stripe',
      logoUrl: 'https://images.stripeassets.com/fzn2n1nzq965/HTTOloNPhisV9P4hlMPNA/cacf1bb88b9fc492dfad34378d844280/Stripe_icon_-_square.svg?q=80&w=1082',
      description: 'Industry-leading payment processing platform',
      transactionFee: '2.9% + $0.30',
      features: [
        'Instant payouts',
        'Global payments in 135+ currencies',
        'Advanced fraud protection',
        'Comprehensive reporting & analytics',
        'Subscription billing support',
        'Mobile-optimized checkout'
      ],
      setupSteps: [
        'Create a Stripe account at stripe.com',
        'Navigate to Developers > API keys',
        'Copy your Publishable key and Secret key',
        'Paste the keys below',
        'Enable the integration',
      ],
      docs: 'https://stripe.com/docs',
    },
    square: {
      name: 'Square',
      logoUrl: 'https://images.ctfassets.net/2d5q1td6cyxq/aXlc4MSO8ZGKTDIsPuIeW/c2b899a80016ca75b88086647cdd61f7/PD04490_-_white_logo_on_black.png?w=553&h=283&fm=jpg&q=85&bg=rgb%3Affffff&fit=scale&fl=progressive',
      description: 'Simple payment solution for businesses of all sizes',
      transactionFee: '2.6% + $0.10',
      features: [
        'Lower processing fees',
        'Fast next-day deposits',
        'Free POS hardware options',
        'In-person & online payments',
        'Inventory management tools',
        'Built-in invoicing'
      ],
      setupSteps: [
        'Create a Square account at squareup.com',
        'Go to Developer Dashboard at developer.squareup.com',
        'Create a new application',
        'Copy Application ID and Access Token',
        'Get your Location ID from Locations tab',
        'Paste the credentials below',
      ],
      docs: 'https://developer.squareup.com',
    },
    paypal: {
      name: 'PayPal',
      logoUrl: 'https://www.paypalobjects.com/marketing/web/logos/paypal-mark-color.svg',
      description: 'Trusted worldwide payment platform',
      transactionFee: '2.99%',
      features: [
        'Recognized by 400M+ users',
        'Buyer & seller protection',
        'No monthly or setup fees',
        'PayPal Credit financing',
        'Mobile-optimized checkout',
        'International transactions'
      ],
      setupSteps: [
        'Create a PayPal Business account at paypal.com',
        'Go to developer.paypal.com and log in',
        'Navigate to My Apps & Credentials',
        'Create a new REST API app',
        'Copy Client ID and Secret from the app details',
        'Paste credentials below and enable',
      ],
      docs: 'https://developer.paypal.com/docs',
    },
    authorizenet: {
      name: 'Authorize.Net',
      logoUrl: 'https://www.authorize.net/content/dam/anet-redesign/logos/auth-logo.svg',
      description: 'Trusted payment gateway since 1996',
      transactionFee: '2.9% + $0.30',
      features: [
        'PCI DSS Level 1 compliance',
        'Advanced fraud detection',
        'Recurring billing support',
        'Virtual terminal included',
        'Accept 8 payment types',
        '24/7 merchant support'
      ],
      setupSteps: [
        'Create an Authorize.Net account at authorize.net',
        'Log in to the Merchant Interface',
        'Go to Account > Settings > API Credentials & Keys',
        'Generate new API Login ID and Transaction Key',
        'Copy both credentials',
        'Paste them below and save configuration',
      ],
      docs: 'https://www.authorize.net/support',
    },
    braintree: {
      name: 'Braintree',
      logoUrl: 'https://www.braintreepayments.com/images/braintree-logo-black.svg',
      description: 'PayPal-owned platform for mobile & web',
      transactionFee: '2.9% + $0.30',
      features: [
        'Optimized for mobile apps',
        'Accept PayPal & Venmo',
        'One-touch checkout',
        'Advanced fraud tools',
        'Supports 130+ currencies',
        'Vault secure payment data'
      ],
      setupSteps: [
        'Sign up at braintreepayments.com',
        'Complete merchant verification',
        'Navigate to Settings > API',
        'Generate new API credentials',
        'Copy Merchant ID, Public Key, and Private Key',
        'Paste credentials below',
      ],
      docs: 'https://developer.paypal.com/braintree/docs',
    },
    adyen: {
      name: 'Adyen',
      logoUrl: 'https://www.adyen.com/images/adyen-logo.svg',
      description: 'Enterprise payment platform for global commerce',
      transactionFee: 'Custom pricing',
      features: [
        'Global payment methods',
        'Smart payment routing',
        'Revenue optimization',
        'Unified commerce platform',
        'Risk management tools',
        'Real-time reporting'
      ],
      setupSteps: [
        'Contact Adyen sales for merchant account',
        'Complete onboarding process',
        'Access Customer Area at ca-test.adyen.com',
        'Go to Developers > API credentials',
        'Generate new API key',
        'Copy API Key and Merchant Account name',
      ],
      docs: 'https://docs.adyen.com',
    },
  };

  const handleToggle = (processor) => {
    if (!processors[processor].configured) {
      toast({
        title: "Configuration required",
        description: "Please configure the processor first before enabling.",
        variant: "destructive",
      });
      return;
    }

    setProcessors({
      ...processors,
      [processor]: {
        ...processors[processor],
        enabled: !processors[processor].enabled,
      },
    });

    toast({
      title: processors[processor].enabled ? "Processor disabled" : "Processor enabled",
      description: `${processorInfo[processor].name} has been ${processors[processor].enabled ? 'disabled' : 'enabled'}.`,
    });
  };

  const handleSaveConfig = (processor) => {
    // Validate that all fields are filled
    const config = processors[processor];
    const allFieldsFilled = Object.entries(config)
      .filter(([key]) => key !== 'enabled' && key !== 'configured')
      .every(([_, value]) => value && value.trim() !== '');

    if (!allFieldsFilled) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setProcessors({
      ...processors,
      [processor]: {
        ...processors[processor],
        configured: true,
      },
    });

    // Save to user profile
    updateUser({
      paymentProcessors: {
        ...user?.paymentProcessors,
        [processor]: { ...config, configured: true },
      },
    });

    toast({
      title: "Configuration saved!",
      description: `${processorInfo[processor].name} has been configured successfully.`,
    });
  };

  const renderProcessorForm = (processorKey) => {
    const processor = processors[processorKey];
    const info = processorInfo[processorKey];

    return (
      <div className="space-y-6">
        {/* Setup Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3">Setup Instructions</h4>
          <ol className="space-y-2 text-sm text-blue-800">
            {info.setupSteps.map((step, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="font-semibold">{idx + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <a
            href={info.docs}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-3"
          >
            View Official Documentation
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Configuration Form */}
        <div className="space-y-4">
          {processorKey === 'stripe' && (
            <>
              <div>
                <Label htmlFor="stripe-api">Publishable Key *</Label>
                <Input
                  id="stripe-api"
                  placeholder="pk_live_..."
                  value={processor.apiKey}
                  onChange={(e) =>
                    setProcessors({
                      ...processors,
                      stripe: { ...processor, apiKey: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="stripe-secret">Secret Key *</Label>
                <Input
                  id="stripe-secret"
                  type="password"
                  placeholder="sk_live_..."
                  value={processor.secretKey}
                  onChange={(e) =>
                    setProcessors({
                      ...processors,
                      stripe: { ...processor, secretKey: e.target.value },
                    })
                  }
                />
              </div>
            </>
          )}

          {processorKey === 'square' && (
            <>
              <div>
                <Label htmlFor="square-app">Application ID *</Label>
                <Input
                  id="square-app"
                  placeholder="sq0idp-..."
                  value={processor.applicationId}
                  onChange={(e) =>
                    setProcessors({
                      ...processors,
                      square: { ...processor, applicationId: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="square-token">Access Token *</Label>
                <Input
                  id="square-token"
                  type="password"
                  placeholder="EAAAl..."
                  value={processor.accessToken}
                  onChange={(e) =>
                    setProcessors({
                      ...processors,
                      square: { ...processor, accessToken: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="square-location">Location ID *</Label>
                <Input
                  id="square-location"
                  placeholder="L..."
                  value={processor.locationId}
                  onChange={(e) =>
                    setProcessors({
                      ...processors,
                      square: { ...processor, locationId: e.target.value },
                    })
                  }
                />
              </div>
            </>
          )}

          {processorKey === 'paypal' && (
            <>
              <div>
                <Label htmlFor="paypal-client">Client ID *</Label>
                <Input
                  id="paypal-client"
                  placeholder="Your Client ID"
                  value={processor.clientId}
                  onChange={(e) =>
                    setProcessors({
                      ...processors,
                      paypal: { ...processor, clientId: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="paypal-secret">Client Secret *</Label>
                <Input
                  id="paypal-secret"
                  type="password"
                  placeholder="Your Client Secret"
                  value={processor.clientSecret}
                  onChange={(e) =>
                    setProcessors({
                      ...processors,
                      paypal: { ...processor, clientSecret: e.target.value },
                    })
                  }
                />
              </div>
            </>
          )}

          {processorKey === 'authorizenet' && (
            <>
              <div>
                <Label htmlFor="auth-login">API Login ID *</Label>
                <Input
                  id="auth-login"
                  placeholder="Your API Login ID"
                  value={processor.apiLoginId}
                  onChange={(e) =>
                    setProcessors({
                      ...processors,
                      authorizenet: { ...processor, apiLoginId: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="auth-key">Transaction Key *</Label>
                <Input
                  id="auth-key"
                  type="password"
                  placeholder="Your Transaction Key"
                  value={processor.transactionKey}
                  onChange={(e) =>
                    setProcessors({
                      ...processors,
                      authorizenet: { ...processor, transactionKey: e.target.value },
                    })
                  }
                />
              </div>
            </>
          )}

          {processorKey === 'braintree' && (
            <>
              <div>
                <Label htmlFor="braintree-merchant">Merchant ID *</Label>
                <Input
                  id="braintree-merchant"
                  placeholder="Your Merchant ID"
                  value={processor.merchantId}
                  onChange={(e) =>
                    setProcessors({
                      ...processors,
                      braintree: { ...processor, merchantId: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="braintree-public">Public Key *</Label>
                <Input
                  id="braintree-public"
                  placeholder="Your Public Key"
                  value={processor.publicKey}
                  onChange={(e) =>
                    setProcessors({
                      ...processors,
                      braintree: { ...processor, publicKey: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="braintree-private">Private Key *</Label>
                <Input
                  id="braintree-private"
                  type="password"
                  placeholder="Your Private Key"
                  value={processor.privateKey}
                  onChange={(e) =>
                    setProcessors({
                      ...processors,
                      braintree: { ...processor, privateKey: e.target.value },
                    })
                  }
                />
              </div>
            </>
          )}

          {processorKey === 'adyen' && (
            <>
              <div>
                <Label htmlFor="adyen-api">API Key *</Label>
                <Input
                  id="adyen-api"
                  type="password"
                  placeholder="Your API Key"
                  value={processor.apiKey}
                  onChange={(e) =>
                    setProcessors({
                      ...processors,
                      adyen: { ...processor, apiKey: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="adyen-merchant">Merchant Account *</Label>
                <Input
                  id="adyen-merchant"
                  placeholder="Your Merchant Account Name"
                  value={processor.merchantAccount}
                  onChange={(e) =>
                    setProcessors({
                      ...processors,
                      adyen: { ...processor, merchantAccount: e.target.value },
                    })
                  }
                />
              </div>
            </>
          )}
        </div>

        <Button onClick={() => handleSaveConfig(processorKey)} className="w-full">
          Save Configuration
        </Button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Processors</h1>
        <p className="text-gray-600">Configure and manage your payment processors to start accepting payments</p>
      </div>

      {/* Important Notices */}
      <div className="space-y-4 mb-8">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">Required for Selling</p>
                <p className="text-sm text-blue-800">
                  You must configure and enable at least one payment processor before you can list items for sale. This ensures buyers can complete purchases securely.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 mb-1">Transaction Fees</p>
                <p className="text-sm text-amber-800">
                  CheqMart charges a 5.5% platform fee on each transaction, in addition to the payment processor fees shown below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processor Cards - 2 per row */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {Object.entries(processorInfo).map(([key, info]) => (
          <Card key={key} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center justify-center h-16 flex-1">
                  <img 
                    src={info.logoUrl} 
                    alt={`${info.name} logo`}
                    className="h-12 w-auto object-contain max-w-[200px]"
                  />
                </div>
                <Switch
                  checked={processors[key].enabled}
                  onCheckedChange={() => handleToggle(key)}
                />
              </div>
              <CardTitle className="text-xl">{info.name}</CardTitle>
              <CardDescription className="min-h-[40px]">{info.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm pb-3 border-b">
                  <span className="text-gray-600">Status</span>
                  {processors[key].configured ? (
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not Configured</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm pb-3 border-b">
                  <span className="text-gray-600">Processor Fee</span>
                  <span className="font-medium">{info.transactionFee}</span>
                </div>
                
                {/* Features List */}
                <div className="space-y-2 py-2">
                  <p className="text-sm font-semibold text-gray-700">Key Features:</p>
                  {info.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => {
                    const element = document.getElementById(`config-${key}`);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Configure {info.name}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Processor Configuration</CardTitle>
          <CardDescription>Set up your payment processor API credentials below</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stripe">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="stripe" id="config-stripe">Stripe</TabsTrigger>
              <TabsTrigger value="square" id="config-square">Square</TabsTrigger>
              <TabsTrigger value="paypal" id="config-paypal">PayPal</TabsTrigger>
              <TabsTrigger value="authorizenet" id="config-authorizenet">Authorize.Net</TabsTrigger>
              <TabsTrigger value="braintree" id="config-braintree">Braintree</TabsTrigger>
              <TabsTrigger value="adyen" id="config-adyen">Adyen</TabsTrigger>
            </TabsList>
            <TabsContent value="stripe" className="mt-6">
              {renderProcessorForm('stripe')}
            </TabsContent>
            <TabsContent value="square" className="mt-6">
              {renderProcessorForm('square')}
            </TabsContent>
            <TabsContent value="paypal" className="mt-6">
              {renderProcessorForm('paypal')}
            </TabsContent>
            <TabsContent value="authorizenet" className="mt-6">
              {renderProcessorForm('authorizenet')}
            </TabsContent>
            <TabsContent value="braintree" className="mt-6">
              {renderProcessorForm('braintree')}
            </TabsContent>
            <TabsContent value="adyen" className="mt-6">
              {renderProcessorForm('adyen')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSetup;
