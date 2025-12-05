import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const PaymentProcessors = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: '/payment-processors' } } });
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
    authorizenet: {
      enabled: false,
      configured: false,
      apiLoginId: '',
      transactionKey: '',
    },
    paypal: {
      enabled: false,
      configured: false,
      clientId: '',
      clientSecret: '',
    },
  });

  const processorInfo = {
    stripe: {
      name: 'Stripe',
      logo: 'https://images.stripeassets.com/fzn2n1nzq965/HTTOloNPhisV9P4hlMPNA/cacf1bb88b9fc492dfad34378d844280/Stripe_icon_-_square.svg?q=80&w=1082',
      description: 'Accept payments with Stripe\'s powerful API',
      transactionFee: '2.9% + $0.30 per transaction',
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
      logo: '//images.ctfassets.net/2d5q1td6cyxq/1LpHrPquGhe2CwCoko9pRk/48f66db2df053eed8ae4be115d633c38/PD04488_-_black_logo_on_white.png?w=553&h=283&fm=jpg&q=85&bg=rgb%3Affffff&fit=scale&fl=progressive, //images.ctfassets.net/2d5q1td6cyxq/1LpHrPquGhe2CwCoko9pRk/48f66db2df053eed8ae4be115d633c38/PD04488_-_black_logo_on_white.png?w=553&h=283&fm=jpg&q=85&bg=rgb%3Affffff&fit=scale&fl=progressive 2x',
      description: 'Accept payments with Square\'s easy-to-use platform',
      transactionFee: '2.6% + $0.10 per transaction',
      setupSteps: [
        'Create a Square account at squareup.com',
        'Go to Developer Dashboard',
        'Create a new application',
        'Copy Application ID and Access Token',
        'Get your Location ID from Locations',
        'Paste the credentials below',
      ],
      docs: 'https://developer.squareup.com',
    },
    authorizenet: {
      name: 'Authorize.Net',
      logo: '🔐',
      description: 'Accept payments with Authorize.Net\'s secure gateway',
      transactionFee: '2.9% + $0.30 per transaction',
      setupSteps: [
        'Create an Authorize.Net account',
        'Log in to Merchant Interface',
        'Go to Account > Settings > API Credentials & Keys',
        'Generate new API Login ID and Transaction Key',
        'Copy your credentials',
        'Paste them below',
      ],
      docs: 'https://www.authorize.net/support',
    },
    paypal: {
      name: 'PayPal',
      logo: '💙',
      description: 'Accept payments with PayPal\'s trusted platform',
      transactionFee: '2.99% per transaction',
      setupSteps: [
        'Create a PayPal Business account',
        'Go to developer.paypal.com',
        'Create a new REST API app',
        'Copy Client ID and Secret',
        'Paste credentials below',
        'Enable the integration',
      ],
      docs: 'https://developer.paypal.com/docs',
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
        </div>

        <Button onClick={() => handleSaveConfig(processorKey)} className="w-full">
          Save Configuration
        </Button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Processors</h1>
        <p className="text-gray-600">Configure and manage your payment processors</p>
      </div>

      {/* Important Notices */}
      <div className="space-y-4 mb-6">
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
                  CheqMart charges a 5.5% transaction fee for use of our checkout system, in addition to the payment processor's fees shown below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processor Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {Object.entries(processorInfo).map(([key, info]) => (
          <Card key={key}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{info.logo}</div>
                  <div>
                    <CardTitle>{info.name}</CardTitle>
                    <CardDescription>{info.description}</CardDescription>
                  </div>
                </div>
                <Switch
                  checked={processors[key].enabled}
                  onCheckedChange={() => handleToggle(key)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
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
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Processor Fee</span>
                  <span className="font-medium">{info.transactionFee}</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const element = document.getElementById(`config-${key}`);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Configure
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
          <CardDescription>Set up your payment processor credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stripe">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="stripe" id="config-stripe">Stripe</TabsTrigger>
              <TabsTrigger value="square" id="config-square">Square</TabsTrigger>
              <TabsTrigger value="authorizenet" id="config-authorizenet">Authorize.Net</TabsTrigger>
              <TabsTrigger value="paypal" id="config-paypal">PayPal</TabsTrigger>
            </TabsList>
            <TabsContent value="stripe" className="mt-6">
              {renderProcessorForm('stripe')}
            </TabsContent>
            <TabsContent value="square" className="mt-6">
              {renderProcessorForm('square')}
            </TabsContent>
            <TabsContent value="authorizenet" className="mt-6">
              {renderProcessorForm('authorizenet')}
            </TabsContent>
            <TabsContent value="paypal" className="mt-6">
              {renderProcessorForm('paypal')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentProcessors;
