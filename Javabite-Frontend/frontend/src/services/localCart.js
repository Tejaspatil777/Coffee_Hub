// Local Cart Service - UI Simulation Only
// All functions use localStorage - NO API CALLS
// TODO: Replace localStorage operations with actual API calls when backend is ready

/**
 * Get current cart from localStorage
 * TODO: Replace with API call - GET /cart
 */
export const getCart = () => {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
};

/**
 * Add item to cart
 * TODO: Replace with API call - POST /cart/add
 * @param {Object} item - Menu item to add {id, name, price, image, description}
 */
export const addToCart = (item) => {
  const cart = getCart();
  const existingItem = cart.find(cartItem => cartItem.id === item.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  return cart;
};

/**
 * Remove item from cart
 * TODO: Replace with API call - DELETE /cart/item/{itemId}
 * @param {string} itemId - Item ID to remove
 */
export const removeFromCart = (itemId) => {
  const cart = getCart();
  const updatedCart = cart.filter(item => item.id !== itemId);
  localStorage.setItem('cart', JSON.stringify(updatedCart));
  return updatedCart;
};

/**
 * Update item quantity in cart
 * TODO: Replace with API call - PATCH /cart/item/{itemId}
 * @param {string} itemId - Item ID
 * @param {number} quantity - New quantity
 */
export const updateQty = (itemId, quantity) => {
  const cart = getCart();
  const item = cart.find(cartItem => cartItem.id === itemId);

  if (item) {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }
    item.quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  return cart;
};

/**
 * Clear entire cart
 * TODO: Replace with API call - DELETE /cart/clear
 */
export const clearCart = () => {
  localStorage.setItem('cart', JSON.stringify([]));
  return [];
};

/**
 * Get cart item count
 */
export const getCartCount = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Get cart total amount
 */
export const getCartTotal = () => {
  const cart = getCart();
  // Convert cents → currency unit
  return cart.reduce((total, item) => total + (item.price / 100) * item.quantity, 0);
};

/**
 * Place order from cart items
 * TODO: Replace with API call - POST /order/create
 * @param {Array} cartItems - Items in cart
 */
export const placeOrder = (cartItems) => {
  const orders = getOrders();
  const newOrder = {
    id: `ORD${Date.now()}`,
    items: cartItems.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price / 100, // Convert cents → currency unit
    })),
    total: getCartTotal(),
    status: 'Pending',
    date: new Date().toISOString(),
    timestamp: Date.now()
  };

  orders.unshift(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));
  clearCart();

  return newOrder;
};

/**
 * Buy now - instant order (skip cart)
 * TODO: Replace with API call - POST /order/create
 * @param {Object} item - Single item to order
 */
export const buyNow = (item) => {
  const orders = getOrders();
  const newOrder = {
    id: `ORD${Date.now()}`,
    items: [{
      id: item.id,
      name: item.name,
      quantity: 1,
      price: item.price / 100, // Convert cents → currency unit
    }],
    total: item.price / 100,
    status: 'Pending',
    date: new Date().toISOString(),
    timestamp: Date.now()
  };

  orders.unshift(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));

  return newOrder;
};

/**
 * Get all orders
 * TODO: Replace with API call - GET /order/my-orders
 */
export const getOrders = () => {
  const orders = localStorage.getItem('orders');
  return orders ? JSON.parse(orders) : [];
};

/**
 * Update order status
 * TODO: Replace with API call - PATCH /order/{orderId}/status
 * @param {string} orderId - Order ID
 * @param {string} status - New status (Pending, Preparing, Ready, Delivered)
 */
export const updateOrderStatus = (orderId, status) => {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);

  if (order) {
    order.status = status;
    order.lastUpdated = new Date().toISOString();
    localStorage.setItem('orders', JSON.stringify(orders));
  }

  return orders;
};

/**
 * Get single order by ID
 * TODO: Replace with API call - GET /order/{orderId}
 */
export const getOrderById = (orderId) => {
  const orders = getOrders();
  return orders.find(o => o.id === orderId);
};
