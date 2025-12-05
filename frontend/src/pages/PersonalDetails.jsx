import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Mail, Phone, MapPin, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const PersonalDetails = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: '/personal-details' } } });
    }
  }, [isAuthenticated, navigate]);
  const [isEditing, setIsEditing] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationType, setVerificationType] = useState(''); // 'email' or 'phone'
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [pendingChanges, setPendingChanges] = useState(null);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    firstName: user?.shippingAddress?.firstName || '',
    lastName: user?.shippingAddress?.lastName || '',
    address: user?.shippingAddress?.address || '',
    city: user?.shippingAddress?.city || '',
    state: user?.shippingAddress?.state || '',
    zipCode: user?.shippingAddress?.zipCode || '',
    country: user?.shippingAddress?.country || 'United States',
  });

  const handleEmailChange = () => {
    if (formData.email === user.email) {
      toast({
        title: "No changes",
        description: "Email address is the same.",
        variant: "destructive",
      });
      return;
    }

    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setVerificationType('phone');
    setPendingChanges({ email: formData.email });
    setShowVerification(true);

    toast({
      title: "Verification code sent!",
      description: `Code sent to ${user.phone}. (Mock: ${code})`,
      duration: 10000,
    });
  };

  const handlePhoneChange = () => {
    if (formData.phone === user.phone) {
      toast({
        title: "No changes",
        description: "Phone number is the same.",
        variant: "destructive",
      });
      return;
    }

    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setVerificationType('email');
    setPendingChanges({ phone: formData.phone });
    setShowVerification(true);

    toast({
      title: "Verification code sent!",
      description: `Code sent to ${user.email}. (Mock: ${code})`,
      duration: 10000,
    });
  };

  const handleVerifyCode = () => {
    if (verificationCode !== generatedCode) {
      toast({
        title: "Invalid code",
        description: "Please enter the correct verification code.",
        variant: "destructive",
      });
      return;
    }

    // Apply changes
    updateUser(pendingChanges);
    
    toast({
      title: "Updated successfully!",
      description: `Your ${verificationType === 'email' ? 'phone number' : 'email'} has been updated.`,
    });

    setShowVerification(false);
    setVerificationCode('');
    setPendingChanges(null);
  };

  const handleShippingUpdate = () => {
    const shippingAddress = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: formData.country,
    };

    updateUser({ shippingAddress });

    toast({
      title: "Shipping address updated!",
      description: "Your shipping details have been saved.",
    });

    setIsEditing(false);
  };

  if (showVerification) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-center">Verify Your Identity</CardTitle>
            <CardDescription className="text-center">
              Enter the 6-digit code sent to your {verificationType === 'phone' ? 'phone' : 'email'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                maxLength="6"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Mock Code: {generatedCode}
              </p>
            </div>
            <Button onClick={handleVerifyCode} className="w-full bg-blue-600 hover:bg-blue-700">
              Verify & Update
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setShowVerification(false);
                setVerificationCode('');
                setPendingChanges(null);
              }}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Personal Details</h1>

      {/* Account Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Manage your email and phone number</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="email">Email Address</Label>
              <Mail className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Button onClick={handleEmailChange}>Update</Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Changing your email requires SMS verification
            </p>
          </div>

          <Separator />

          {/* Phone */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Phone className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex gap-2">
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Button onClick={handlePhoneChange}>Update</Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Changing your phone requires email verification
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Shipping Address</CardTitle>
              <CardDescription>Update your default shipping address</CardDescription>
            </div>
            <MapPin className="w-5 h-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditing ? (
            <>
              {user?.shippingAddress ? (
                <div className="space-y-2 text-gray-700">
                  <p className="font-medium">
                    {user.shippingAddress.firstName} {user.shippingAddress.lastName}
                  </p>
                  <p>{user.shippingAddress.address}</p>
                  <p>
                    {user.shippingAddress.city}, {user.shippingAddress.state} {user.shippingAddress.zipCode}
                  </p>
                  <p>{user.shippingAddress.country}</p>
                </div>
              ) : (
                <p className="text-gray-500">No shipping address saved</p>
              )}
              <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full">
                Edit Address
              </Button>
            </>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleShippingUpdate} className="flex-1">
                  Save Address
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      ...formData,
                      firstName: user?.shippingAddress?.firstName || '',
                      lastName: user?.shippingAddress?.lastName || '',
                      address: user?.shippingAddress?.address || '',
                      city: user?.shippingAddress?.city || '',
                      state: user?.shippingAddress?.state || '',
                      zipCode: user?.shippingAddress?.zipCode || '',
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalDetails;
