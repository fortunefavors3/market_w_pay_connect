import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Upload, X, Plus, Palette, Type } from 'lucide-react';
import { mockCategories, pageTemplates, googleFonts } from '../mock';
import { toast } from '../hooks/use-toast';

const EnhancedSellItem = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    condition: '',
    stock: '1',
    images: [],
    videos: [],
    
    // Variants
    hasVariants: false,
    variants: [],
    
    // Offers
    acceptOffers: false,
    minimumOffer: '',
    autoAcceptOffer: false,
    autoAcceptPrice: '',
    
    // Page Customization
    selectedTemplate: pageTemplates[0].id,
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    fontFamily: 'Poppins',
    fontSize: '16px',
    fontWeight: 'normal',
    customLayout: null,
  });

  const [previewMedia, setPreviewMedia] = useState([]);
  const [newVariant, setNewVariant] = useState({ name: '', values: '' });

  const handleMediaUpload = (e, type) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map(file => ({
      url: URL.createObjectURL(file),
      file,
      type,
    }));
    const totalMedia = previewMedia.length + newMedia.length;
    
    if (totalMedia > 12) {
      toast({
        title: "Limit exceeded",
        description: "You can upload maximum 12 images/videos",
        variant: "destructive",
      });
      return;
    }
    
    setPreviewMedia([...previewMedia, ...newMedia]);
    setFormData({ 
      ...formData, 
      [type === 'image' ? 'images' : 'videos']: [...formData[type === 'image' ? 'images' : 'videos'], ...files] 
    });
  };

  const removeMedia = (index) => {
    const newPreviewMedia = previewMedia.filter((_, i) => i !== index);
    setPreviewMedia(newPreviewMedia);
  };

  const addVariant = () => {
    if (newVariant.name && newVariant.values) {
      const values = newVariant.values.split(',').map(v => v.trim());
      setFormData({
        ...formData,
        variants: [...formData.variants, { ...newVariant, values }],
      });
      setNewVariant({ name: '', values: '' });
    }
  };

  const removeVariant = (index) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Success!",
      description: "Your item has been listed for sale with custom page design.",
    });
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  const selectedCategory = mockCategories.find(c => c.name === formData.category);
  const selectedTemplate = pageTemplates.find(t => t.id === formData.selectedTemplate);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Listing</h1>
        <p className="text-gray-600">Customize everything about your product page</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {['Basic Info', 'Media & Variants', 'Pricing & Offers', 'Page Design'].map((label, index) => (
          <React.Fragment key={label}>
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep > index + 1
                    ? 'bg-green-600 text-white'
                    : currentStep === index + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {currentStep > index + 1 ? '✓' : index + 1}
              </div>
              <span className={`ml-2 font-medium hidden md:inline ${currentStep >= index + 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {index < 3 && <div className="w-12 md:w-16 h-0.5 bg-gray-300 mx-2" />}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="What are you selling?"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your item in detail"
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: '' })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategory">Subcategory *</Label>
                  <Select value={formData.subcategory} onValueChange={(value) => setFormData({ ...formData, subcategory: value })} disabled={!formData.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory?.subcategories.map((sub, idx) => (
                        <SelectItem key={idx} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="condition">Condition *</Label>
                <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Like New">Like New</SelectItem>
                    <SelectItem value="Used">Used - Excellent</SelectItem>
                    <SelectItem value="Used - Good">Used - Good</SelectItem>
                    <SelectItem value="Used - Fair">Used - Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button type="button" onClick={() => setCurrentStep(2)}>Next Step</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Media & Variants */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Media & Product Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Media Upload */}
              <div>
                <Label>Photos & Videos ({previewMedia.length}/12)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-2">
                  {previewMedia.map((media, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                      {media.type === 'image' ? (
                        <img src={media.url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <video src={media.url} className="w-full h-full object-cover" />
                      )}
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeMedia(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {media.type === 'video' && (
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          Video
                        </div>
                      )}
                    </div>
                  ))}
                  {previewMedia.length < 12 && (
                    <>
                      <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-600">Image</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleMediaUpload(e, 'image')} />
                      </label>
                      <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-600">Video</span>
                        <input type="file" multiple accept="video/*" className="hidden" onChange={(e) => handleMediaUpload(e, 'video')} />
                      </label>
                    </>
                  )}
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasVariants"
                    checked={formData.hasVariants}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasVariants: checked })}
                  />
                  <Label htmlFor="hasVariants" className="cursor-pointer">
                    This product has variants (e.g., sizes, colors)
                  </Label>
                </div>

                {formData.hasVariants && (
                  <div className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <Label>Variant Name (e.g., Size)</Label>
                        <Input
                          placeholder="e.g., Size, Color"
                          value={newVariant.name}
                          onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Values (comma-separated)</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g., Small, Medium, Large"
                            value={newVariant.values}
                            onChange={(e) => setNewVariant({ ...newVariant, values: e.target.value })}
                          />
                          <Button type="button" onClick={addVariant} size="icon">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {formData.variants.length > 0 && (
                      <div className="space-y-2">
                        {formData.variants.map((variant, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{variant.name}</p>
                              <p className="text-xs text-gray-600">{variant.values.join(', ')}</p>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(idx)}>
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                <Button type="button" onClick={() => setCurrentStep(3)}>Next Step</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Pricing & Offers */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Offer Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Buy It Now Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Quantity Available *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="1"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptOffers"
                    checked={formData.acceptOffers}
                    onCheckedChange={(checked) => setFormData({ ...formData, acceptOffers: checked })}
                  />
                  <Label htmlFor="acceptOffers" className="cursor-pointer font-semibold">
                    Accept Offers from Buyers
                  </Label>
                </div>

                {formData.acceptOffers && (
                  <div className="space-y-3 ml-6">
                    <div>
                      <Label htmlFor="minimumOffer">Minimum Offer Price</Label>
                      <Input
                        id="minimumOffer"
                        type="number"
                        step="0.01"
                        placeholder="Lowest offer you'll consider"
                        value={formData.minimumOffer}
                        onChange={(e) => setFormData({ ...formData, minimumOffer: e.target.value })}
                      />
                      <p className="text-xs text-gray-600 mt-1">Buyers won't be able to make offers below this amount</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autoAcceptOffer"
                        checked={formData.autoAcceptOffer}
                        onCheckedChange={(checked) => setFormData({ ...formData, autoAcceptOffer: checked })}
                      />
                      <Label htmlFor="autoAcceptOffer" className="cursor-pointer">
                        Auto-accept offers at or above a specific price
                      </Label>
                    </div>

                    {formData.autoAcceptOffer && (
                      <div className="ml-6">
                        <Label htmlFor="autoAcceptPrice">Auto-Accept Price</Label>
                        <Input
                          id="autoAcceptPrice"
                          type="number"
                          step="0.01"
                          placeholder="Automatically accept at this price"
                          value={formData.autoAcceptPrice}
                          onChange={(e) => setFormData({ ...formData, autoAcceptPrice: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
                <Button type="button" onClick={() => setCurrentStep(4)}>Next Step</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Page Design */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Customize Your Product Page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="template">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="template">Template</TabsTrigger>
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="typography">Typography</TabsTrigger>
                </TabsList>

                <TabsContent value="template" className="space-y-4">
                  <Label>Choose a Template Style</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {pageTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => setFormData({ ...formData, selectedTemplate: template.id })}
                        className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          formData.selectedTemplate === template.id
                            ? 'border-blue-600 shadow-lg'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img src={template.thumbnail} alt={template.name} className="w-full aspect-video object-cover" />
                        <div className="p-3 bg-white">
                          <p className="font-medium text-sm text-center">{template.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="colors" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>Primary Color</Label>
                      <div className="flex gap-3 mt-2">
                        <Input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="w-20 h-12"
                        />
                        <Input
                          type="text"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Secondary Color</Label>
                      <div className="flex gap-3 mt-2">
                        <Input
                          type="color"
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          className="w-20 h-12"
                        />
                        <Input
                          type="text"
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg" style={{ background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})` }}>
                    <p className="text-white font-semibold text-center">Color Preview</p>
                  </div>
                </TabsContent>

                <TabsContent value="typography" className="space-y-4">
                  <div>
                    <Label>Font Family</Label>
                    <Select value={formData.fontFamily} onValueChange={(value) => setFormData({ ...formData, fontFamily: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {googleFonts.map((font) => (
                          <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Font Size</Label>
                      <Select value={formData.fontSize} onValueChange={(value) => setFormData({ ...formData, fontSize: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12px">Small (12px)</SelectItem>
                          <SelectItem value="14px">Regular (14px)</SelectItem>
                          <SelectItem value="16px">Medium (16px)</SelectItem>
                          <SelectItem value="18px">Large (18px)</SelectItem>
                          <SelectItem value="20px">X-Large (20px)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Font Weight</Label>
                      <Select value={formData.fontWeight} onValueChange={(value) => setFormData({ ...formData, fontWeight: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="300">Light</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="600">Semi-Bold</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p style={{ fontFamily: formData.fontFamily, fontSize: formData.fontSize, fontWeight: formData.fontWeight }}>
                      The quick brown fox jumps over the lazy dog. This is how your text will look!
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>Back</Button>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      const previewData = encodeURIComponent(JSON.stringify(formData));
                      window.open(`/listing-preview?data=${previewData}`, '_blank');
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Listing
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">Publish Listing</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
};

export default EnhancedSellItem;
