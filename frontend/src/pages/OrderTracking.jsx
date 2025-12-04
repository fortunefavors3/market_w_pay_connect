import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Package, Truck, CheckCircle, MapPin } from 'lucide-react';
import { mockOrders } from '../mock';

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = mockOrders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  const trackingSteps = [
    {
      id: 1,
      title: 'Order Placed',
      description: 'Your order has been confirmed',
      date: order.orderDate,
      completed: true,
      icon: Package,
    },
    {
      id: 2,
      title: 'Processing',
      description: 'Seller is preparing your item',
      date: order.orderDate,
      completed: order.status !== 'pending',
      icon: Package,
    },
    {
      id: 3,
      title: 'Shipped',
      description: 'Package is on its way',
      date: order.status === 'in_transit' || order.status === 'delivered' ? order.orderDate : null,
      completed: order.status === 'in_transit' || order.status === 'delivered',
      icon: Truck,
    },
    {
      id: 4,
      title: 'Out for Delivery',
      description: 'Package is out for delivery',
      date: order.status === 'delivered' ? order.deliveryDate : null,
      completed: order.status === 'delivered',
      icon: MapPin,
    },
    {
      id: 5,
      title: 'Delivered',
      description: 'Package has been delivered',
      date: order.deliveryDate,
      completed: order.status === 'delivered',
      icon: CheckCircle,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
        ← Back to Orders
      </Button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Tracking</h1>

      {/* Order Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <img
              src={order.product.images[0]}
              alt={order.product.title}
              className="w-32 h-32 object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">{order.product.title}</h3>
              <p className="text-sm text-gray-600 mb-2">Order #{order.id}</p>
              <p className="text-sm text-gray-600 mb-2">Quantity: {order.quantity}</p>
              <p className="text-xl font-bold text-gray-900">${order.totalPrice.toFixed(2)}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="font-medium text-gray-900">{new Date(order.orderDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tracking Number</p>
              <p className="font-medium text-gray-900">{order.trackingNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge className={`${
                order.status === 'delivered' ? 'bg-green-500' :
                order.status === 'in_transit' ? 'bg-blue-500' : 'bg-gray-500'
              }`}>
                {order.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {order.status === 'delivered' ? 'Delivered' : 'Estimated Delivery'}
              </p>
              <p className="font-medium text-gray-900">
                {order.deliveryDate
                  ? new Date(order.deliveryDate).toLocaleDateString()
                  : new Date(order.estimatedDelivery).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Tracking Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {trackingSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        step.completed
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    {index < trackingSteps.length - 1 && (
                      <div
                        className={`w-0.5 h-16 ${
                          step.completed ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className={`font-semibold ${
                      step.completed ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm ${
                      step.completed ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                    {step.date && (
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(step.date).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderTracking;
