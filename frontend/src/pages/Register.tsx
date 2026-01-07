import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Coffee, User, ChefHat, UtensilsCrossed, Mail, Lock, UserCircle, Shield } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'CHEF' | 'WAITER' | 'ADMIN'>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const { register, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin-dashboard', { replace: true });
          break;
        case 'CHEF':
          navigate('/chef-dashboard', { replace: true });
          break;
        case 'WAITER':
          navigate('/waiter-dashboard', { replace: true });
          break;
        case 'CUSTOMER':
        default:
          navigate('/', { replace: true });
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(firstName, lastName, email, password, role);
      toast.success(`Account created successfully as ${role}!`);
      
      // Redirect based on role
      switch (role) {
        case 'ADMIN':
          navigate('/admin-dashboard');
          break;
        case 'CHEF':
          navigate('/chef-dashboard');
          break;
        case 'WAITER':
          navigate('/waiter-dashboard');
          break;
        case 'CUSTOMER':
        default:
          navigate('/');
          break;
      }
    } catch (error) {
      toast.error('Registration failed. Email might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-lg opacity-50"></div>
              <div className="relative bg-gradient-to-br from-primary to-accent p-4 rounded-2xl shadow-lg">
                <span className="text-5xl">☕</span>
              </div>
            </div>
          </div>
          <CardTitle className="text-foreground">Create Account</CardTitle>
          <CardDescription>Join TakeBits Coffee Hub</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-foreground">Select Your Role</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={role === 'CUSTOMER' ? 'default' : 'outline'}
                  className={`flex-col h-auto py-4 ${
                    role === 'CUSTOMER' 
                      ? 'bg-gradient-to-br from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white border-0' 
                      : 'hover:bg-primary/10 border-border bg-background/50 backdrop-blur-sm'
                  }`}
                  onClick={() => setRole('CUSTOMER')}
                >
                  <User className="h-6 w-6 mb-1" />
                  <span className="text-xs">Customer</span>
                </Button>
                <Button
                  type="button"
                  variant={role === 'CHEF' ? 'default' : 'outline'}
                  className={`flex-col h-auto py-4 ${
                    role === 'CHEF' 
                      ? 'bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0' 
                      : 'hover:bg-orange-500/10 border-border bg-background/50 backdrop-blur-sm'
                  }`}
                  onClick={() => setRole('CHEF')}
                >
                  <ChefHat className="h-6 w-6 mb-1" />
                  <span className="text-xs">Chef</span>
                </Button>
                <Button
                  type="button"
                  variant={role === 'WAITER' ? 'default' : 'outline'}
                  className={`flex-col h-auto py-4 ${
                    role === 'WAITER' 
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0' 
                      : 'hover:bg-blue-500/10 border-border bg-background/50 backdrop-blur-sm'
                  }`}
                  onClick={() => setRole('WAITER')}
                >
                  <UtensilsCrossed className="h-6 w-6 mb-1" />
                  <span className="text-xs">Waiter</span>
                </Button>
                <Button
                  type="button"
                  variant={role === 'ADMIN' ? 'default' : 'outline'}
                  className={`flex-col h-auto py-4 ${
                    role === 'ADMIN' 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0' 
                      : 'hover:bg-purple-500/10 border-border bg-background/50 backdrop-blur-sm'
                  }`}
                  onClick={() => setRole('ADMIN')}
                >
                  <Shield className="h-6 w-6 mb-1" />
                  <span className="text-xs">Admin</span>
                </Button>
              </div>
              {role !== 'CUSTOMER' && (
                <p className="text-xs text-muted-foreground mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded backdrop-blur-sm">
                  ⚠️ Staff accounts require admin approval before activation
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-2 text-foreground">
                <UserCircle className="h-4 w-4 text-primary" />
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="bg-background/50 backdrop-blur-sm border-border focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center gap-2 text-foreground">
                <UserCircle className="h-4 w-4 text-primary" />
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="bg-background/50 backdrop-blur-sm border-border focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
                <Mail className="h-4 w-4 text-primary" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 backdrop-blur-sm border-border focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-foreground">
                <Lock className="h-4 w-4 text-primary" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-background/50 backdrop-blur-sm border-border focus:border-primary focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="bg-background/50 backdrop-blur-sm border-border focus:border-primary focus:ring-primary"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-accent transition-colors">
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}