import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Zap } from 'lucide-react';
import { toast } from 'react-toastify';

import { getMenu } from '../services/menuService';
import { createOrder } from '../services/orderService';
import { addToCart } from '../services/localCart';

function OrderPage() {
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [animatingCart, setAnimatingCart] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await getMenu();
        setMenuItems(res.data);
      } catch (err) {
        toast.error("Failed to load menu items");
      }
    };
    fetchMenu();
  }, []);

  const handleAddToCart = (item) => {
    addToCart({
      ...item,
      price: item.price / 100, // Convert to rupees for cart
    });

    setAnimatingCart(item.id);
    setTimeout(() => setAnimatingCart(null), 600);

    window.dispatchEvent(new Event('cartUpdated'));

    toast.success(`${item.name} added to cart!`, {
      position: 'top-center',
      autoClose: 1500,
    });
  };

  const handleBuyNow = async (item) => {
    try {
      console.log("🛒 Buy Now clicked for item:", item);
      console.log("💰 Item price in paise:", item.price);
      
      const payload = {
        items: [
          {
            menuId: item.id,
            name: item.name,
            price: item.price, // This is in paise (e.g., 12000)
            quantity: 1,
          },
        ],
      };

      console.log("📦 Sending order payload:", payload);

      const res = await createOrder(payload);

      console.log("✅ Order response:", res.data);
      console.log("📊 Response keys:", Object.keys(res.data));
      console.log("💰 Backend returned total:", res.data.totalPrice);

      // The backend already converts paise to rupees
      // So we get totalPrice in rupees (e.g., 120.0 not 12000)
      const totalAmount = res.data.totalPrice || res.data.totalAmount || 0;

      setCurrentOrder({
        id: res.data.id,
        totalAmount: totalAmount, // Already in rupees
      });

      setShowBuyNowModal(true);
      
    } catch (err) {
      console.error("❌ Buy now error:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
      }
      toast.error(err.response?.data?.message || "Failed to place order");
    }
  };

  const closeBuyNowModal = () => {
    setShowBuyNowModal(false);
    setCurrentOrder(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      
      {/* Hero Section */}
      <div 
        className="relative bg-cover bg-center py-16 px-8"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&fit=crop)',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-4"
          >
            Order Your Favorite Coffee
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-amber-100"
          >
            Fresh brews delivered to your table
          </motion.p>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              
              {/* Content */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-amber-700">
                    {/* Display price in rupees */}
                    ₹{(item.price / 100).toFixed(2)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  
                  {/* Add to Cart */}
                  <motion.button
                    onClick={() => handleAddToCart(item)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className={`h-4 w-4 ${animatingCart === item.id ? 'animate-bounce' : ''}`} />
                    Add
                  </motion.button>

                  {/* Buy Now */}
                  <motion.button
                    onClick={() => handleBuyNow(item)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Buy
                  </motion.button>

                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Buy Now Success Modal */}
      <AnimatePresence>
        {showBuyNowModal && currentOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeBuyNowModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
                <p className="text-gray-600 mb-4">Your order has been placed successfully</p>
                
                <div className="bg-amber-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono font-bold text-amber-700">{currentOrder.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount:</span>
                    {/* FIXED: Remove / 100 since backend already returns rupees */}
                    <span className="text-xl font-bold text-green-600">
                      ₹{(currentOrder.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <motion.button
                  onClick={closeBuyNowModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-lg font-semibold"
                >
                  Continue Shopping
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default OrderPage;