import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productService } from '../services/productService';
import { dealerService } from '../services/dealerService';
import {
  ShoppingCart,
  Plus,
  Minus,
  CreditCard,
  Truck,
  MapPin,
  Upload,
  CheckCircle,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ref, set } from 'firebase/database';
import { rtdb } from '../firebase/config';
import {
  Button,
  Input,
  Modal,
  CardGeneric,
  Select,
  Textarea,
  Badge,
  LoadingSpinner,
  Checkbox,
  RadioGroup,
  Alert,
  FileUpload
} from '../components/ui';

const PlaceOrder = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCartModal, setShowCartModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [dealer, setDealer] = useState(null);
  const [orderData, setOrderData] = useState({
    paymentMethod: '',
    deliveryAddress: '',
    bankStatement: null,
    notes: ''
  });
  const [placingOrder, setPlacingOrder] = useState(false);

  // Load products and dealer data
  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, dealerData] = await Promise.all([
        productService.getAllProducts(),
        dealerService.getDealerById(user.uid)
      ]);

      setProducts(productsData);
      setFilteredProducts(productsData);
      setDealer(dealerData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  // Add product to cart
  const addToCart = useCallback((product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          toast.error('Cannot add more items than available stock');
          return prevCart;
        }
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    toast.success('Added to cart');
  }, []);

  // Update cart item quantity
  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === productId) {
          const product = products.find(p => p.id === productId);
          if (newQuantity > product.stock) {
            toast.error('Cannot exceed available stock');
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  }, [products]);

  // Remove item from cart
  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    toast.success('Removed from cart');
  }, []);

  // Calculate cart totals
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Handle order placement
  const handlePlaceOrder = async () => {
    if (!orderData.paymentMethod || !orderData.deliveryAddress) {
      toast.error('Please complete all required fields');
      return;
    }

    if (orderData.paymentMethod === 'credit' && !orderData.bankStatement) {
      toast.error('Bank statement is required for credit payment');
      return;
    }

    setPlacingOrder(true);
    try {
      // Get owner email from the first product in cart (assuming all products from same owner)
      const ownerEmail = cart[0]?.ownerEmail || cart[0]?.riceMillOwner || 'unknown@example.com';

      // Create order data for RTDB (for owner filtering)
      const orderDataForOwner = {
        id: `ORD-${Date.now()}`,
        dealerId: user.uid,
        dealerName: dealer.name,
        dealerEmail: user.email,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        })),
        totalAmount: cartTotal,
        paymentMethod: orderData.paymentMethod,
        deliveryAddress: orderData.deliveryAddress,
        notes: orderData.notes,
        status: 'pending',
        createdAt: new Date().toISOString(),
        placedOn: new Date().toISOString(),
        // CRITICAL: Owner email for filtering in owner's Orders page
        riceMillOwner: cart[0]?.riceMillOwner || 'Unknown Rice Mill',
        riceMillId: cart[0]?.riceMillId || 'unknown',
        ownerEmail: ownerEmail, // This will be used for filtering in owner's Orders page
      };

      // Debug logging
      console.log("🚨 DEBUG - Order data for owner:", {
        orderNumber: orderDataForOwner.id,
        riceMillOwner: orderDataForOwner.riceMillOwner,
        ownerEmail: orderDataForOwner.ownerEmail,
        allFields: orderDataForOwner
      });

      // Save to Firebase RTDB for owner filtering
      const orderRef = ref(rtdb, `orders/${orderDataForOwner.id}`);
      await set(orderRef, orderDataForOwner);

      // Also save to Firestore for dealer's order history
      await productService.createOrder(orderDataForOwner);

      // Update product stock
      for (const item of cart) {
        await productService.updateProductStock(item.id, item.quantity);
      }

      // Clear cart and show success
      setCart([]);
      setShowPaymentModal(false);
      setShowDeliveryModal(false);
      setShowSuccessModal(true);

      // Reset order data
      setOrderData({
        paymentMethod: '',
        deliveryAddress: '',
        bankStatement: null,
        notes: ''
      });

      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Get unique categories
  const categories = [...new Set(products.map(product => product.category))];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Place Order</h1>
          <p className="text-gray-600">Browse and order rice products from your trusted suppliers</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              icon={<Search size={20} />}
            />
          </div>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            placeholder="All Categories"
            options={categories.map(cat => ({ value: cat, label: cat }))}
            className="sm:w-48"
          />
        </div>

        {/* Cart Summary */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {filteredProducts.length} products available
          </div>
          <Button
            onClick={() => setShowCartModal(true)}
            variant="secondary"
            className="relative"
          >
            <ShoppingCart size={20} className="mr-2" />
            Cart ({cartItemsCount})
            {cartTotal > 0 && (
              <Badge className="ml-2">${cartTotal.toFixed(2)}</Badge>
            )}
          </Button>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <CardGeneric key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-1 aspect-h-1 bg-gray-200 mb-4">
                  <img
                    src={product.image || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.type}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-bold text-green-600">${product.price}</span>
                    <Badge variant={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    fullWidth
                    variant="primary"
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardGeneric>
            ))}
          </div>
        )}
      </div>

      {/* Cart Modal */}
      <Modal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        title="Shopping Cart"
        size="lg"
      >
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600">Add some products to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <img
                  src={item.image || '/placeholder-product.jpg'}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">${item.price} each</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="mt-4 flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCartModal(false)}
                  fullWidth
                >
                  Continue Shopping
                </Button>
                <Button
                  onClick={() => {
                    setShowCartModal(false);
                    setShowDeliveryModal(true);
                  }}
                  fullWidth
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delivery Modal */}
      <Modal
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        title="Delivery Information"
        size="md"
      >
        <div className="space-y-4">
          <Textarea
            label="Delivery Address"
            placeholder="Enter your delivery address"
            value={orderData.deliveryAddress}
            onChange={(e) => setOrderData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
            required
            rows={3}
          />

          <Textarea
            label="Additional Notes (Optional)"
            placeholder="Any special instructions for delivery"
            value={orderData.notes}
            onChange={(e) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
          />

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeliveryModal(false);
                setShowCartModal(true);
              }}
              fullWidth
            >
              Back to Cart
            </Button>
            <Button
              onClick={() => {
                setShowDeliveryModal(false);
                setShowPaymentModal(true);
              }}
              disabled={!orderData.deliveryAddress.trim()}
              fullWidth
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Payment Method"
        size="md"
      >
        <div className="space-y-4">
          <RadioGroup
            label="Select Payment Method"
            options={[
              { value: 'online', label: 'Online Payment (Card)' },
              { value: 'credit', label: `Credit/Pay Later (Available: $${dealer?.creditLimit || 0})` }
            ]}
            value={orderData.paymentMethod}
            onChange={(value) => setOrderData(prev => ({ ...prev, paymentMethod: value }))}
          />

          {orderData.paymentMethod === 'online' && (
            <Alert type="info">
              You will be redirected to a secure payment gateway to complete your card payment.
            </Alert>
          )}

          {orderData.paymentMethod === 'credit' && (
            <div className="space-y-4">
              <Alert type="warning">
                Credit payment requires bank statement verification for approval.
              </Alert>

              <FileUpload
                label="Bank Statement"
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={5 * 1024 * 1024} // 5MB
                onChange={(files) => setOrderData(prev => ({ ...prev, bankStatement: files[0] }))}
                required
              />

              {dealer && cartTotal > dealer.creditLimit && (
                <Alert type="error">
                  Order total exceeds your available credit limit. Please choose online payment or reduce cart items.
                </Alert>
              )}
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-semibold mb-4">
              <span>Total Amount:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentModal(false);
                  setShowDeliveryModal(true);
                }}
                fullWidth
              >
                Back to Delivery
              </Button>
              <Button
                onClick={handlePlaceOrder}
                disabled={
                  !orderData.paymentMethod ||
                  (orderData.paymentMethod === 'credit' && (!orderData.bankStatement || cartTotal > dealer?.creditLimit))
                }
                loading={placingOrder}
                fullWidth
              >
                {placingOrder ? 'Placing Order...' : 'Place Order'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Order Placed Successfully!"
        size="sm"
      >
        <div className="text-center py-6">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Thank you for your order!</h3>
          <p className="text-gray-600 mb-4">
            Your order has been placed and is pending approval from the rice mill owner.
            You will receive a confirmation email shortly.
          </p>
          <Button onClick={() => setShowSuccessModal(false)} fullWidth>
            Continue Shopping
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default PlaceOrder;