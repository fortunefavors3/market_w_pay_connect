import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Shield, Eye, Lock, Database, Mail, Users } from 'lucide-react';

const Privacy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Database,
      title: 'Information We Collect',
      content: [
        'Account information (name, email, phone number, address)',
        'Payment and billing information',
        'Profile information and preferences',
        'Transaction history and purchase data',
        'Device and browser information',
        'Cookies and tracking technologies',
        'Communications and support interactions'
      ]
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      content: [
        'Process transactions and deliver services',
        'Communicate about your account and orders',
        'Improve and personalize your experience',
        'Detect and prevent fraud and security issues',
        'Comply with legal obligations',
        'Send marketing communications (with your consent)',
        'Conduct research and analytics'
      ]
    },
    {
      icon: Users,
      title: 'Information Sharing',
      content: [
        'With other users (public profile information)',
        'With service providers and partners',
        'With payment processors for transactions',
        'With law enforcement when required by law',
        'In business transfers or acquisitions',
        'With your explicit consent',
        'We never sell your personal data to third parties'
      ]
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: [
        'Industry-standard encryption for data transmission',
        'Secure servers with regular security audits',
        'Two-factor authentication available',
        'Regular security training for our team',
        'Incident response procedures',
        'Data backup and recovery systems',
        'Compliance with GDPR, CCPA, and other regulations'
      ]
    },
    {
      icon: Shield,
      title: 'Your Rights',
      content: [
        'Access your personal data',
        'Correct inaccurate information',
        'Delete your account and data',
        'Export your data in portable format',
        'Opt-out of marketing communications',
        'Restrict or object to certain processing',
        'Lodge a complaint with authorities'
      ]
    },
    {
      icon: Mail,
      title: 'Contact & Updates',
      content: [
        'Email us at privacy@cheqmart.com',
        'Updates will be posted on this page',
        'Major changes will be communicated via email',
        'Continued use constitutes acceptance',
        'Last updated: December 2025',
        'Effective date: January 1, 2025'
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
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-blue-100">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-blue-200 mt-4">
            Last Updated: December 5, 2025 | Effective Date: January 1, 2025
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Welcome to CheqMart. This Privacy Policy explains how CheqMart, Inc. ("we," "us," or "our") 
                collects, uses, discloses, and protects your personal information when you use our marketplace 
                platform, website, and services (collectively, the "Services").
              </p>
              <p>
                By using CheqMart, you agree to the collection and use of information in accordance with this policy. 
                If you do not agree with our policies and practices, please do not use our Services.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                  </div>
                </div>
                <ul className="space-y-2 ml-16">
                  {section.content.map((item, idx) => (
                    <li key={idx} className="text-gray-700 flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cookies Policy */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                We use cookies and similar tracking technologies to track activity on our Services and hold certain information. 
                Cookies are files with small amount of data which may include an anonymous unique identifier.
              </p>
              <p className="font-semibold">Types of cookies we use:</p>
              <ul className="space-y-2 ml-6">
                <li><strong>Essential cookies:</strong> Required for the website to function</li>
                <li><strong>Analytics cookies:</strong> Help us understand how visitors use our site</li>
                <li><strong>Marketing cookies:</strong> Track your browsing to show relevant ads</li>
                <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p>
                You can instruct your browser to refuse all cookies or indicate when a cookie is being sent. 
                However, if you do not accept cookies, you may not be able to use some portions of our Services.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Our Services are not directed to individuals under the age of 18. We do not knowingly collect 
                personal information from children under 18. If you are a parent or guardian and believe your 
                child has provided us with personal information, please contact us immediately.
              </p>
              <p>
                If we discover that a child under 18 has provided us with personal information, we will delete 
                such information from our servers immediately.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* International Transfers */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Your information may be transferred to and maintained on computers located outside of your state, 
                province, country, or other governmental jurisdiction where data protection laws may differ.
              </p>
              <p>
                We take appropriate steps to ensure that your data is treated securely and in accordance with 
                this Privacy Policy. All transfers are protected by appropriate safeguards.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Data Retention</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined 
                in this Privacy Policy, unless a longer retention period is required by law.
              </p>
              <ul className="space-y-2 ml-6">
                <li><strong>Account data:</strong> Retained while your account is active</li>
                <li><strong>Transaction records:</strong> Retained for 7 years for legal compliance</li>
                <li><strong>Marketing data:</strong> Retained until you opt-out</li>
                <li><strong>Support communications:</strong> Retained for 3 years</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by:
              </p>
              <ul className="space-y-2 ml-6">
                <li>Posting the new Privacy Policy on this page</li>
                <li>Updating the "Last Updated" date at the top of this policy</li>
                <li>Sending you an email notification for material changes</li>
                <li>Displaying a prominent notice on our platform</li>
              </ul>
              <p>
                You are advised to review this Privacy Policy periodically for any changes. Changes to this 
                Privacy Policy are effective when they are posted on this page.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Us About Privacy</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                If you have questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> privacy@cheqmart.com</p>
                <p><strong>Phone:</strong> 1-800-BAYMARKET (229-6275)</p>
                <p><strong>Mail:</strong> CheqMart Privacy Team, 123 Market Street, San Francisco, CA 94103</p>
              </div>
              <Button onClick={() => navigate('/contact')} className="mt-4">
                Contact Privacy Team
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;