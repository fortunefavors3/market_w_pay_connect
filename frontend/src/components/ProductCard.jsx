import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onClick={() => navigate(`/product/${product.id}`)}
        />
        {product.originalPrice && (
          <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </Badge>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            // Add to watchlist logic
          }}
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>
      <CardContent className="p-4" onClick={() => navigate(`/product/${product.id}`)}>
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {product.views}
          </span>
          <Badge variant="outline">{product.condition}</Badge>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm">
            <p className="text-gray-900 font-medium">{product.seller.name}</p>
            <p className="text-gray-600">⭐ {product.seller.rating.toFixed(1)} ({product.seller.totalReviews})</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
