import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useWatchlist } from '../context/WatchlistContext';
import { useAuth } from '../context/AuthContext';
import { mockProducts } from '../mock';

const Watchlist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { watchlist, removeFromWatchlist, loading } = useWatchlist();

  // Get product details for items in watchlist
  const watchlistProducts = mockProducts.filter(product => 
    watchlist.includes(product.id)
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-red-600 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Watchlist</h1>
            <p className="text-gray-600">{watchlist.length} Saved Items</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {watchlistProducts.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your watchlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Save items you're interested in by clicking the heart icon on any product.
            </p>
            <Button onClick={() => navigate('/')} className="bg-indigo-600 hover:bg-indigo-700">
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Watchlist Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {watchlistProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all">
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => removeFromWatchlist(product.id, product.title)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                <h3 
                  className="font-semibold text-gray-900 line-clamp-2 mb-2 cursor-pointer hover:text-indigo-600"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {product.title}
                </h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>{product.condition}</span>
                  <span>⭐ {product.seller.rating.toFixed(1)}</span>
                </div>
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  View Product
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
