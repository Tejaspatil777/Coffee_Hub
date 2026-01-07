import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Coffee, Calendar, UtensilsCrossed, CreditCard, Clock, MapPin } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useEffect } from 'react';
import { showUnreadNotifications } from '../utils/notificationHelper';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Show unread notifications on page load for customers
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'CUSTOMER') {
      showUnreadNotifications(user.id);
    }
  }, [isAuthenticated, user]);

  const features = [
    {
      icon: Calendar,
      title: 'Easy Table Booking',
      description: 'Reserve your favorite table with just a few clicks'
    },
    {
      icon: UtensilsCrossed,
      title: 'Pre-Order Food',
      description: 'Order your meals in advance for your booking time'
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'Safe and encrypted online payment system'
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description: 'Track your order status from kitchen to table'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-indigo-950 dark:via-purple-950 dark:to-blue-950 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-foreground mb-4">
                Welcome to TakeBits
              </h1>
              <h2 className="text-muted-foreground mb-6">
                Your Smart Coffee Hub Experience
              </h2>
              <p className="text-muted-foreground mb-8">
                Book tables, order delicious food, and enjoy seamless service with real-time order tracking. 
                Experience the future of dining today!
              </p>
              <div className="flex gap-4">
                {isAuthenticated ? (
                  <>
                    <Button 
                      size="lg" 
                      onClick={() => navigate('/booking')}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                    >
                      Book a Table
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => navigate('/menu')}
                      className="border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                    >
                      View Menu
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      onClick={() => navigate('/register')}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                    >
                      Get Started
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => navigate('/menu')}
                      className="border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                    >
                      View Menu
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80"
                alt="Coffee shop interior"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-foreground mb-4">Why Choose TakeBits?</h2>
            <p className="text-muted-foreground">
              Everything you need for a perfect dining experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-indigo-200 dark:border-indigo-800 hover:shadow-xl transition-all hover:scale-105">
                <CardContent className="pt-6">
                  <feature.icon className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mb-4" />
                  <h3 className="text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Simple steps to enjoy your meal
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 dark:text-indigo-400">1</span>
              </div>
              <h3 className="mb-2 text-foreground">Create Account</h3>
              <p className="text-muted-foreground">Sign up in seconds</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 dark:text-indigo-400">2</span>
              </div>
              <h3 className="mb-2 text-foreground">Book Table</h3>
              <p className="text-muted-foreground">Choose date & time</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 dark:text-indigo-400">3</span>
              </div>
              <h3 className="mb-2 text-foreground">Order Food</h3>
              <p className="text-muted-foreground">Browse and select items</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 dark:text-indigo-400">4</span>
              </div>
              <h3 className="mb-2 text-foreground">Enjoy!</h3>
              <p className="text-muted-foreground">We'll serve it fresh</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Coffee className="h-16 w-16 mx-auto mb-6" />
          <h2 className="mb-4">Ready to Experience TakeBits?</h2>
          <p className="mb-8 text-indigo-100">
            Join us today and discover a smarter way to dine
          </p>
          {!isAuthenticated && (
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/register')}
              className="bg-white text-indigo-600 hover:bg-indigo-50"
            >
              Sign Up Now
            </Button>
          )}
        </div>
      </div>

      {/* Location & Hours */}
      <div className="py-16 px-4 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-indigo-200 dark:border-indigo-800">
              <CardContent className="pt-6">
                <MapPin className="h-8 w-8 text-amber-600 mb-4" />
                <h3 className="mb-2 text-foreground">Location</h3>
                <p className="text-muted-foreground">
                  123 Coffee Street<br />
                  Downtown District<br />
                  City, State 12345
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-indigo-200 dark:border-indigo-800">
              <CardContent className="pt-6">
                <Clock className="h-8 w-8 text-amber-600 mb-4" />
                <h3 className="mb-2 text-foreground">Opening Hours</h3>
                <p className="text-muted-foreground">
                  Monday - Friday: 7:00 AM - 10:00 PM<br />
                  Saturday - Sunday: 8:00 AM - 11:00 PM
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}