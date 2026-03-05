import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ArrowLeft, Search, HelpCircle, ShoppingBag, CreditCard, Truck, Shield, MessageSquare, ChevronRight } from 'lucide-react';

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      icon: ShoppingBag,
      title: 'Buying on Effinsure',
      description: 'Learn how to find, purchase, and track items',
      articles: [
        'How to search for items',
        'Making your first purchase',
        'Understanding product listings',
        'Using watchlist and favorites',
        'Bidding strategies and tips'
      ],
      color: 'blue'
    },
    {
      icon: CreditCard,
      title: 'Selling on Effinsure',
      description: 'Start selling and manage your listings',
      articles: [
        'Creating your first listing',
        'Setting up payment processors',
        'Pricing your items effectively',
        'Managing inventory and orders',
        'Understanding seller fees'
      ],
      color: 'green'
    },
    {
      icon: Shield,
      title: 'Account & Security',
      description: 'Keep your account safe and secure',
      articles: [
        'Creating and verifying your account',
        'Enabling two-factor authentication',
        'Resetting your password',
        'Protecting against scams',
        'Reporting suspicious activity'
      ],
      color: 'purple'
    },
    {
      icon: Truck,
      title: 'Shipping & Delivery',
      description: 'Everything about shipping and tracking',
      articles: [
        'Shipping options and costs',
        'Tracking your orders',
        'International shipping',
        'Handling shipping issues',
        'Returns and refunds'
      ],
      color: 'orange'
    },
    {
      icon: CreditCard,
      title: 'Payments & Fees',
      description: 'Understanding payments and charges',
      articles: [
        'Payment methods accepted',
        'Understanding platform fees',
        'When will I get paid?',
        'Handling payment disputes',
        'Tax information and reporting'
      ],
      color: 'indigo'
    },
    {
      icon: MessageSquare,
      title: 'Communication',
      description: 'Messaging and customer service',
      articles: [
        'Using the messaging system',
        'Contacting sellers or buyers',
        'Leaving feedback and reviews',
        'Resolving disputes',
        'Getting help from support'
      ],
      color: 'pink'
    }
  ];

  const popularArticles = [
    { title: 'How do I create my first listing?', views: '50K' },
    { title: 'What payment methods do you accept?', views: '45K' },
    { title: 'How to track my order?', views: '42K' },
    { title: 'Understanding seller fees', views: '38K' },
    { title: 'How to connect Stripe for payments?', views: '35K' },
    { title: 'What is buyer protection?', views: '32K' },
    { title: 'How to report a problem with an order?', views: '30K' },
    { title: 'Shipping internationally - what you need to know', views: '28K' }
  ];

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      pink: 'bg-pink-100 text-pink-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-12 h-12" />
            <h1 className="text-4xl font-bold">Help Center</h1>
          </div>
          <p className="text-xl text-blue-100 mb-8">
            Find answers to your questions and learn how to use Effinsure
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg bg-white text-gray-900 border-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Topics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${getColorClass(category.color)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <category.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.map((article, idx) => (
                      <li key={idx} className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer flex items-center group">
                        <ChevronRight className="w-4 h-4 mr-1 text-gray-400 group-hover:text-blue-600" />
                        {article}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Most Viewed Articles</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {popularArticles.map((article, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-400 w-6">{index + 1}</span>
                      <span className="text-gray-900">{article.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{article.views} views</span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Support */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Still Need Help?</h3>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? Our support team is here to help you 24/7.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/contact')}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline">
                  Start Live Chat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Help;