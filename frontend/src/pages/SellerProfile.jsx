import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Star, MapPin, Calendar, Music, Settings, MessageSquare, ShoppingBag } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { mockProducts, mockUser } from '../mock';

const SellerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  
  // Mock seller profile customization
  const sellerProfile = {
    ...mockUser,
    id: id || 'seller1',
    coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200',
    backgroundColor: '#1a1a2e',
    primaryColor: '#16213e',
    secondaryColor: '#0f3460',
    accentColor: '#e94560',
    fontFamily: 'Arial',
    customCSS: '',
    bio: 'Welcome to my store! I sell quality products with amazing customer service. Check out my collection!',
    location: 'San Francisco, CA',
    backgroundMusic: {
      enabled: true,
      title: 'Chill Vibes',
      url: '', // Would be actual music URL
    },
    stats: {
      totalSales: 1243,
      itemsSold: 2456,
      responseTime: '< 1 hour',
      joinDate: '2020-01-15',
    },
    recentSales: [
      { id: '1', productName: 'iPhone 14 Pro', buyer: 'John D.', date: '2025-07-01', price: 1099.99 },
      { id: '2', productName: 'Sony Headphones', buyer: 'Sarah M.', date: '2025-07-02', price: 349.99 },
      { id: '3', productName: 'Nike Shoes', buyer: 'Mike R.', date: '2025-07-03', price: 129.99 },
    ],
    feedback: [
      { id: '1', buyer: 'John D.', rating: 5, comment: 'Amazing seller! Fast shipping and great product.', date: '2025-07-01', verified: true },
      { id: '2', buyer: 'Sarah M.', rating: 5, comment: 'Very responsive and helpful. Highly recommend!', date: '2025-07-02', verified: true },
      { id: '3', buyer: 'Mike R.', rating: 4, comment: 'Good product, quick delivery.', date: '2025-07-03', verified: true },
    ],
  };

  const sellerProducts = mockProducts.filter(p => p.seller.id === sellerProfile.id);
  const totalPages = Math.ceil(sellerProducts.length / productsPerPage);
  const displayedProducts = sellerProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

  useEffect(() => {
    // Play background music if enabled
    if (sellerProfile.backgroundMusic.enabled && sellerProfile.backgroundMusic.url) {
      // Music would be loaded here
      console.log('Background music would play:', sellerProfile.backgroundMusic.title);
    }
  }, []);

  const pageStyle = {
    backgroundColor: sellerProfile.backgroundColor,
    fontFamily: sellerProfile.fontFamily,
  };

  return (
    <div className="min-h-screen" style={pageStyle}>
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={sellerProfile.coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        {/* Music Player Indicator */}
        {sellerProfile.backgroundMusic.enabled && (
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-white">
            <Music className="w-4 h-4 animate-pulse" />
            <span className="text-sm">{sellerProfile.backgroundMusic.title}</span>
          </div>
        )}
        
        {/* Profile Actions */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/messages')}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Button>
          {sellerProfile.id === mockUser.id && (
            <Button variant="outline" className="bg-white" onClick={() => navigate('/settings/profile')}>
              <Settings className="w-4 h-4 mr-2" />
              Customize
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16 pb-12">
        {/* Profile Header */}
        <Card className="mb-6" style={{ borderColor: sellerProfile.accentColor }}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={sellerProfile.avatar}
                alt={sellerProfile.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{sellerProfile.name}</h1>
                  {sellerProfile.verified && (
                    <Badge className="bg-blue-600">Verified Seller</Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{sellerProfile.rating.toFixed(1)}</span>
                    <span>({sellerProfile.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{sellerProfile.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(sellerProfile.stats.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{sellerProfile.bio}</p>
                
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: sellerProfile.primaryColor }}>
                    <p className="text-2xl font-bold text-white">{sellerProfile.stats.totalSales}</p>
                    <p className="text-sm text-gray-300">Total Sales</p>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: sellerProfile.primaryColor }}>
                    <p className="text-2xl font-bold text-white">{sellerProfile.stats.itemsSold}</p>
                    <p className="text-sm text-gray-300">Items Sold</p>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: sellerProfile.primaryColor }}>
                    <p className="text-2xl font-bold text-white">{sellerProfile.stats.responseTime}</p>
                    <p className="text-sm text-gray-300">Response Time</p>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: sellerProfile.primaryColor }}>
                    <p className="text-2xl font-bold text-white">{sellerProducts.length}</p>
                    <p className="text-sm text-gray-300">Active Listings</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Products ({sellerProducts.length})</TabsTrigger>
            <TabsTrigger value="feedback">Feedback ({sellerProfile.feedback.length})</TabsTrigger>
            <TabsTrigger value="sales">Recent Sales</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardContent className="pt-6">
                {displayedProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No products available</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                      {displayedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <div className="flex items-center gap-2">
                          {[...Array(totalPages)].map((_, idx) => (
                            <Button
                              key={idx}
                              variant={currentPage === idx + 1 ? 'default' : 'outline'}
                              onClick={() => setCurrentPage(idx + 1)}
                              className="w-10 h-10"
                            >
                              {idx + 1}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {sellerProfile.feedback.map((fb) => (
                    <div key={fb.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{fb.buyer}</p>
                          {fb.verified && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < fb.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{fb.comment}</p>
                      <p className="text-sm text-gray-500">{new Date(fb.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Sales Tab */}
          <TabsContent value="sales">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {sellerProfile.recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{sale.productName}</p>
                        <p className="text-sm text-gray-600">Sold to {sale.buyer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${sale.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{new Date(sale.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SellerProfile;
