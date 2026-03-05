import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle, Package, Receipt } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, total } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-12 pb-8">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            {/* Success Message */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
              <p className="text-gray-600">
                Your order has been confirmed and is being processed.
              </p>
            </div>

            {/* Order Details */}
            <div className="bg-blue-50 rounded-lg p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Order ID</span>
                <span className="font-mono font-semibold text-gray-900">{orderId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="text-2xl font-bold text-gray-900">${total?.toFixed(2)}</span>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-4 mt-8">
              <div className="p-4 border border-gray-200 rounded-lg">
                <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Track Your Order</h3>
                <p className="text-sm text-gray-600">
                  You'll receive tracking info via email and SMS
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <Receipt className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Receipt Sent</h3>
                <p className="text-sm text-gray-600">
                  A detailed receipt has been emailed to you
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                View Order Status
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                Continue Shopping
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Questions about your order? Contact us at support@effinsure.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSuccess;
