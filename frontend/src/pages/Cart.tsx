import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Calendar, Clock, AlertCircle, Smartphone, Wallet, Building2, Banknote, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../auth/AuthProvider';
import { getBookingsByCustomer } from '../services/bookingService';
import { createOrder } from '../services/orderManagementService';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { createPaymentTransaction, PaymentMode, formatPaymentMode } from '../services/paymentService';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Textarea } from '../components/ui/textarea';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<PaymentMode>('UPI');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [specialRequirements, setSpecialRequirements] = useState('');

  // Payment method options
  const paymentMethods = [
    { id: 'UPI' as PaymentMode, name: 'UPI', icon: Smartphone, description: 'Pay using UPI apps' },
    { id: 'GOOGLE_PAY' as PaymentMode, name: 'Google Pay', icon: Smartphone, description: 'Google Pay wallet' },
    { id: 'PHONEPE' as PaymentMode, name: 'PhonePe', icon: Smartphone, description: 'PhonePe wallet' },
    { id: 'PAYTM' as PaymentMode, name: 'Paytm', icon: Wallet, description: 'Paytm wallet' },
    { id: 'CREDIT_CARD' as PaymentMode, name: 'Credit Card', icon: CreditCard, description: 'Visa, Mastercard, etc.' },
    { id: 'DEBIT_CARD' as PaymentMode, name: 'Debit Card', icon: CreditCard, description: 'Debit card payment' },
    { id: 'NET_BANKING' as PaymentMode, name: 'Net Banking', icon: Building2, description: 'All major banks' },
    { id: 'CASH_ON_DELIVERY' as PaymentMode, name: 'Cash on Delivery', icon: Banknote, description: 'Pay at table' },
  ];

  useEffect(() => {
    loadCart();
    loadBooking();
  }, [user]);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  };

  const loadBooking = () => {
    if (!user) return;
    
    // Get the customer's confirmed booking
    const bookings = getBookingsByCustomer(user.id);
    const confirmedBooking = bookings.find(b => b.status === 'CONFIRMED');
    
    if (confirmedBooking) {
      setBooking(confirmedBooking);
    } else {
      setBooking(null);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0);

    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success('Item removed from cart');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!booking) {
      toast.error('Please book a table first and wait for admin approval');
      navigate('/booking');
      return;
    }

    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create order using order management service
      const newOrder = createOrder({
        customerId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        items: cartItems,
        booking: booking,
        subtotal,
        tax,
        total,
        status: 'PENDING',
        paymentStatus: 'PAID',
        specialRequirements: specialRequirements || undefined,
        preparationTime: Math.ceil(cartItems.length * 5 + 10), // 5 min per item + 10 base minutes
        estimatedDeliveryTime: new Date(Date.now() + (cartItems.length * 5 + 10) * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        tableNumber: booking.tableNumber
      });

      // Create payment transaction record
      createPaymentTransaction({
        customerId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        bookingId: booking.id,
        orderId: newOrder.id,
        amount: total,
        paymentMode: selectedPaymentMode,
        paymentStatus: 'PAID',
        tableNumber: booking.tableNumber,
        locationName: booking.locationName,
        items: cartItems,
      });

      // Clear cart and special requirements
      localStorage.removeItem('cart');
      setSpecialRequirements('');
      window.dispatchEvent(new Event('cartUpdated'));

      toast.success('Order placed successfully! 🎉', {
        description: `Payment of $${total.toFixed(2)} completed via ${formatPaymentMode(selectedPaymentMode)}`
      });
      navigate('/orders');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-foreground mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">Review your order before checkout</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="mb-2 text-foreground">Your cart is empty</h3>
                  <p className="text-muted-foreground mb-4">Add items from our menu</p>
                  <Button onClick={() => navigate('/menu')} className="bg-primary hover:bg-accent text-white">
                    Browse Menu
                  </Button>
                </CardContent>
              </Card>
            ) : (
              cartItems.map(item => (
                <Card key={item.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-foreground">{item.name}</h3>
                            <p className="text-primary">${item.price.toFixed(2)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="border-primary text-primary hover:bg-primary hover:text-white"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center text-foreground">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="border-primary text-primary hover:bg-primary hover:text-white"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <span className="ml-auto text-foreground">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            {/* Booking Info */}
            {booking && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Calendar className="h-5 w-5 text-primary" />
                    Reservation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Table:</span>
                    <Badge className="bg-primary text-white">{booking.tableNumber}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="text-foreground">{new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="flex items-center gap-1 text-foreground">
                      <Clock className="h-3 w-3 text-primary" />
                      {booking.timeSlot}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests:</span>
                    <span className="text-foreground">{booking.guests}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {!booking && cartItems.length > 0 && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-6">
                  <p className="text-primary mb-3">Please book a table first</p>
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                    onClick={() => navigate('/booking')}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Table
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Payment Method */}
            <Card className="bg-card border-border">
              <CardHeader 
                className="cursor-pointer hover:bg-primary/5 transition-colors rounded-t-lg"
                onClick={() => setShowPaymentMethods(!showPaymentMethods)}
              >
                <CardTitle className="flex items-center justify-between text-foreground">
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Method
                  </span>
                  {showPaymentMethods ? (
                    <ChevronUp className="h-5 w-5 text-primary transition-transform" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-primary transition-transform" />
                  )}
                </CardTitle>
                {!showPaymentMethods && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {formatPaymentMode(selectedPaymentMode)}
                  </p>
                )}
              </CardHeader>
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  showPaymentMethods ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <CardContent className="space-y-3 pt-4">
                  <RadioGroup
                    value={selectedPaymentMode}
                    onValueChange={(value) => setSelectedPaymentMode(value as PaymentMode)}
                    className="space-y-2"
                  >
                    {paymentMethods.map(method => {
                      const Icon = method.icon;
                      return (
                        <div
                          key={method.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                            selectedPaymentMode === method.id
                              ? 'border-primary bg-primary/10 shadow-sm scale-[1.02]'
                              : 'border-border hover:border-primary/50 hover:bg-primary/5'
                          }`}
                          onClick={() => setSelectedPaymentMode(method.id)}
                        >
                          <RadioGroupItem value={method.id} id={method.id} className="border-primary text-primary" />
                          <Icon className={`h-5 w-5 transition-colors ${selectedPaymentMode === method.id ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div className="flex-1">
                            <Label htmlFor={method.id} className="text-foreground cursor-pointer">{method.name}</Label>
                            <p className="text-muted-foreground text-xs">{method.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </CardContent>
              </div>
            </Card>

            {/* Special Requirements Section */}
            {cartItems.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Special Requirements
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add any special instructions for your order (e.g., "no sugar", "extra hot")
                  </p>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Enter your special requirements here..."
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    className="bg-input-background border-border text-foreground min-h-[100px] resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {specialRequirements.length}/500 characters
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Order Summary */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="text-foreground">${tax.toFixed(2)}</span>
                  </div>
                  <Separator className="bg-border" />
                  <div className="flex justify-between">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-accent text-white"
                  onClick={handleCheckout}
                  disabled={loading || cartItems.length === 0 || !booking}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </Button>

                <p className="text-center text-muted-foreground">
                  Secure payment processing
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}