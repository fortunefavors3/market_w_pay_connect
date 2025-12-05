import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { ArrowLeft, Eye, Save, Palette, Type, Music, Image as ImageIcon, Layout, Code } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { googleFonts } from '../mock';
import { toast } from '../hooks/use-toast';

const SellerPageEditor = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [pageData, setPageData] = useState({
    // Layout & Design
    layoutStyle: 'classic', // classic, modern, split, grid
    backgroundColor: '#1a1a2e',
    primaryColor: '#16213e',
    secondaryColor: '#0f3460',
    accentColor: '#e94560',
    textColor: '#ffffff',
    
    // Background
    backgroundType: 'color', // color, gradient, image, pattern
    backgroundImage: '',
    gradientStart: '#667eea',
    gradientEnd: '#764ba2',
    gradientDirection: '135deg',
    
    // Typography
    fontFamily: 'Arial',
    headingFont: 'Georgia',
    fontSize: '16px',
    
    // Profile
    coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200',
    bio: 'Welcome to my store! I sell quality products with amazing customer service.',
    tagline: 'Your trusted seller since 2020',
    location: 'San Francisco, CA',
    
    // Music
    musicEnabled: false,
    musicTitle: 'My Store Theme',
    musicUrl: '',
    autoPlay: false,
    
    // Sections
    sections: {
      aboutMe: { enabled: true, title: 'About Me', content: 'Tell your story here...' },
      featuredProducts: { enabled: true, title: 'Featured Products', limit: 6 },
      reviews: { enabled: true, title: 'Customer Reviews' },
      recentSales: { enabled: true, title: 'Recent Sales' },
      stats: { enabled: true, title: 'Store Stats' },
    },
    
    // Custom CSS
    customCSS: '',
    
    // Social Links
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
    },
    
    // Advanced
    animationsEnabled: true,
    published: false,
  });

  const layoutOptions = [
    { id: 'classic', name: 'Classic MySpace', description: 'Traditional top-down layout' },
    { id: 'modern', name: 'Modern Grid', description: 'Clean grid-based design' },
    { id: 'split', name: 'Split Screen', description: 'Left sidebar with main content' },
    { id: 'magazine', name: 'Magazine Style', description: 'Bold, magazine-inspired layout' },
  ];

  const backgroundPatterns = [
    { id: 'none', name: 'None' },
    { id: 'dots', name: 'Dots', value: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)' },
    { id: 'lines', name: 'Lines', value: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)' },
    { id: 'grid', name: 'Grid', value: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)' },
  ];

  const handleSave = () => {
    updateUser({
      sellerPage: { ...pageData, lastUpdated: new Date().toISOString() },
    });
    
    toast({
      title: "Saved!",
      description: "Your seller page has been saved as a draft.",
    });
  };

  const handlePublish = () => {
    const publishedData = { ...pageData, published: true };
    setPageData(publishedData);
    updateUser({
      sellerPage: { ...publishedData, publishedAt: new Date().toISOString() },
    });
    
    toast({
      title: "Published!",
      description: "Your seller page is now live.",
    });
  };

  const handlePreview = () => {
    const previewData = encodeURIComponent(JSON.stringify(pageData));
    window.open(`/seller-page-preview?data=${previewData}`, '_blank');
  };

  const getBackgroundStyle = () => {
    if (pageData.backgroundType === 'color') {
      return { backgroundColor: pageData.backgroundColor };
    } else if (pageData.backgroundType === 'gradient') {
      return {
        background: `linear-gradient(${pageData.gradientDirection}, ${pageData.gradientStart}, ${pageData.gradientEnd})`,
      };
    } else if (pageData.backgroundType === 'image' && pageData.backgroundImage) {
      return {
        backgroundImage: `url(${pageData.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return {};
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Seller Page Editor</h1>
              <p className="text-sm text-gray-600">Customize your seller profile</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700">
              Publish
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Editor Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="design">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="design">
                  <Palette className="w-4 h-4 mr-2" />
                  Design
                </TabsTrigger>
                <TabsTrigger value="content">
                  <Type className="w-4 h-4 mr-2" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="layout">
                  <Layout className="w-4 h-4 mr-2" />
                  Layout
                </TabsTrigger>
                <TabsTrigger value="media">
                  <Music className="w-4 h-4 mr-2" />
                  Media
                </TabsTrigger>
                <TabsTrigger value="advanced">
                  <Code className="w-4 h-4 mr-2" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              {/* Design Tab */}
              <TabsContent value="design" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Colors & Background</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Background Type</Label>
                      <Select value={pageData.backgroundType} onValueChange={(value) => setPageData({ ...pageData, backgroundType: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="color">Solid Color</SelectItem>
                          <SelectItem value="gradient">Gradient</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="pattern">Pattern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {pageData.backgroundType === 'color' && (
                      <div>
                        <Label>Background Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={pageData.backgroundColor}
                            onChange={(e) => setPageData({ ...pageData, backgroundColor: e.target.value })}
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={pageData.backgroundColor}
                            onChange={(e) => setPageData({ ...pageData, backgroundColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    )}

                    {pageData.backgroundType === 'gradient' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Start Color</Label>
                            <Input
                              type="color"
                              value={pageData.gradientStart}
                              onChange={(e) => setPageData({ ...pageData, gradientStart: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>End Color</Label>
                            <Input
                              type="color"
                              value={pageData.gradientEnd}
                              onChange={(e) => setPageData({ ...pageData, gradientEnd: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Direction (degrees)</Label>
                          <Input
                            type="number"
                            value={pageData.gradientDirection.replace('deg', '')}
                            onChange={(e) => setPageData({ ...pageData, gradientDirection: `${e.target.value}deg` })}
                          />
                        </div>
                      </>
                    )}

                    {pageData.backgroundType === 'image' && (
                      <div>
                        <Label>Background Image URL</Label>
                        <Input
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          value={pageData.backgroundImage}
                          onChange={(e) => setPageData({ ...pageData, backgroundImage: e.target.value })}
                        />
                      </div>
                    )}

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Primary Color</Label>
                        <Input
                          type="color"
                          value={pageData.primaryColor}
                          onChange={(e) => setPageData({ ...pageData, primaryColor: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Secondary Color</Label>
                        <Input
                          type="color"
                          value={pageData.secondaryColor}
                          onChange={(e) => setPageData({ ...pageData, secondaryColor: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Accent Color</Label>
                        <Input
                          type="color"
                          value={pageData.accentColor}
                          onChange={(e) => setPageData({ ...pageData, accentColor: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Text Color</Label>
                        <Input
                          type="color"
                          value={pageData.textColor}
                          onChange={(e) => setPageData({ ...pageData, textColor: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Typography</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Body Font</Label>
                      <Select value={pageData.fontFamily} onValueChange={(value) => setPageData({ ...pageData, fontFamily: value })}>
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
                    <div>
                      <Label>Heading Font</Label>
                      <Select value={pageData.headingFont} onValueChange={(value) => setPageData({ ...pageData, headingFont: value })}>
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
                    <div>
                      <Label>Font Size</Label>
                      <Select value={pageData.fontSize} onValueChange={(value) => setPageData({ ...pageData, fontSize: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="14px">Small</SelectItem>
                          <SelectItem value="16px">Medium</SelectItem>
                          <SelectItem value="18px">Large</SelectItem>
                          <SelectItem value="20px">X-Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Cover Image URL</Label>
                      <Input
                        type="url"
                        placeholder="https://example.com/cover.jpg"
                        value={pageData.coverImage}
                        onChange={(e) => setPageData({ ...pageData, coverImage: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Tagline</Label>
                      <Input
                        placeholder="Your store tagline"
                        value={pageData.tagline}
                        onChange={(e) => setPageData({ ...pageData, tagline: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Bio</Label>
                      <Textarea
                        rows={4}
                        placeholder="Tell visitors about your store..."
                        value={pageData.bio}
                        onChange={(e) => setPageData({ ...pageData, bio: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        placeholder="City, State/Country"
                        value={pageData.location}
                        onChange={(e) => setPageData({ ...pageData, location: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Page Sections</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(pageData.sections).map(([key, section]) => (
                      <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{section.title}</p>
                          {section.content && (
                            <Textarea
                              className="mt-2"
                              rows={3}
                              value={section.content}
                              onChange={(e) =>
                                setPageData({
                                  ...pageData,
                                  sections: {
                                    ...pageData.sections,
                                    [key]: { ...section, content: e.target.value },
                                  },
                                })
                              }
                            />
                          )}
                        </div>
                        <Switch
                          checked={section.enabled}
                          onCheckedChange={(checked) =>
                            setPageData({
                              ...pageData,
                              sections: {
                                ...pageData.sections,
                                [key]: { ...section, enabled: checked },
                              },
                            })
                          }
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Social Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(pageData.socialLinks).map(([platform, url]) => (
                      <div key={platform}>
                        <Label className="capitalize">{platform}</Label>
                        <Input
                          type="url"
                          placeholder={`https://${platform}.com/yourprofile`}
                          value={url}
                          onChange={(e) =>
                            setPageData({
                              ...pageData,
                              socialLinks: { ...pageData.socialLinks, [platform]: e.target.value },
                            })
                          }
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Layout Tab */}
              <TabsContent value="layout" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Page Layout</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {layoutOptions.map((layout) => (
                        <div
                          key={layout.id}
                          onClick={() => setPageData({ ...pageData, layoutStyle: layout.id })}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            pageData.layoutStyle === layout.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <h4 className="font-semibold mb-1">{layout.name}</h4>
                          <p className="text-sm text-gray-600">{layout.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Background Music</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable Music Player</Label>
                      <Switch
                        checked={pageData.musicEnabled}
                        onCheckedChange={(checked) => setPageData({ ...pageData, musicEnabled: checked })}
                      />
                    </div>
                    {pageData.musicEnabled && (
                      <>
                        <div>
                          <Label>Music Title</Label>
                          <Input
                            placeholder="My Store Theme"
                            value={pageData.musicTitle}
                            onChange={(e) => setPageData({ ...pageData, musicTitle: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Music URL (MP3)</Label>
                          <Input
                            type="url"
                            placeholder="https://example.com/music.mp3"
                            value={pageData.musicUrl}
                            onChange={(e) => setPageData({ ...pageData, musicUrl: e.target.value })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Auto-play on Visit</Label>
                          <Switch
                            checked={pageData.autoPlay}
                            onCheckedChange={(checked) => setPageData({ ...pageData, autoPlay: checked })}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Custom CSS</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      rows={10}
                      placeholder="/* Add your custom CSS here */
.my-class {
  color: red;
}"
                      value={pageData.customCSS}
                      onChange={(e) => setPageData({ ...pageData, customCSS: e.target.value })}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Advanced: Add custom CSS to further customize your page
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Animations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Animations</Label>
                        <p className="text-sm text-gray-600">Add smooth transitions and effects</p>
                      </div>
                      <Switch
                        checked={pageData.animationsEnabled}
                        onCheckedChange={(checked) => setPageData({ ...pageData, animationsEnabled: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="aspect-[9/16] rounded-lg overflow-hidden border-2 border-gray-200"
                  style={{
                    ...getBackgroundStyle(),
                    fontFamily: pageData.fontFamily,
                    fontSize: '8px',
                    color: pageData.textColor,
                  }}
                >
                  <div className="h-1/4 relative">
                    {pageData.coverImage && (
                      <img src={pageData.coverImage} alt="Cover" className="w-full h-full object-cover opacity-70" />
                    )}
                    {pageData.musicEnabled && (
                      <div className="absolute top-1 right-1 bg-black/50 rounded px-1 py-0.5 text-white text-xs flex items-center gap-1">
                        <Music className="w-2 h-2" />
                        <span>{pageData.musicTitle}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 space-y-1">
                    <h3 className="font-bold" style={{ fontFamily: pageData.headingFont }}>
                      {user?.name}
                    </h3>
                    <p className="text-xs opacity-80">{pageData.tagline}</p>
                    <p className="text-xs opacity-60">{pageData.bio.substring(0, 50)}...</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Scaled preview - click Preview for full view
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerPageEditor;
