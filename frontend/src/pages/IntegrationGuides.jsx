import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  ArrowLeft, 
  CheckCircle, 
  ChevronRight,
  ExternalLink,
  Code,
  BookOpen,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const IntegrationGuides = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [copiedStep, setCopiedStep] = useState(null);

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: '/integration-guides' } } });
    }
  }, [isAuthenticated, navigate]);

  const copyToClipboard = (text, stepId) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    toast({
      title: "Copied!",
      description: "Code snippet copied to clipboard",
    });
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const platforms = [
    {
      id: 'shopify',
      name: 'Shopify',
      logoUrl: 'https://raw.githubusercontent.com/fortunefavors3/image-hosting/main/shopifyimages.png',
      description: 'Leading e-commerce platform',
      gradient: 'from-green-600 to-green-400',
      difficulty: 'Easy',
      time: '10 minutes',
      features: [
        'Custom checkout integration',
        'Product sync support',
        'Order management',
        'Automatic fulfillment'
      ]
    },
    {
      id: 'wix',
      name: 'Wix',
      logoUrl: 'https://raw.githubusercontent.com/fortunefavors3/image-hosting/main/wiximages.png',
      description: 'Website builder with e-commerce',
      gradient: 'from-blue-600 to-blue-400',
      difficulty: 'Easy',
      time: '15 minutes',
      features: [
        'Embed custom checkout',
        'Wix Velo integration',
        'Real-time inventory',
        'Seamless payments'
      ]
    },
    {
      id: 'woocommerce',
      name: 'WooCommerce',
      logoUrl: 'https://raw.githubusercontent.com/fortunefavors3/image-hosting/main/wooimages.png',
      description: 'WordPress e-commerce plugin',
      gradient: 'from-purple-600 to-purple-400',
      difficulty: 'Medium',
      time: '20 minutes',
      features: [
        'WordPress plugin',
        'Custom checkout pages',
        'Webhook integration',
        'Order synchronization'
      ]
    },
    {
      id: 'etsy',
      name: 'Etsy',
      logoUrl: 'https://raw.githubusercontent.com/fortunefavors3/image-hosting/main/19-190819_etsy-logo-transparent-png-circle.png',
      description: 'Marketplace for unique goods',
      gradient: 'from-orange-600 to-orange-400',
      difficulty: 'Medium',
      time: '25 minutes',
      features: [
        'API integration',
        'Shop sync',
        'Order import',
        'Custom checkout flow'
      ]
    },
    {
      id: 'wordpress',
      name: 'WordPress',
      logoUrl: 'https://s.w.org/style/images/about/WordPress-logotype-wmark.png',
      description: 'Popular content management system',
      gradient: 'from-slate-700 to-slate-500',
      difficulty: 'Easy',
      time: '15 minutes',
      features: [
        'Simple plugin installation',
        'Shortcode embedding',
        'Custom post types',
        'Widget support'
      ]
    },
    {
      id: 'bigcommerce',
      name: 'BigCommerce',
      logoUrl: 'https://raw.githubusercontent.com/fortunefavors3/image-hosting/main/bigcommerce-512.png',
      description: 'Enterprise e-commerce platform',
      gradient: 'from-blue-800 to-blue-600',
      difficulty: 'Medium',
      time: '20 minutes',
      features: [
        'App marketplace integration',
        'Custom checkout API',
        'Advanced webhooks',
        'Multi-store support'
      ]
    }
  ];

  const integrationSteps = {
    shopify: [
      {
        title: 'Install the CheqMart App',
        description: 'Add our app from the Shopify App Store',
        code: null,
        instructions: [
          'Visit the Shopify App Store',
          'Search for "CheqMart Checkout"',
          'Click "Add app" and authorize the installation',
          'You\'ll be redirected to the setup page'
        ]
      },
      {
        title: 'Connect Your CheqMart Account',
        description: 'Link your seller account',
        code: null,
        instructions: [
          'Log in to your CheqMart seller account',
          'Copy your API key from the Dashboard',
          'Paste it in the Shopify app settings',
          'Click "Connect Account"'
        ]
      },
      {
        title: 'Configure Checkout Settings',
        description: 'Customize your checkout experience',
        code: null,
        instructions: [
          'Go to Settings > Checkout',
          'Enable "Custom Checkout" option',
          'Select products to use CheqMart checkout',
          'Configure payment processor preferences',
          'Save changes'
        ]
      },
      {
        title: 'Add Checkout Button to Product Pages',
        description: 'Embed the custom checkout button',
        code: `<div id="cheqmart-checkout" data-product-id="{{product.id}}"></div>
<script src="https://checkout.cheqmart.com/embed.js"></script>
<script>
  CheqMart.init({
    apiKey: 'YOUR_API_KEY',
    productId: '{{product.id}}',
    theme: 'auto'
  });
</script>`,
        instructions: [
          'Open your Shopify theme editor',
          'Edit product.liquid template',
          'Add the code snippet above before </body>',
          'Replace YOUR_API_KEY with your actual key',
          'Save and preview your store'
        ]
      },
      {
        title: 'Test Your Integration',
        description: 'Verify everything works correctly',
        code: null,
        instructions: [
          'Visit your store and select a product',
          'Click the CheqMart checkout button',
          'Complete a test purchase',
          'Verify order appears in both systems',
          'Check webhook notifications'
        ]
      }
    ],
    wix: [
      {
        title: 'Enable Wix Developer Mode',
        description: 'Access Velo development tools',
        code: null,
        instructions: [
          'Open your Wix Editor',
          'Click "Dev Mode" in the top menu',
          'Enable Velo by Wix if not already enabled',
          'Your site will refresh with code panel'
        ]
      },
      {
        title: 'Add CheqMart SDK',
        description: 'Install the checkout library',
        code: `import { fetch } from 'wix-fetch';

// Initialize CheqMart
const CHEQMART_API_KEY = 'YOUR_API_KEY';
const CHEQMART_API_URL = 'https://api.cheqmart.com';

export async function initCheqMartCheckout(productId) {
  const response = await fetch(\`\${CHEQMART_API_URL}/checkout/init\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${CHEQMART_API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productId })
  });
  return await response.json();
}`,
        instructions: [
          'In the code panel, create a new file: backend/cheqmart.jsw',
          'Paste the code snippet above',
          'Replace YOUR_API_KEY with your CheqMart API key',
          'Save the file'
        ]
      },
      {
        title: 'Create Custom Checkout Button',
        description: 'Add button to product pages',
        code: `import { initCheqMartCheckout } from 'backend/cheqmart';

$w.onReady(function () {
  $w('#buyNowButton').onClick(async () => {
    const productId = $w('#productPage').getCurrentItem()._id;
    
    try {
      const checkout = await initCheqMartCheckout(productId);
      $w('#checkoutFrame').src = checkout.checkoutUrl;
      $w('#checkoutFrame').show();
    } catch (error) {
      console.error('Checkout error:', error);
      $w('#errorMessage').text = 'Failed to load checkout';
      $w('#errorMessage').show();
    }
  });
});`,
        instructions: [
          'Add a button to your product page template',
          'Set button ID to "buyNowButton"',
          'Add an iframe with ID "checkoutFrame" (hidden by default)',
          'In page code, paste the snippet above',
          'Style the button as needed'
        ]
      },
      {
        title: 'Handle Checkout Events',
        description: 'Process completed orders',
        code: `import wixData from 'wix-data';

export async function handleCheckoutComplete(checkoutData) {
  // Save order to Wix database
  await wixData.insert('Orders', {
    orderId: checkoutData.orderId,
    customerId: checkoutData.customerId,
    total: checkoutData.total,
    status: 'completed',
    createdAt: new Date()
  });
  
  // Send confirmation email
  // Update inventory
  return { success: true };
}`,
        instructions: [
          'Create a new backend file: backend/orders.jsw',
          'Paste the order handling code',
          'Set up webhook endpoint in CheqMart dashboard',
          'Point webhook to: yoursite.com/_functions/handleCheckout',
          'Test with a sample order'
        ]
      },
      {
        title: 'Publish and Test',
        description: 'Go live with your integration',
        code: null,
        instructions: [
          'Click "Publish" in the Wix Editor',
          'Visit your live product page',
          'Click the checkout button',
          'Complete a test transaction',
          'Verify order in both Wix and CheqMart dashboards'
        ]
      }
    ],
    woocommerce: [
      {
        title: 'Install CheqMart Plugin',
        description: 'Add the WordPress plugin',
        code: null,
        instructions: [
          'Download the CheqMart WooCommerce plugin',
          'Go to WordPress Admin > Plugins > Add New',
          'Click "Upload Plugin" and select the .zip file',
          'Click "Install Now" then "Activate"'
        ]
      },
      {
        title: 'Configure Plugin Settings',
        description: 'Set up your API credentials',
        code: null,
        instructions: [
          'Go to WooCommerce > Settings > CheqMart',
          'Enter your CheqMart API Key',
          'Select enabled payment processors',
          'Configure webhook URL',
          'Save changes'
        ]
      },
      {
        title: 'Enable Custom Checkout',
        description: 'Activate CheqMart checkout for products',
        code: `// Add to functions.php
add_filter('woocommerce_product_add_to_cart_url', 'cheqmart_custom_checkout_url', 10, 2);

function cheqmart_custom_checkout_url($url, $product) {
    if (get_post_meta($product->get_id(), '_cheqmart_enabled', true) === 'yes') {
        return add_query_arg([
            'cheqmart_checkout' => '1',
            'product_id' => $product->get_id()
        ], home_url('/cheqmart-checkout/'));
    }
    return $url;
}`,
        instructions: [
          'Edit individual products in WooCommerce',
          'In Product Data, check "Enable CheqMart Checkout"',
          'Or add the code snippet to enable programmatically',
          'Products will now use custom checkout'
        ]
      },
      {
        title: 'Customize Checkout Page',
        description: 'Create a custom checkout template',
        code: `<?php
// Create: wp-content/themes/your-theme/cheqmart-checkout.php
get_header();

$product_id = isset($_GET['product_id']) ? intval($_GET['product_id']) : 0;
$api_key = get_option('cheqmart_api_key');
?>

<div id="cheqmart-checkout-container">
  <div id="cheqmart-checkout" data-product-id="<?php echo $product_id; ?>"></div>
</div>

<script src="https://checkout.cheqmart.com/embed.js"></script>
<script>
  CheqMart.init({
    apiKey: '<?php echo esc_js($api_key); ?>',
    productId: '<?php echo $product_id; ?>',
    onComplete: function(order) {
      window.location.href = '<?php echo home_url('/order-confirmation/'); ?>?order_id=' + order.id;
    }
  });
</script>

<?php get_footer(); ?>`,
        instructions: [
          'Create a new page template in your theme',
          'Paste the checkout template code',
          'Style the checkout container with CSS',
          'Test the checkout flow'
        ]
      },
      {
        title: 'Set Up Order Sync',
        description: 'Sync orders between systems',
        code: `// Add webhook handler in functions.php
add_action('rest_api_init', function() {
    register_rest_route('cheqmart/v1', '/webhook', [
        'methods' => 'POST',
        'callback' => 'cheqmart_handle_webhook',
        'permission_callback' => 'cheqmart_verify_webhook'
    ]);
});

function cheqmart_handle_webhook($request) {
    $data = $request->get_json_params();
    
    // Create WooCommerce order
    $order = wc_create_order();
    $order->add_product(wc_get_product($data['product_id']), $data['quantity']);
    $order->set_address($data['shipping_address'], 'shipping');
    $order->set_address($data['billing_address'], 'billing');
    $order->calculate_totals();
    $order->payment_complete($data['transaction_id']);
    
    return ['success' => true, 'order_id' => $order->get_id()];
}`,
        instructions: [
          'Add webhook handler code to functions.php',
          'Copy your webhook URL',
          'Add it to CheqMart dashboard webhooks',
          'Test with a sample transaction'
        ]
      }
    ],
    etsy: [
      {
        title: 'Create Etsy API Application',
        description: 'Register your integration',
        code: null,
        instructions: [
          'Go to Etsy Developer Portal',
          'Create a new app',
          'Note your API Key and Shared Secret',
          'Set redirect URI to: yoursite.com/etsy-callback'
        ]
      },
      {
        title: 'Connect CheqMart to Etsy',
        description: 'Link your Etsy shop',
        code: null,
        instructions: [
          'Go to CheqMart Dashboard > Integrations',
          'Click "Connect Etsy Shop"',
          'Enter your Etsy API credentials',
          'Authorize CheqMart to access your shop',
          'Select which listings to sync'
        ]
      },
      {
        title: 'Import Etsy Listings',
        description: 'Sync your products',
        code: `// API call to sync listings
const syncEtsyListings = async () => {
  const response = await fetch('https://api.cheqmart.com/etsy/sync', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      shop_id: 'YOUR_ETSY_SHOP_ID',
      sync_mode: 'all' // or 'active', 'draft'
    })
  });
  
  const result = await response.json();
  console.log(\`Synced \${result.count} listings\`);
};`,
        instructions: [
          'In CheqMart dashboard, click "Sync Etsy Products"',
          'Select sync mode (all, active, or draft)',
          'Wait for sync to complete',
          'Review imported products',
          'Enable CheqMart checkout for selected items'
        ]
      },
      {
        title: 'Add Checkout Link to Etsy Listings',
        description: 'Direct customers to your checkout',
        code: null,
        instructions: [
          'Edit your Etsy listing descriptions',
          'Add: "Buy directly with faster checkout: [Your CheqMart Link]"',
          'Get your product link from CheqMart dashboard',
          'Etsy will display this link in the listing',
          'Customers can choose either checkout method'
        ]
      },
      {
        title: 'Configure Order Fulfillment',
        description: 'Handle Etsy order updates',
        code: `// Webhook handler for order updates
app.post('/webhooks/cheqmart-order', async (req, res) => {
  const order = req.body;
  
  // Update Etsy listing inventory
  await etsyAPI.updateInventory({
    listing_id: order.listing_id,
    quantity: order.quantity_purchased,
    operation: 'subtract'
  });
  
  // Mark as shipped in Etsy when fulfilled
  if (order.status === 'shipped') {
    await etsyAPI.createReceipt({
      receipt_id: order.etsy_receipt_id,
      tracking_code: order.tracking_number,
      carrier: order.shipping_carrier
    });
  }
  
  res.json({ success: true });
});`,
        instructions: [
          'Set up webhook in CheqMart for order events',
          'Configure inventory auto-sync',
          'Enable shipping notifications to Etsy',
          'Test with a sample order',
          'Verify Etsy shop reflects correct inventory'
        ]
      }
    ],
    bigcommerce: [
      {
        title: 'Install CheqMart App',
        description: 'Add from BigCommerce marketplace',
        code: null,
        instructions: [
          'Log in to your BigCommerce store',
          'Go to Apps > Marketplace',
          'Search for "CheqMart Checkout"',
          'Click "Install" and follow prompts',
          'Authorize app access to your store'
        ]
      },
      {
        title: 'Configure API Credentials',
        description: 'Connect your CheqMart account',
        code: null,
        instructions: [
          'In BigCommerce, go to Apps > My Apps > CheqMart',
          'Copy your CheqMart API Key',
          'Paste into the app settings',
          'Select your preferred payment processors',
          'Save configuration'
        ]
      },
      {
        title: 'Enable Checkout API',
        description: 'Set up custom checkout',
        code: `// BigCommerce Storefront API
const initCheckout = async (cartId) => {
  const response = await fetch(\`/api/storefront/checkouts/\${cartId}\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': 'YOUR_BC_TOKEN'
    },
    body: JSON.stringify({
      cart_id: cartId,
      channel_id: 1,
      checkout_url: \`https://checkout.cheqmart.com/bc/\${cartId}\`
    })
  });
  
  const checkout = await response.json();
  window.location.href = checkout.checkout_url;
};`,
        instructions: [
          'Enable Checkout API in BigCommerce settings',
          'Configure redirect URL to CheqMart',
          'Add checkout button to product pages',
          'Implement the API call shown above'
        ]
      },
      {
        title: 'Customize Stencil Theme',
        description: 'Add checkout button to templates',
        code: `{{!-- templates/components/products/add-to-cart.html --}}
<div class="cheqmart-checkout-wrapper">
  <button 
    class="button button--primary cheqmart-checkout-btn"
    data-product-id="{{product.id}}"
    onclick="openCheqMartCheckout({{product.id}})">
    Buy with CheqMart Checkout
  </button>
</div>

<script>
function openCheqMartCheckout(productId) {
  CheqMartCheckout.open({
    productId: productId,
    apiKey: '{{settings.cheqmart_api_key}}',
    onSuccess: function(order) {
      window.location.href = '/checkout/order-confirmation?order_id=' + order.id;
    },
    onClose: function() {
      console.log('Checkout closed');
    }
  });
}
</script>`,
        instructions: [
          'Access your Stencil theme files',
          'Edit product template files',
          'Add the checkout button code',
          'Include CheqMart SDK in theme',
          'Upload and apply theme changes'
        ]
      },
      {
        title: 'Set Up Webhooks',
        description: 'Sync orders and inventory',
        code: `{
  "scope": "store/order/created",
  "destination": "https://api.cheqmart.com/webhooks/bigcommerce/order",
  "is_active": true,
  "headers": {
    "X-CheqMart-Key": "YOUR_API_KEY"
  }
}`,
        instructions: [
          'Go to BigCommerce Settings > API > Webhooks',
          'Create webhook for order events',
          'Use the JSON configuration above',
          'Add webhooks for inventory updates',
          'Test webhook delivery'
        ]
      }
    ],
    wordpress: [
      {
        title: 'Install CheqMart Plugin',
        description: 'Add the WordPress plugin to your site',
        code: null,
        instructions: [
          'Download the CheqMart WordPress plugin from our website',
          'Go to WordPress Admin > Plugins > Add New',
          'Click "Upload Plugin" and select the .zip file',
          'Click "Install Now" and wait for installation',
          'Click "Activate Plugin" to enable it'
        ]
      },
      {
        title: 'Configure Plugin Settings',
        description: 'Connect your CheqMart account',
        code: null,
        instructions: [
          'Go to WordPress Admin > Settings > CheqMart',
          'Enter your CheqMart API Key (from your seller dashboard)',
          'Enter your Seller ID',
          'Choose your preferred checkout style (popup or redirect)',
          'Select button styling options',
          'Click "Save Changes"'
        ]
      },
      {
        title: 'Add Products Using Custom Post Type',
        description: 'Create CheqMart products in WordPress',
        code: null,
        instructions: [
          'Go to CheqMart Products > Add New in WordPress admin',
          'Enter product title and description',
          'Set product price and inventory',
          'Upload product images',
          'Add product categories and tags',
          'Publish the product'
        ]
      },
      {
        title: 'Embed Checkout with Shortcode',
        description: 'Add checkout buttons to pages and posts',
        code: `<!-- Single Product Checkout -->
[cheqmart_checkout product_id="12345" button_text="Buy Now"]

<!-- Product with Custom Styling -->
[cheqmart_checkout product_id="12345" button_color="#4F46E5" button_size="large"]

<!-- Multiple Products -->
[cheqmart_checkout product_id="12345,67890,11223" layout="grid"]

<!-- Product Gallery -->
[cheqmart_products category="electronics" limit="8" columns="4"]

<!-- Buy Button with Quantity -->
[cheqmart_checkout product_id="12345" show_quantity="true" min="1" max="10"]`,
        instructions: [
          'Edit any page or post in WordPress',
          'Add the shortcode where you want the checkout button',
          'Replace product_id with your actual CheqMart product ID',
          'Customize button text and styling as needed',
          'Preview and publish your page',
          'Shortcodes work in widgets and page builders too'
        ]
      },
      {
        title: 'Use the Gutenberg Block',
        description: 'Add checkout using block editor',
        code: null,
        instructions: [
          'Open any page in the Block Editor (Gutenberg)',
          'Click the "+" button to add a new block',
          'Search for "CheqMart Checkout"',
          'Select your product from the dropdown',
          'Customize button appearance in the block settings',
          'Preview and publish'
        ]
      },
      {
        title: 'Add Widget to Sidebar',
        description: 'Display products in sidebars and footer',
        code: null,
        instructions: [
          'Go to Appearance > Widgets',
          'Find "CheqMart Product Widget"',
          'Drag it to your desired widget area',
          'Select product or product category',
          'Configure display options (image, price, button)',
          'Save widget settings'
        ]
      },
      {
        title: 'Configure Order Notifications',
        description: 'Set up email notifications for orders',
        code: `// Add to functions.php for custom order handling
add_action('cheqmart_order_completed', 'custom_cheqmart_order_handler', 10, 1);

function custom_cheqmart_order_handler($order_data) {
    // Send custom email notification
    $to = get_option('admin_email');
    $subject = 'New CheqMart Order: ' . $order_data['order_id'];
    $message = 'Order details: ' . print_r($order_data, true);
    wp_mail($to, $subject, $message);
    
    // Log to custom database table
    global $wpdb;
    $wpdb->insert('wp_cheqmart_orders', [
        'order_id' => $order_data['order_id'],
        'customer_email' => $order_data['customer_email'],
        'total' => $order_data['total'],
        'status' => 'completed',
        'created_at' => current_time('mysql')
    ]);
    
    // Trigger custom actions
    do_action('my_custom_order_action', $order_data);
}`,
        instructions: [
          'Go to Settings > CheqMart > Notifications',
          'Enable email notifications for new orders',
          'Enter notification email addresses',
          'Customize email templates',
          'Set up webhook URL for external integrations',
          'Add custom code to functions.php for advanced handling (optional)'
        ]
      },
      {
        title: 'Style and Customize',
        description: 'Match your site design',
        code: `/* Add to your theme's style.css or custom CSS */

/* Customize Buy Button */
.cheqmart-checkout-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    color: white;
    transition: transform 0.2s;
}

.cheqmart-checkout-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Product Grid Layout */
.cheqmart-products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 24px;
    margin: 32px 0;
}

/* Product Card Styling */
.cheqmart-product-card {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
    transition: box-shadow 0.3s;
}

.cheqmart-product-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}`,
        instructions: [
          'Go to Appearance > Customize > Additional CSS',
          'Add custom CSS to style checkout buttons',
          'Customize product grid layout',
          'Match colors to your theme',
          'Add hover effects and animations',
          'Test on mobile devices for responsiveness'
        ]
      },
      {
        title: 'Test Your Integration',
        description: 'Verify everything works correctly',
        code: null,
        instructions: [
          'Create a test product in CheqMart',
          'Add the product to a WordPress page using shortcode',
          'Click the checkout button on the live page',
          'Complete a test purchase (use test card if available)',
          'Verify order appears in CheqMart dashboard',
          'Check that email notifications are received',
          'Test on mobile devices and different browsers'
        ]
      }
    ]
  };

  const renderPlatformCard = (platform) => (
    <Card 
      key={platform.id} 
      className={`hover:shadow-lg transition-all cursor-pointer ${
        selectedPlatform === platform.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => setSelectedPlatform(platform.id)}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center bg-white">
              <img 
                src={platform.logoUrl} 
                alt={`${platform.name} logo`}
                className="w-full h-full object-contain p-2"
              />
            </div>

            <div>
              <CardTitle className="text-xl">{platform.name}</CardTitle>
              <CardDescription>{platform.description}</CardDescription>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline">{platform.difficulty}</Badge>
          <Badge variant="outline">{platform.time}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Features */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Features:</p>
          <ul className="space-y-1">
            {platform.features.map((feature, idx) => (
              <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <Button 
          className={`w-full bg-gradient-to-r ${platform.gradient} hover:opacity-90`}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPlatform(platform.id);
            // Scroll to instructions
            setTimeout(() => {
              document.getElementById('integration-steps')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          View Integration Guide
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  const renderIntegrationSteps = () => {
    if (!selectedPlatform) return null;

    const steps = integrationSteps[selectedPlatform];
    const platform = platforms.find(p => p.id === selectedPlatform);

    return (
      <div id="integration-steps" className="mt-12">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {platform.name} Integration Guide
                </CardTitle>
                <CardDescription>
                  Follow these steps to integrate CheqMart checkout
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedPlatform(null)}
                className="bg-gray-50 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Platforms
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-6 pb-6 relative">
                {/* Step number badge */}
                <div className="absolute -left-4 top-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>

                {/* Step content */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>

                  {/* Instructions list */}
                  {step.instructions && (
                    <ul className="space-y-2">
                      {step.instructions.map((instruction, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-700">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Code snippet */}
                  {step.code && (
                    <div className="bg-gray-900 rounded-lg p-4 relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 text-white hover:bg-gray-800"
                        onClick={() => copyToClipboard(step.code, `${selectedPlatform}-${index}`)}
                      >
                        {copiedStep === `${selectedPlatform}-${index}` ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                      <pre className="text-sm text-gray-100 overflow-x-auto pr-24">
                        <code>{step.code}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Success message */}
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Congratulations!</strong> You've completed the {platform.name} integration. 
                Test your checkout flow and contact support if you need any assistance.
              </AlertDescription>
            </Alert>

            {/* Help section */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Need Help?</h4>
                <p className="text-sm text-gray-600">
                  Our support team is here to assist with your integration
                </p>
              </div>
              <Button 
                variant="outline"
                className="bg-white hover:bg-blue-500 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Integrations</h1>
        <p className="text-gray-600">
          Integrate CheqMart checkout with your existing e-commerce platform
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50 mb-8">
        <Code className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Simple Integration:</strong> Choose your platform below to get step-by-step 
          instructions with code snippets and best practices.
        </AlertDescription>
      </Alert>

      {/* Platform Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map(platform => renderPlatformCard(platform))}
      </div>

      {/* Integration Steps */}
      {renderIntegrationSteps()}

      {/* Additional Resources */}
      {!selectedPlatform && (
        <Card className="mt-8 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">Additional Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>API Documentation:</strong> Full API reference with examples for custom integrations
            </p>
            <p>
              <strong>Developer Forum:</strong> Join our community of developers building on CheqMart
            </p>
            <p>
              <strong>Webhook Reference:</strong> Complete guide to handling real-time events
            </p>
            <div className="pt-3">
              <Button variant="outline" className="w-full">
                <BookOpen className="w-4 h-4 mr-2" />
                View Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntegrationGuides;
