import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { X, Star, Heart, Share2, ShoppingCart, MessageSquare } from 'lucide-react';
import { pageTemplates } from '../mock';

const ListingPreview = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [listingData, setListingData] = useState(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data));
        setListingData(parsed);
      } catch (error) {
        console.error('Error parsing listing data:', error);
      }
    }
  }, [searchParams]);

  if (!listingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading preview...</h2>
          <p className="text-gray-600">Please wait while we prepare your listing preview.</p>
        </div>
      </div>
    );
  }

  const selectedTemplate = pageTemplates.find(t => t.id === listingData.selectedTemplate) || pageTemplates[0];
  
  const pageStyle = {
    fontFamily: listingData.fontFamily,
    fontSize: listingData.fontSize,
    fontWeight: listingData.fontWeight,
  };

  const renderTemplateElement = (element, index) => {
    const elementStyle = {
      backgroundColor: element.style.backgroundColor,
      color: element.style.textColor,
      fontFamily: element.style.fontFamily || listingData.fontFamily,
      fontSize: element.style.fontSize || listingData.fontSize,
    };

    switch (element.type) {
      case 'hero':
        return (
          <div key={index} style={elementStyle} className="p-12 text-center">
            <h1 className="text-5xl font-bold mb-4">{listingData.title || element.content.title}</h1>
            <p className="text-xl opacity-80">{listingData.description?.substring(0, 100) || element.content.subtitle}</p>
          </div>
        );
      case 'text':
        return (
          <div key={index} style={elementStyle} className="p-8">
            <h2 className="text-3xl font-bold mb-4">{element.content.title}</h2>
            <p className="leading-relaxed">{listingData.description || element.content.text}</p>
          </div>
        );
      case 'images':
        return (
          <div key={index} style={elementStyle} className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, idx) => (
                <div key={idx} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Image {idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'features':
        return (
          <div key={index} style={elementStyle} className="p-8">
            <h2 className="text-2xl font-bold mb-6">Product Features</h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-current rounded-full"></span>
                <span>High Quality Materials</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-current rounded-full"></span>
                <span>Fast Shipping Available</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-current rounded-full"></span>
                <span>100% Satisfaction Guaranteed</span>
              </li>
            </ul>
          </div>
        );
      case 'cta':
        return (
          <div key={index} style={elementStyle} className="p-8 text-center">
            <p className="text-lg mb-4">{element.content.description}</p>
            <Button 
              size="lg" 
              style={{ 
                backgroundColor: listingData.primaryColor,
                color: '#ffffff'
              }}
            >
              {element.content.buttonText || 'Buy Now'}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={pageStyle} className="min-h-screen bg-gray-50">
      {/* Preview Header Bar */}
      <div className="bg-blue-600 text-white py-3 px-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-semibold">Preview Mode</span>
          <span className="text-sm text-blue-100">This is how your listing will appear to buyers</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white hover:bg-blue-700"
          onClick={() => window.close()}
        >
          <X className="w-4 h-4 mr-2" />
          Close Preview
        </Button>
      </div>

      {/* Product Listing Preview */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              <span className="text-gray-400 text-lg">Product Image Preview</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Array(4).fill(0).map((_, idx) => (
                <div key={idx} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">+{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <Badge className="mb-2">{listingData.condition || 'New'}</Badge>
              <Badge variant="outline" className="ml-2">{listingData.category || 'Category'}</Badge>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {listingData.title || 'Product Title'}
            </h1>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold" style={{ color: listingData.primaryColor }}>
                  ${listingData.price || '0.00'}
                </span>
              </div>
              {listingData.acceptOffers && (
                <Badge className="bg-green-500">Accepting Offers</Badge>
              )}
            </div>

            {/* Variants Preview */}
            {listingData.hasVariants && listingData.variants.length > 0 && (
              <div className="mb-6">
                {listingData.variants.map((variant, idx) => (
                  <div key={idx} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {variant.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variant.values.map((value, vIdx) => (
                        <Button 
                          key={vIdx} 
                          variant="outline" 
                          size="sm"
                          className="rounded-lg"
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <Button 
                className="w-full" 
                size="lg"
                style={{ backgroundColor: listingData.primaryColor }}
              >
                Buy It Now
              </Button>
              <Button variant="outline" className="w-full" size="lg">
                <ShoppingCart className="w-4 h-4 mr-2" />
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
          </div>
        </div>

        {/* Custom Template Layout */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {selectedTemplate.layout.map((element, index) => renderTemplateElement(element, index))}
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {listingData.description || 'Product description will appear here...'}
            </p>
          </CardContent>
        </Card>

        {/* Seller Info Preview */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Seller Information</h3>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">5.0 (100 reviews)</span>
                </div>
              </div>
              <Button>
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Seller
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Style Preview Info */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Style Customization Applied</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-700"><strong>Template:</strong> {selectedTemplate.name}</p>
                <p className="text-blue-700"><strong>Font:</strong> {listingData.fontFamily}</p>
                <p className="text-blue-700"><strong>Font Size:</strong> {listingData.fontSize}</p>
              </div>
              <div>
                <p className="text-blue-700 flex items-center gap-2">
                  <strong>Primary Color:</strong> 
                  <span 
                    className="w-6 h-6 rounded border border-gray-300" 
                    style={{ backgroundColor: listingData.primaryColor }}
                  ></span>
                  {listingData.primaryColor}
                </p>
                <p className="text-blue-700 flex items-center gap-2">
                  <strong>Secondary Color:</strong> 
                  <span 
                    className="w-6 h-6 rounded border border-gray-300" 
                    style={{ backgroundColor: listingData.secondaryColor }}
                  ></span>
                  {listingData.secondaryColor}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ListingPreview;
