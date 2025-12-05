// Mock data for eBay marketplace

export const mockCategories = [
  { id: '1', name: 'Electronics', icon: 'Laptop', subcategories: ['Computers', 'Phones', 'Cameras', 'Audio'] },
  { id: '2', name: 'Fashion', icon: 'Shirt', subcategories: ['Men', 'Women', 'Kids', 'Accessories'] },
  { id: '3', name: 'Home & Garden', icon: 'Home', subcategories: ['Furniture', 'Kitchen', 'Decor', 'Garden'] },
  { id: '4', name: 'Sports', icon: 'Dumbbell', subcategories: ['Fitness', 'Outdoor', 'Team Sports', 'Cycling'] },
  { id: '5', name: 'Toys & Hobbies', icon: 'Gamepad2', subcategories: ['Action Figures', 'Board Games', 'Puzzles', 'RC Toys'] },
  { id: '6', name: 'Collectibles', icon: 'Star', subcategories: ['Coins', 'Stamps', 'Trading Cards', 'Antiques'] },
];

export const mockProducts = [
  {
    id: '1',
    title: 'iPhone 14 Pro Max 256GB - Deep Purple',
    price: 1099.99,
    originalPrice: 1299.99,
    condition: 'New',
    category: 'Electronics',
    subcategory: 'Phones',
    images: [
      'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800',
      'https://images.unsplash.com/photo-1678652197914-7d655b1a9f84?w=800',
    ],
    description: 'Brand new iPhone 14 Pro Max with 256GB storage. Factory sealed with warranty.',
    seller: {
      id: 'seller1',
      name: 'TechDeals Pro',
      rating: 4.8,
      totalReviews: 1243,
      memberSince: '2020-01-15',
    },
    stock: 15,
    views: 1234,
    watchers: 89,
    reviews: [
      { id: 'r1', userId: 'user1', userName: 'John D.', rating: 5, comment: 'Fast shipping, great product!', date: '2025-07-01' },
      { id: 'r2', userId: 'user2', userName: 'Sarah M.', rating: 5, comment: 'Exactly as described. Highly recommended!', date: '2025-07-03' },
    ],
  },
  {
    id: '2',
    title: 'Vintage Leather Jacket - Size M',
    price: 89.99,
    condition: 'Used',
    category: 'Fashion',
    subcategory: 'Men',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
    ],
    description: 'Authentic vintage leather jacket in excellent condition. Classic style.',
    seller: {
      id: 'seller2',
      name: 'VintageVibes',
      rating: 4.6,
      totalReviews: 567,
      memberSince: '2019-05-20',
    },
    stock: 1,
    views: 567,
    watchers: 23,
    reviews: [],
  },
  {
    id: '3',
    title: 'Sony WH-1000XM5 Wireless Headphones',
    price: 349.99,
    originalPrice: 399.99,
    condition: 'New',
    category: 'Electronics',
    subcategory: 'Audio',
    images: [
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800',
    ],
    description: 'Industry-leading noise canceling headphones with premium sound quality.',
    seller: {
      id: 'seller1',
      name: 'TechDeals Pro',
      rating: 4.8,
      totalReviews: 1243,
      memberSince: '2020-01-15',
    },
    stock: 8,
    views: 2341,
    watchers: 156,
    reviews: [],
  },
  {
    id: '4',
    title: 'Modern Office Chair - Ergonomic Design',
    price: 199.99,
    condition: 'New',
    category: 'Home & Garden',
    subcategory: 'Furniture',
    images: [
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800',
    ],
    description: 'Comfortable ergonomic office chair with lumbar support and adjustable height.',
    seller: {
      id: 'seller3',
      name: 'HomeComfort',
      rating: 4.9,
      totalReviews: 890,
      memberSince: '2021-03-10',
    },
    stock: 25,
    views: 892,
    watchers: 45,
    reviews: [],
  },
  {
    id: '5',
    title: 'Nike Air Max 270 - Black/White Size 10',
    price: 129.99,
    originalPrice: 159.99,
    condition: 'New',
    category: 'Fashion',
    subcategory: 'Men',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    ],
    description: 'Brand new Nike Air Max 270 sneakers. Authentic with box and tags.',
    seller: {
      id: 'seller4',
      name: 'SneakerHub',
      rating: 4.7,
      totalReviews: 2341,
      memberSince: '2018-08-22',
    },
    stock: 12,
    views: 3456,
    watchers: 234,
    reviews: [],
  },
  {
    id: '6',
    title: 'Professional DSLR Camera Kit - Canon EOS',
    price: 1299.99,
    condition: 'Used',
    category: 'Electronics',
    subcategory: 'Cameras',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
    ],
    description: 'Complete camera kit with lens, bag, and accessories. Excellent condition.',
    seller: {
      id: 'seller5',
      name: 'PhotoPro',
      rating: 5.0,
      totalReviews: 456,
      memberSince: '2022-01-05',
    },
    stock: 1,
    views: 678,
    watchers: 67,
    reviews: [],
  },
];

export const mockUser = {
  id: 'user123',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
  memberSince: '2023-01-15',
  rating: 4.9,
  totalReviews: 45,
  verified: true,
};

export const mockOrders = [
  {
    id: 'order1',
    productId: '1',
    product: mockProducts[0],
    quantity: 1,
    totalPrice: 1099.99,
    status: 'delivered',
    orderDate: '2025-06-15',
    deliveryDate: '2025-06-20',
    trackingNumber: 'TRK123456789',
  },
  {
    id: 'order2',
    productId: '3',
    product: mockProducts[2],
    quantity: 1,
    totalPrice: 349.99,
    status: 'in_transit',
    orderDate: '2025-07-01',
    estimatedDelivery: '2025-07-10',
    trackingNumber: 'TRK987654321',
  },
];

export const mockMessages = [
  {
    id: 'msg1',
    conversationId: 'conv1',
    sender: { id: 'seller1', name: 'TechDeals Pro', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200' },
    recipient: mockUser,
    productId: '1',
    productTitle: 'iPhone 14 Pro Max 256GB',
    messages: [
      { id: '1', senderId: 'user123', text: 'Is this item still available?', timestamp: '2025-07-05T10:00:00' },
      { id: '2', senderId: 'seller1', text: 'Yes! We have 15 in stock. Ready to ship today!', timestamp: '2025-07-05T10:15:00' },
      { id: '3', senderId: 'user123', text: 'Great! Does it come with warranty?', timestamp: '2025-07-05T10:20:00' },
      { id: '4', senderId: 'seller1', text: 'Yes, includes full 1-year manufacturer warranty.', timestamp: '2025-07-05T10:25:00' },
    ],
    unread: 1,
  },
];

export const mockCart = [
  {
    id: 'cart1',
    product: mockProducts[2],
    quantity: 1,
  },
  {
    id: 'cart2',
    product: mockProducts[4],
    quantity: 2,
  },
];

export const mockMyListings = [
  {
    id: 'listing1',
    title: 'Vintage Record Player',
    price: 149.99,
    condition: 'Used',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800'],
    status: 'active',
    views: 234,
    watchers: 12,
    listedDate: '2025-06-20',
  },
  {
    id: 'listing2',
    title: 'Gaming Keyboard - RGB',
    price: 79.99,
    condition: 'New',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?w=800'],
    status: 'sold',
    views: 567,
    watchers: 23,
    listedDate: '2025-06-10',
    soldDate: '2025-06-25',
  },
];

// Page customization options
export const pageElements = [
  { id: 'hero', type: 'hero', label: 'Hero Banner', icon: 'Image' },
  { id: 'text', type: 'text', label: 'Text Block', icon: 'Type' },
  { id: 'images', type: 'images', label: 'Image Gallery', icon: 'Images' },
  { id: 'features', type: 'features', label: 'Features List', icon: 'List' },
  { id: 'reviews', type: 'reviews', label: 'Reviews', icon: 'Star' },
  { id: 'video', type: 'video', label: 'Video', icon: 'Video' },
  { id: 'cta', type: 'cta', label: 'Call to Action', icon: 'MousePointer' },
];

export const pageTemplates = [
  {
    id: 'modern',
    name: 'Modern Minimalist',
    thumbnail: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400',
    layout: [
      {
        id: 'element1',
        type: 'hero',
        content: { title: 'Premium Product', subtitle: 'High quality and affordable', image: '' },
        style: { backgroundColor: '#ffffff', textColor: '#000000', fontSize: '48px', fontFamily: 'Poppins' },
      },
      {
        id: 'element2',
        type: 'images',
        content: { images: [] },
        style: { backgroundColor: '#f8f9fa', textColor: '#333333' },
      },
      {
        id: 'element3',
        type: 'text',
        content: { title: 'Description', text: 'Product details...' },
        style: { backgroundColor: '#ffffff', textColor: '#333333', fontSize: '16px', fontFamily: 'Poppins' },
      },
    ],
  },
  {
    id: 'classic',
    name: 'Classic Store',
    thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    layout: [
      {
        id: 'element1',
        type: 'text',
        content: { title: 'About This Item', text: 'Product information...' },
        style: { backgroundColor: '#f5f5f5', textColor: '#2c3e50', fontSize: '18px', fontFamily: 'Georgia' },
      },
      {
        id: 'element2',
        type: 'features',
        content: { features: ['Feature 1', 'Feature 2', 'Feature 3'] },
        style: { backgroundColor: '#ffffff', textColor: '#2c3e50', fontSize: '16px', fontFamily: 'Georgia' },
      },
      {
        id: 'element3',
        type: 'reviews',
        content: {},
        style: { backgroundColor: '#f5f5f5', textColor: '#2c3e50' },
      },
    ],
  },
  {
    id: 'bold',
    name: 'Bold & Colorful',
    thumbnail: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400',
    layout: [
      {
        id: 'element1',
        type: 'hero',
        content: { title: 'Amazing Product!', subtitle: 'Limited Time Offer', image: '' },
        style: { backgroundColor: '#667eea', textColor: '#ffffff', fontSize: '56px', fontFamily: 'Montserrat' },
      },
      {
        id: 'element2',
        type: 'cta',
        content: { buttonText: 'Buy Now!', description: 'Get it before it\'s gone!' },
        style: { backgroundColor: '#764ba2', textColor: '#ffffff', fontSize: '20px', fontFamily: 'Montserrat' },
      },
      {
        id: 'element3',
        type: 'images',
        content: { images: [] },
        style: { backgroundColor: '#f093fb', textColor: '#000000' },
      },
    ],
  },
  {
    id: 'elegant',
    name: 'Elegant Luxury',
    thumbnail: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=400',
    layout: [
      {
        id: 'element1',
        type: 'hero',
        content: { title: 'Luxury Collection', subtitle: 'Timeless Elegance', image: '' },
        style: { backgroundColor: '#1a1a1a', textColor: '#d4af37', fontSize: '44px', fontFamily: 'Playfair Display' },
      },
      {
        id: 'element2',
        type: 'text',
        content: { title: 'Craftsmanship', text: 'Made with attention to detail...' },
        style: { backgroundColor: '#2c2c2c', textColor: '#e8e8e8', fontSize: '18px', fontFamily: 'Playfair Display' },
      },
      {
        id: 'element3',
        type: 'cta',
        content: { buttonText: 'Explore', description: 'Discover the collection' },
        style: { backgroundColor: '#d4af37', textColor: '#1a1a1a', fontSize: '18px', fontFamily: 'Playfair Display' },
      },
    ],
  },
];

export const googleFonts = [
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Source Sans Pro',
  'Raleway', 'Poppins', 'Merriweather', 'Ubuntu', 'Playfair Display',
  'Nunito', 'Rubik', 'Work Sans', 'Inter', 'PT Sans', 'Noto Sans',
  'Crimson Text', 'Bebas Neue', 'Dancing Script', 'Pacifico', 'Lobster',
  'Indie Flower', 'Permanent Marker', 'Georgia', 'Arial', 'Times New Roman',
  'Courier New', 'Verdana', 'Comic Sans MS',
];

export const defaultPageLayout = pageTemplates[0].layout;
