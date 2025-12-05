import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, FileText, Scale, AlertCircle, Shield, DollarSign, Ban } from 'lucide-react';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-blue-100">
            Please read these terms carefully before using CheqMart.
          </p>
          <p className="text-sm text-blue-200 mt-4">
            Last Updated: December 5, 2025 | Effective Date: January 1, 2025
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Agreement */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Agreement to Terms</h2>
                <p className="text-gray-700">
                  By accessing or using CheqMart, you agree to be bound by these Terms of Service and all applicable 
                  laws and regulations. If you do not agree with any part of these terms, you may not use our Services.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Use of Services */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">Use of Services</h2>
            </div>
            <div className="space-y-4 text-gray-700 ml-16">
              <div>
                <h3 className="font-semibold mb-2">Eligibility</h3>
                <ul className="space-y-2">
                  <li>• You must be at least 18 years old to use CheqMart</li>
                  <li>• You must provide accurate and complete registration information</li>
                  <li>• You are responsible for maintaining the security of your account</li>
                  <li>• One person or legal entity may maintain only one account</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Account Responsibilities</h3>
                <ul className="space-y-2">
                  <li>• Keep your password secure and confidential</li>
                  <li>• Notify us immediately of unauthorized account access</li>
                  <li>• You are responsible for all activities under your account</li>
                  <li>• Do not share your account with others</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buying and Selling */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">Buying and Selling</h2>
            </div>
            <div className="space-y-4 text-gray-700 ml-16">
              <div>
                <h3 className="font-semibold mb-2">Seller Obligations</h3>
                <ul className="space-y-2">
                  <li>• List only items you own or have permission to sell</li>
                  <li>• Provide accurate descriptions and photos</li>
                  <li>• Honor all sales and ship items promptly</li>
                  <li>• Respond to buyer inquiries within 24 hours</li>
                  <li>• Comply with all applicable laws and regulations</li>
                  <li>• Pay all applicable fees and taxes</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Buyer Obligations</h3>
                <ul className="space-y-2">
                  <li>• Complete purchase transactions you initiate</li>
                  <li>• Pay for items promptly</li>
                  <li>• Communicate any issues through our platform</li>
                  <li>• Leave honest and accurate feedback</li>
                  <li>• Follow return and refund policies</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Platform Fees</h3>
                <ul className="space-y-2">
                  <li>• Sellers pay a 5.5% platform fee on completed sales</li>
                  <li>• Payment processor fees apply (varies by processor)</li>
                  <li>• Fees are non-refundable except as required by law</li>
                  <li>• We reserve the right to change fees with 30 days notice</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prohibited Activities */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Ban className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">Prohibited Activities</h2>
            </div>
            <div className="space-y-4 text-gray-700 ml-16">
              <p className="font-semibold">You may not:</p>
              <ul className="space-y-2">
                <li>• List prohibited items (weapons, drugs, counterfeit goods, etc.)</li>
                <li>• Engage in fraudulent or deceptive practices</li>
                <li>• Manipulate prices or engage in shill bidding</li>
                <li>• Harass, threaten, or abuse other users</li>
                <li>• Circumvent or manipulate our fee structure</li>
                <li>• Use bots, scrapers, or automated tools</li>
                <li>• Infringe intellectual property rights</li>
                <li>• Interfere with platform operation or security</li>
                <li>• Create multiple accounts to evade restrictions</li>
                <li>• Share login credentials or account access</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">Platform Content</h3>
                <p>
                  The CheqMart platform, including all content, features, and functionality, is owned by CheqMart, Inc. 
                  and is protected by copyright, trademark, and other intellectual property laws.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">User Content</h3>
                <p>
                  You retain ownership of content you post on CheqMart. However, by posting content, you grant us a 
                  worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your content 
                  in connection with operating and promoting the platform.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Reporting Infringement</h3>
                <p>
                  If you believe content on CheqMart infringes your intellectual property rights, please contact us at 
                  legal@cheqmart.com with detailed information about the alleged infringement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">Disclaimers and Limitations</h2>
            </div>
            <div className="space-y-4 text-gray-700 ml-16">
              <div>
                <h3 className="font-semibold mb-2">"As Is" Service</h3>
                <p>
                  CheqMart is provided "as is" and "as available" without warranties of any kind, either express or implied. 
                  We do not guarantee that the service will be uninterrupted, secure, or error-free.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Third-Party Transactions</h3>
                <p>
                  CheqMart is a marketplace platform. We are not a party to transactions between buyers and sellers. 
                  We do not guarantee the quality, safety, or legality of items listed, the accuracy of listings, 
                  or the ability of sellers to complete sales.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Limitation of Liability</h3>
                <p>
                  To the maximum extent permitted by law, CheqMart shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred 
                  directly or indirectly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dispute Resolution */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Scale className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">Dispute Resolution</h2>
            </div>
            <div className="space-y-4 text-gray-700 ml-16">
              <div>
                <h3 className="font-semibold mb-2">Informal Resolution</h3>
                <p>
                  Before filing a claim, you agree to contact us and attempt to resolve the dispute informally. 
                  Please contact support@cheqmart.com with details of your concern.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Arbitration</h3>
                <p>
                  Any dispute arising from these Terms shall be resolved through binding arbitration in accordance 
                  with the rules of the American Arbitration Association. You waive your right to a jury trial.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Class Action Waiver</h3>
                <p>
                  You agree to resolve disputes with us on an individual basis. You waive any right to participate 
                  in class action lawsuits or class-wide arbitration.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Governing Law</h3>
                <p>
                  These Terms shall be governed by the laws of the State of California, without regard to its 
                  conflict of law provisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Termination */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Termination</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">By You</h3>
                <p>
                  You may close your account at any time through your account settings. You remain responsible for 
                  any outstanding obligations or fees.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">By Us</h3>
                <p>
                  We may suspend or terminate your account at any time for violations of these Terms, suspicious 
                  activity, or at our sole discretion. We will provide notice when possible, but immediate termination 
                  may be necessary for security or legal reasons.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                We reserve the right to modify these Terms at any time. We will provide notice of material changes by:
              </p>
              <ul className="space-y-2 ml-6">
                <li>• Posting the updated Terms on this page</li>
                <li>• Updating the "Last Updated" date</li>
                <li>• Sending email notifications for significant changes</li>
                <li>• Displaying prominent notice on the platform</li>
              </ul>
              <p>
                Your continued use of CheqMart after changes become effective constitutes acceptance of the revised Terms.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Questions About Terms?</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> legal@cheqmart.com</p>
                <p><strong>Phone:</strong> 1-800-BAYMARKET (229-6275)</p>
                <p><strong>Mail:</strong> CheqMart Legal Team, 123 Market Street, San Francisco, CA 94103</p>
              </div>
              <Button onClick={() => navigate('/contact')} className="mt-4">
                Contact Legal Team
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;