import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical, Plus, Trash2, Eye, Save, Image, Type, Images, List, Star, Video, MousePointer } from 'lucide-react';
import { pageElements, defaultPageLayout } from '../mock';
import { toast } from '../hooks/use-toast';

const ElementIcon = ({ type }) => {
  const icons = {
    hero: Image,
    text: Type,
    images: Images,
    features: List,
    reviews: Star,
    video: Video,
    cta: MousePointer,
  };
  const Icon = icons[type] || Image;
  return <Icon className="w-5 h-5" />;
};

const ElementEditor = ({ element, onChange }) => {
  const updateContent = (field, value) => {
    onChange({
      ...element,
      content: { ...element.content, [field]: value },
    });
  };

  const updateStyle = (field, value) => {
    onChange({
      ...element,
      style: { ...element.style, [field]: value },
    });
  };

  return (
    <div className="space-y-4">
      {/* Content Fields */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-gray-900">Content</h4>
        {element.type === 'hero' && (
          <>
            <div>
              <Label>Title</Label>
              <Input
                value={element.content.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input
                value={element.content.subtitle || ''}
                onChange={(e) => updateContent('subtitle', e.target.value)}
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={element.content.image || ''}
                onChange={(e) => updateContent('image', e.target.value)}
              />
            </div>
          </>
        )}
        {element.type === 'text' && (
          <>
            <div>
              <Label>Title</Label>
              <Input
                value={element.content.title || ''}
                onChange={(e) => updateContent('title', e.target.value)}
              />
            </div>
            <div>
              <Label>Text</Label>
              <Textarea
                rows={4}
                value={element.content.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
              />
            </div>
          </>
        )}
        {element.type === 'cta' && (
          <>
            <div>
              <Label>Button Text</Label>
              <Input
                value={element.content.buttonText || 'Buy Now'}
                onChange={(e) => updateContent('buttonText', e.target.value)}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={element.content.description || ''}
                onChange={(e) => updateContent('description', e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      {/* Style Fields */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-sm text-gray-900">Styling</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Background Color</Label>
            <Input
              type="color"
              value={element.style.backgroundColor || '#ffffff'}
              onChange={(e) => updateStyle('backgroundColor', e.target.value)}
            />
          </div>
          <div>
            <Label>Text Color</Label>
            <Input
              type="color"
              value={element.style.textColor || '#000000'}
              onChange={(e) => updateStyle('textColor', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Font Size</Label>
            <Select value={element.style.fontSize || '16px'} onValueChange={(value) => updateStyle('fontSize', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12px">Small</SelectItem>
                <SelectItem value="16px">Medium</SelectItem>
                <SelectItem value="20px">Large</SelectItem>
                <SelectItem value="32px">X-Large</SelectItem>
                <SelectItem value="48px">XX-Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Font Family</Label>
            <Select value={element.style.fontFamily || 'Arial'} onValueChange={(value) => updateStyle('fontFamily', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="'Times New Roman'">Times New Roman</SelectItem>
                <SelectItem value="'Courier New'">Courier New</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCustomizer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [layout, setLayout] = useState(defaultPageLayout);
  const [selectedElement, setSelectedElement] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(layout);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLayout(items);
  };

  const addElement = (type) => {
    const newElement = {
      id: `element${layout.length + 1}`,
      type,
      content: {},
      style: {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        fontSize: '16px',
        fontFamily: 'Arial',
      },
    };
    setLayout([...layout, newElement]);
  };

  const deleteElement = (id) => {
    setLayout(layout.filter(el => el.id !== id));
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
  };

  const updateElement = (updatedElement) => {
    setLayout(layout.map(el => el.id === updatedElement.id ? updatedElement : el));
    setSelectedElement(updatedElement);
  };

  const handleSave = () => {
    toast({
      title: "Success!",
      description: "Your custom product page has been saved.",
    });
  };

  const renderElement = (element) => {
    const style = {
      backgroundColor: element.style.backgroundColor,
      color: element.style.textColor,
      fontFamily: element.style.fontFamily,
      fontSize: element.style.fontSize,
    };

    switch (element.type) {
      case 'hero':
        return (
          <div style={style} className="p-8 md:p-16 text-center">
            {element.content.image && (
              <img src={element.content.image} alt="Hero" className="w-full max-w-2xl mx-auto rounded-lg mb-6" />
            )}
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{element.content.title || 'Hero Title'}</h1>
            <p className="text-lg opacity-80">{element.content.subtitle || 'Hero subtitle'}</p>
          </div>
        );
      case 'text':
        return (
          <div style={style} className="p-8">
            <h2 className="text-2xl font-bold mb-4">{element.content.title || 'Text Block Title'}</h2>
            <p className="leading-relaxed">{element.content.text || 'Add your text content here...'}</p>
          </div>
        );
      case 'cta':
        return (
          <div style={style} className="p-8 text-center">
            <p className="text-lg mb-4">{element.content.description || 'Special offer!'}</p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              {element.content.buttonText || 'Buy Now'}
            </Button>
          </div>
        );
      default:
        return (
          <div style={style} className="p-8">
            <p className="text-gray-600">Configure this {element.type} element</p>
          </div>
        );
    }
  };

  if (previewMode) {
    return (
      <div>
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Preview Mode</h2>
            <Button onClick={() => setPreviewMode(false)}>Exit Preview</Button>
          </div>
        </div>
        <div className="max-w-5xl mx-auto">
          {layout.map((element) => (
            <div key={element.id}>
              {renderElement(element)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Product Page Customizer</h1>
          <p className="text-sm text-gray-600">Design your custom product page</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>Close</Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Elements & Properties */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          <Tabs defaultValue="elements" className="h-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="elements">Elements</TabsTrigger>
              <TabsTrigger value="properties" disabled={!selectedElement}>Properties</TabsTrigger>
            </TabsList>
            <TabsContent value="elements" className="p-4 space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-3">Drag elements to your page:</p>
              {pageElements.map((element) => (
                <Button
                  key={element.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => addElement(element.type)}
                >
                  <ElementIcon type={element.type} />
                  <span className="ml-2">{element.label}</span>
                  <Plus className="w-4 h-4 ml-auto" />
                </Button>
              ))}
            </TabsContent>
            <TabsContent value="properties" className="p-4">
              {selectedElement ? (
                <ElementEditor element={selectedElement} onChange={updateElement} />
              ) : (
                <p className="text-sm text-gray-600">Select an element to edit its properties</p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="page-builder">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {layout.length === 0 ? (
                      <div className="p-16 text-center text-gray-500">
                        <p className="text-lg mb-2">Your page is empty</p>
                        <p className="text-sm">Add elements from the left sidebar to get started</p>
                      </div>
                    ) : (
                      layout.map((element, index) => (
                        <Draggable key={element.id} draggableId={element.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`relative group border-2 ${
                                selectedElement?.id === element.id
                                  ? 'border-blue-500'
                                  : 'border-transparent hover:border-gray-300'
                              } ${snapshot.isDragging ? 'opacity-50' : ''}`}
                              onClick={() => setSelectedElement(element)}
                            >
                              <div className="absolute top-2 left-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div
                                  {...provided.dragHandleProps}
                                  className="bg-white rounded p-1 shadow cursor-move"
                                >
                                  <GripVertical className="w-4 h-4 text-gray-600" />
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteElement(element.id);
                                  }}
                                  className="bg-white rounded p-1 shadow hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                              {renderElement(element)}
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCustomizer;
