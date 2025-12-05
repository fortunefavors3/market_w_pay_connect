import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Mail, Phone, MapPin, MessageSquare, ArrowLeft, Send } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true);
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
    }, 500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'support@baymarket.com',
      detail: 'Response within 24 hours',
      action: 'mailto:support@baymarket.com'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: '1-800-BAYMARKET',
      detail: 'Mon-Fri 9AM-6PM EST',
      action: 'tel:1-800-229-6275'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Chat with our team',
      detail: 'Average response: 2 minutes',
      action: '#chat'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: '123 Market Street',
      detail: 'San Francisco, CA 94103',
      action: '#location'
    }
  ];

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'account', label: 'Account Issues' },
    { value: 'payment', label: 'Payment & Billing' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'seller', label: 'Seller Support' },
    { value: 'feedback', label: 'Feedback & Suggestions' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-blue-100">
            We're here to help. Reach out to us through any of these channels.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                {!submitted ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="How can we help?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                ) : (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                      <strong>Thank you for contacting us!</strong><br />
                      We've received your message and will respond within 24 hours.
                      Check your email at {formData.email} for updates.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Methods */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Other Ways to Reach Us</h2>
            
            <div className="grid gap-4">
              {contactMethods.map((method, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => method.action.startsWith('#') ? null : window.location.href = method.action}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <method.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
                        <p className="text-sm text-gray-700 font-medium">{method.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{method.detail}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* FAQ Link */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Before You Contact Us</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Check out our Help Center for instant answers to common questions.
                </p>
                <Button variant="outline" onClick={() => navigate('/help')} className="w-full">
                  Visit Help Center
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Business Hours */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Business Hours</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Customer Support</p>
                <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                <p className="text-gray-600">Saturday - Sunday: 10:00 AM - 4:00 PM EST</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Technical Support</p>
                <p className="text-gray-600">24/7 via email and live chat</p>
                <p className="text-gray-600">Phone support during business hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;