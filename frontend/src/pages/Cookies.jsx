import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Cookie, Settings, Eye, BarChart, Target } from 'lucide-react';

const Cookies = () => {
  const navigate = useNavigate();

  const cookieTypes = [
    {
      icon: Settings,
      title: 'Essential Cookies',
      description: 'Required for the website to function properly',
      required: true,
      examples: [
        'Authentication and session management',
        'Security and fraud prevention',
        'Load balancing and performance',
        'Shopping cart and checkout functionality'
      ]
    },
    {
      icon: Eye,
      title: 'Functional Cookies',
      description: 'Enable enhanced functionality and personalization',
      required: false,
      examples: [
        'Language and region preferences',
        'Display settings and customization',
        'Video player preferences',
        'Chat widget functionality'
      ]
    },
    {
      icon: BarChart,
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors use our site',
      required: false,
      examples: [
        'Google Analytics tracking',
        'Page view and session data',
        'User behavior patterns',
        'Performance monitoring'
      ]
    },
    {
      icon: Target,
      title: 'Marketing Cookies',
      description: 'Used to track visitors and show relevant ads',
      required: false,
      examples: [
        'Social media tracking pixels',
        'Retargeting and remarketing',
        'Ad campaign performance',
        'Third-party advertising networks'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-4 mb-4">
            <Cookie className="w-12 h-12" />
            <h1 className="text-4xl font-bold">Cookie Policy</h1>
          </div>
          <p className="text-xl text-blue-100">
            Learn about how we use cookies and similar technologies on BayMarket.
          </p>
          <p className="text-sm text-blue-200 mt-4">
            Last Updated: December 5, 2025
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Cookies are small text files that are placed on your device when you visit our website. They help us 
                provide you with a better experience by remembering your preferences, keeping you signed in, and 
                understanding how you use our site.
              </p>
              <p>
                We use both first-party cookies (set by BayMarket) and third-party cookies (set by our partners and 
                service providers) to enhance your experience and improve our services.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Types of Cookies */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Types of Cookies We Use</h2>
          {cookieTypes.map((type, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    type.required ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <type.icon className={`w-6 h-6 ${
                      type.required ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{type.title}</h3>
                      {type.required && (
                        <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{type.description}</p>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Examples:</p>
                      <ul className="space-y-1">
                        {type.examples.map((example, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Third-Party Cookies */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                We work with trusted third-party partners who may set cookies on your device to help us provide 
                our services and improve your experience. These partners include:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Analytics Partners</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Google Analytics</li>
                    <li>• Mixpanel</li>
                    <li>• Hotjar</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Advertising Partners</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Google Ads</li>
                    <li>• Facebook Pixel</li>
                    <li>• Twitter Ads</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Payment Processors</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Stripe</li>
                    <li>• Square</li>
                    <li>• PayPal</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Social Media</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Facebook</li>
                    <li>• Twitter</li>
                    <li>• Instagram</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Managing Cookies */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                You have the right to decide whether to accept or reject cookies. You can manage your cookie 
                preferences through:
              </p>
              <div>
                <h4 className="font-semibold mb-2">Cookie Settings</h4>
                <p className="text-sm mb-3">
                  Click the button below to manage your cookie preferences. You can accept all cookies, 
                  reject non-essential cookies, or customize your preferences.
                </p>
                <Button>
                  Manage Cookie Settings
                </Button>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Browser Settings</h4>
                <p className="text-sm">
                  Most web browsers allow you to control cookies through their settings. You can typically 
                  find these settings in the "Options" or "Preferences" menu of your browser. Note that 
                  blocking cookies may impact your experience on BayMarket.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Do Not Track</h4>
                <p className="text-sm">
                  We honor Do Not Track (DNT) signals. If you enable DNT in your browser, we will not track 
                  your browsing activity for analytics or advertising purposes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Duration */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cookie Duration</h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <h4 className="font-semibold">Session Cookies</h4>
                <p className="text-sm">
                  These temporary cookies are deleted when you close your browser. They help maintain your 
                  session while browsing our site.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Persistent Cookies</h4>
                <p className="text-sm">
                  These cookies remain on your device for a set period (ranging from days to years) even 
                  after closing your browser. They help remember your preferences for future visits.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                We may update this Cookie Policy from time to time to reflect changes in technology, legislation, 
                or our business practices. We will post any updates on this page and update the "Last Updated" date.
              </p>
              <p>
                We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Questions About Cookies?</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                If you have questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> privacy@baymarket.com</p>
                <p><strong>Phone:</strong> 1-800-BAYMARKET (229-6275)</p>
              </div>
              <Button onClick={() => navigate('/contact')} className="mt-4">
                Contact Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cookies;