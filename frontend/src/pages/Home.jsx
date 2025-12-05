import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, TrendingUp, Shield, Truck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { mockProducts, mockCategories } from '../mock';

const Home = () => {
  const navigate = useNavigate();
  const featuredProducts = mockProducts.slice(0, 6);
  
  // Create 60 featured products (repeating the mock data)
  const extendedFeaturedProducts = Array(10).fill(mockProducts).flat().slice(0, 60);
  
  // Most recent products (reverse order to simulate recent)
  const recentProducts = [...extendedFeaturedProducts].reverse().slice(0, 60);

  return (
    <div>
      {/* Features - Compact & Eye-catching */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center justify-center gap-3 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure Payments</h3>
                <p className="text-sm text-blue-100">Shop with confidence</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Fast Shipping</h3>
                <p className="text-sm text-blue-100">Quick delivery</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Custom Storefronts</h3>
                <p className="text-sm text-blue-100">Design your pages</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories - Compact & Eye-catching */}
      <div className="bg-white py-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Shop by Category</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {mockCategories.map((category) => (
              <div
                key={category.id}
                onClick={() => navigate(`/category/${category.name}`)}
                className="bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 rounded-full px-6 py-3 cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md border border-gray-200"
              >
                <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products - 60 items */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
          <Button variant="ghost" onClick={() => navigate('/search')}>
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {extendedFeaturedProducts.map((product, idx) => (
            <ProductCard key={`featured-${product.id}-${idx}`} product={product} />
          ))}
        </div>
      </div>

      {/* Most Recent Products - 60 items */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Most Recent Products</h2>
            <Button variant="ghost" onClick={() => navigate('/search')}>
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentProducts.map((product, idx) => (
              <ProductCard key={`recent-${product.id}-${idx}`} product={product} />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Selling?</h2>
          <p className="text-lg text-blue-100">
            Create custom product pages, reach millions of buyers, and grow your business today.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/sell')}>
            Get Started Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
