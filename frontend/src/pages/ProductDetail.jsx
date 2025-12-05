import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Star, Heart, Share2, MapPin, Truck, ShieldCheck, MessageSquare, Eye } from 'lucide-react';
import { mockProducts } from '../mock';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const product = mockProducts.find(p => p.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    toast({
      title: "Added to cart!",
      description: `${product.title} has been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    if (isAuthenticated) {
      toast({
        title: "Proceeding to checkout",
        description: "Redirecting to checkout page...",
      });
      setTimeout(() => navigate('/checkout'), 1000);
    } else {
      navigate('/auth', { state: { from: { pathname: '/checkout' } } });
    }
  };

  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : product.seller.rating;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={product.images[selectedImage]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${
                    selectedImage === idx ? 'border-blue-600' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{product.condition}</Badge>
              <Badge>{product.category}</Badge>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {product.views} views
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {product.watchers} watching
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
              )}
            </div>
            {product.originalPrice && (
              <Badge className="bg-red-500 hover:bg-red-600">
                Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </Badge>
            )}
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  +
                </Button>
              </div>
              <span className="text-sm text-gray-600">({product.stock} available)</span>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg" onClick={handleBuyNow}>
              Buy It Now
            </Button>
            <Button variant="outline" className="w-full" size="lg" onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" className="w-full">
                <Heart className="w-4 h-4 mr-2" />
                Add to Watchlist
              </Button>
              <Button variant="ghost" className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="text-center">
              <ShieldCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Secure Payment</p>
            </div>
            <div className="text-center">
              <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Fast Shipping</p>
            </div>
            <div className="text-center">
              <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Track Order</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="seller">Seller Info</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({product.reviews.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Product Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="seller" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{product.seller.name}</h3>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.seller.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{product.seller.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-600">({product.seller.totalReviews} reviews)</span>
                  </div>
                  <p className="text-sm text-gray-600">Member since {new Date(product.seller.memberSince).getFullYear()}</p>
                </div>
                <Button onClick={() => navigate(`/seller/${product.seller.id}`)}>View Profile</Button>
              </div>
              <Button className="w-full" variant="outline" onClick={() => navigate('/messages')}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Seller
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {product.reviews.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No reviews yet. Be the first to review!</p>
                ) : (
                  product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{review.userName}</p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-600">{new Date(review.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* More From this Seller */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">More From this Seller</h2>
          <Button variant="link" className="text-blue-600" onClick={() => navigate(`/seller/${product.seller.id}`)}>
            View More
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockProducts.filter(p => p.seller.id === product.seller.id && p.id !== product.id).slice(0, 8).map((p) => (
            <Card key={p.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/product/${p.id}`)}>
              <div className="aspect-square overflow-hidden">
                <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{p.title}</h3>
                <p className="text-xl font-bold text-gray-900">${p.price.toFixed(2)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Similar Products */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Similar Products</h2>
          <Button variant="link" className="text-blue-600" onClick={() => navigate(`/search?category=${product.category}`)}>
            View More
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 8).map((p) => (
            <Card key={p.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/product/${p.id}`)}>
              <div className="aspect-square overflow-hidden">
                <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{p.title}</h3>
                <p className="text-xl font-bold text-gray-900">${p.price.toFixed(2)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
