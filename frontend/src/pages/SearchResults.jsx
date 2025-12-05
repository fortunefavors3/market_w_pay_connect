import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { mockProducts, mockCategories } from '../mock';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    condition: [],
    categories: [],
    sortBy: 'most_relevant',
  });

  // Filter products based on search query and filters
  let filteredProducts = mockProducts.filter(product => {
    const matchesQuery = query === '' || product.title.toLowerCase().includes(query.toLowerCase());
    const matchesPrice = (!filters.minPrice || product.price >= parseFloat(filters.minPrice)) &&
                        (!filters.maxPrice || product.price <= parseFloat(filters.maxPrice));
    const matchesCondition = filters.condition.length === 0 || filters.condition.includes(product.condition);
    const matchesCategory = filters.categories.length === 0 || filters.categories.includes(product.category);
    return matchesQuery && matchesPrice && matchesCondition && matchesCategory;
  });

  // Sort products
  if (filters.sortBy === 'price_low') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'price_high') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === 'most_recent') {
    // Mock sorting by newest (would use createdAt date in real app)
    filteredProducts.reverse();
  } else if (filters.sortBy === 'most_popular') {
    filteredProducts.sort((a, b) => b.views - a.views);
  } else if (filters.sortBy === 'highest_rated') {
    filteredProducts.sort((a, b) => b.seller.rating - a.seller.rating);
  } else if (filters.sortBy === 'alphabetical') {
    filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
  }

  const handleConditionChange = (condition, checked) => {
    setFilters({
      ...filters,
      condition: checked
        ? [...filters.condition, condition]
        : filters.condition.filter(c => c !== condition),
    });
  };

  const handleCategoryChange = (category, checked) => {
    setFilters({
      ...filters,
      categories: checked
        ? [...filters.categories, category]
        : filters.categories.filter(c => c !== category),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {query ? `Search results for "${query}"` : 'All Products'}
          </h1>
          <p className="text-gray-600 mt-1">{filteredProducts.length} items found</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-4 space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Min</Label>
                      <Input
                        type="number"
                        placeholder="$0"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Max</Label>
                      <Input
                        type="number"
                        placeholder="Any"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Condition</h3>
                  <div className="space-y-2">
                    {['New', 'Used', 'Like New'].map((condition) => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={`condition-${condition}`}
                          checked={filters.condition.includes(condition)}
                          onCheckedChange={(checked) => handleConditionChange(condition, checked)}
                        />
                        <label
                          htmlFor={`condition-${condition}`}
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          {condition}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
                  <div className="space-y-2">
                    {mockCategories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={filters.categories.includes(category.name)}
                          onCheckedChange={(checked) => handleCategoryChange(category.name, checked)}
                        />
                        <label
                          htmlFor={`category-${category.id}`}
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setFilters({
                    minPrice: '',
                    maxPrice: '',
                    condition: [],
                    categories: [],
                    sortBy: 'relevance',
                  })}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Label>Sort by:</Label>
              <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Best Match</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newly Listed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 mb-4">No products found matching your criteria.</p>
              <Button
                variant="outline"
                onClick={() => setFilters({
                  minPrice: '',
                  maxPrice: '',
                  condition: [],
                  categories: [],
                  sortBy: 'relevance',
                })}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
