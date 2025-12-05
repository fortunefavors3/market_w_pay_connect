import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Package, ShoppingBag, MessageSquare, Heart, Settings, Plus, Edit, Trash2, Eye, User, CreditCard } from 'lucide-react';
import { mockOrders, mockMyListings, mockMessages } from '../mock';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeListings] = useState(mockMyListings.filter(l => l.status === 'active'));
  const [soldListings] = useState(mockMyListings.filter(l => l.status === 'sold'));

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: '/dashboard' } } });
    }
  }, [isAuthenticated, navigate]);

  const handleDeleteListing = (id) => {
    toast({
      title: "Listing deleted",
      description: "Your listing has been removed.",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img src={user?.avatar} alt={user?.name} className="w-20 h-20 rounded-full" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-600">Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">⭐ 5.0</Badge>
                <Badge variant="outline">0 reviews</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/personal-details')}>
              <User className="w-4 h-4 mr-2" />
              Personal Details
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/stripe-connect')}
              className={!user?.stripeConnected ? 'border-amber-500 text-amber-700' : ''}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Setup
              {!user?.stripeConnected && (
                <Badge className="ml-2 bg-amber-500 hover:bg-amber-600">Required</Badge>
              )}
            </Button>
            <Button variant="outline" onClick={() => navigate('/seller-page-editor')}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Seller Page
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Processor Alert */}
      {(!user?.paymentProcessors || !Object.values(user.paymentProcessors).some(p => p?.configured)) && (
        <Card className="mb-6 bg-amber-50 border-amber-500">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-1">Action Required: Set Up Payment Processor</h3>
                <p className="text-sm text-amber-800 mb-3">
                  You need to configure at least one payment processor before you can list items for sale. 
                  This allows buyers to complete purchases securely.
                </p>
                <Button 
                  onClick={() => navigate('/payment-processors')}
                  className="bg-amber-600 hover:bg-amber-700"
                  size="sm"
                >
                  Set Up Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">{activeListings.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Orders</p>
                <p className="text-2xl font-bold text-gray-900">{mockOrders.length}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Messages</p>
                <p className="text-2xl font-bold text-gray-900">{mockMessages.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Watching</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="listings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        </TabsList>

        {/* My Listings */}
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Listings</CardTitle>
                <Button onClick={() => navigate('/sell')}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Listing
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active">
                <TabsList>
                  <TabsTrigger value="active">Active ({activeListings.length})</TabsTrigger>
                  <TabsTrigger value="sold">Sold ({soldListings.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="active" className="space-y-4 mt-4">
                  {activeListings.map((listing) => (
                    <div key={listing.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <img src={listing.images[0]} alt={listing.title} className="w-24 h-24 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                        <p className="text-lg font-bold text-gray-900 mt-1">${listing.price.toFixed(2)}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {listing.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {listing.watchers} watching
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/product/${listing.id}`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/customize/${listing.id}`)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteListing(listing.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="sold" className="space-y-4 mt-4">
                  {soldListings.map((listing) => (
                    <div key={listing.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <img src={listing.images[0]} alt={listing.title} className="w-24 h-24 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                        <p className="text-lg font-bold text-gray-900 mt-1">${listing.price.toFixed(2)}</p>
                        <Badge className="mt-2 bg-green-500">Sold on {new Date(listing.soldDate).toLocaleDateString()}</Badge>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>My Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <img src={order.product.images[0]} alt={order.product.title} className="w-24 h-24 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{order.product.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">Order #{order.id} • {new Date(order.orderDate).toLocaleDateString()}</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">${order.totalPrice.toFixed(2)}</p>
                      <Badge className={`mt-2 ${
                        order.status === 'delivered' ? 'bg-green-500' :
                        order.status === 'in_transit' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <Button onClick={() => navigate(`/orders/${order.id}`)}>Track Order</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages */}
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockMessages.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate('/messages')}
                  >
                    <img src={conversation.sender.avatar} alt={conversation.sender.name} className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{conversation.sender.name}</h3>
                        {conversation.unread > 0 && (
                          <Badge className="bg-blue-600">{conversation.unread} new</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">{conversation.productTitle}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {conversation.messages[conversation.messages.length - 1].text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Watchlist */}
        <TabsContent value="watchlist">
          <Card>
            <CardHeader>
              <CardTitle>Watchlist</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600 py-8">Your watchlist is empty. Start adding items you're interested in!</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
