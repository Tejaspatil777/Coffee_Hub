import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, CheckCircle } from 'lucide-react';
import { getCart, updateQty, removeFromCart, clearCart } from '../services/localCart';
import { toast } from 'react-toastify';
import axios from "axios";

function Cart({ onNavigate }) {
  const [cartItems, setCartItems] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cart = getCart();
    setCartItems(cart);
  };

  const handleUpdateQty = (itemId, newQty) => {
    if (newQty < 1) return;
    updateQty(itemId, newQty);
    loadCart();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleRemoveItem = (itemId, itemName) => {
    removeFromCart(itemId);
    loadCart();
    window.dispatchEvent(new Event('cartUpdated'));
    toast.info(`${itemName} removed from cart`);
  };

  // Calculate total in rupees
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Prepare items with price in paise (backend expects paise)
      const items = cartItems.map(item => ({
        menuId: item.id,
        name: item.name,
        price: Math.round(item.price * 100), // Convert rupees to paise
        quantity: item.quantity
      }));

      // Calculate total in paise
      const totalInPaise = items.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
      );

      const payload = {
        items: items
        // Don't send totalAmount/totalPrice - let backend calculate it
      };

      console.log("🛒 Cart order payload:", payload);
      console.log("💰 Total in paise:", totalInPaise);
      console.log("💰 Total in rupees:", totalInPaise / 100);

      const res = await axios.post(
        "http://localhost:8080/order/create",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("✅ Order response:", res.data);
      console.log("💰 Order total from backend:", res.data.totalPrice);

      setPlacedOrder(res.data);
      setShowOrderModal(true);

      clearCart();
      setCartItems([]);
      window.dispatchEvent(new Event('cartUpdated'));

    } catch (err) {
      console.error("❌ Order error:", err);
      toast.error(err.response?.data?.message || "Failed to place order");
    }
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setPlacedOrder(null);
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&fit=crop)'
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-black/70 via-amber-900/60 to-black/70 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => onNavigate('order')}
              className="flex items-center gap-2 text-amber-200 hover:text-amber-100 transition-colors mb-4"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Continue Shopping</span>
            </button>

            <div className="flex items-center gap-3">
              <ShoppingCart className="h-10 w-10 text-amber-300" />
              <div>
                <h1 className="text-4xl font-bold text-white">Your Cart</h1>
                <p className="text-amber-200">{cartItems.length} items in cart</p>
              </div>
            </div>
          </motion.div>

          {/* CART ITEMS */}
          <div className="space-y-4 mb-6">
            <AnimatePresence>
              {cartItems.length === 0 ? (
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/90 backdrop-blur-md rounded-2xl p-12 text-center shadow-2xl"
                >
                  <ShoppingCart className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                </motion.div>

              ) : (
                cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/90 backdrop-blur-md rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">

                      <div className="w-24 h-24 rounded-lg overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{item.description}</p>

                        <p className="text-lg font-bold text-amber-700">
                          ₹{item.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <motion.button
                          onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 flex items-center justify-center"
                        >
                          <Minus className="h-4 w-4 text-amber-700" />
                        </motion.button>

                        <span className="w-12 text-center font-bold text-gray-800">
                          {item.quantity}
                        </span>

                        <motion.button
                          onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 flex items-center justify-center"
                        >
                          <Plus className="h-4 w-4 text-amber-700" />
                        </motion.button>
                      </div>

                      <div className="text-right mr-4">
                        <p className="text-sm text-gray-600">Subtotal</p>
                        <p className="text-xl font-bold text-gray-800">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <motion.button
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        className="p-2 rounded-full bg-red-100 hover:bg-red-200"
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* TOTAL */}
          {cartItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-2xl font-bold text-gray-800">Total Amount</span>
                <span className="text-2xl font-bold text-green-600">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex gap-4">
                <motion.button
                  onClick={() => onNavigate('order')}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-xl font-semibold"
                >
                  Continue Shopping
                </motion.button>

                <motion.button
                  onClick={handlePlaceOrder}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  Place Order
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ORDER MODAL */}
      <AnimatePresence>
        {showOrderModal && placedOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Placed!</h2>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 font-medium">Order ID</span>
                    <span className="font-mono font-bold text-amber-700">
                      {placedOrder.id}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-amber-200">
                    <span className="text-lg font-semibold text-gray-800">Total Paid</span>
                    <span className="text-2xl font-bold text-green-600">
                      {/* Use totalPrice from backend response */}
                      ₹{(placedOrder.totalPrice || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={() => {
                      closeOrderModal();
                      onNavigate('orders');
                    }}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-lg font-semibold"
                  >
                    View Orders
                  </motion.button>

                  <motion.button
                    onClick={closeOrderModal}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Cart;