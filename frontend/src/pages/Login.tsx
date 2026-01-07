import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Mail, Lock, ArrowLeft, UserPlus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { staffInviteService } from '../services/staffInviteService';
import { Badge } from '../components/ui/badge';

export default function Login() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');
  const inviteRole = searchParams.get('role');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  
  // Invite-specific states
  const [isInviteMode, setIsInviteMode] = useState(false);
  const [inviteValid, setInviteValid] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [staffName, setStaffName] = useState('');
  const [inviteDetails, setInviteDetails] = useState<any>(null);
  
  const { login, user, isAuthenticated } = useAuth();
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

  // Check invite token on component mount
  useEffect(() => {
    if (inviteToken && inviteRole) {
      setIsInviteMode(true);
      validateInviteToken();
    }
  }, [inviteToken, inviteRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      
      // Get the user from localStorage after login to determine role
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        
        // Redirect based on role
        switch (userData.role) {
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
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate sending OTP to email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real app: await authApi.forgotPassword({ email: resetEmail });
      
      toast.success(`OTP sent to ${resetEmail}`);
      setShowOTPVerification(true);
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Simulate OTP verification and password reset
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real app: 
      // await authApi.verifyOTP({ email: resetEmail, otp });
      // await authApi.resetPassword({ email: resetEmail, otp, newPassword });
      
      toast.success('Password reset successful! Please login with your new password.');
      setShowForgotPassword(false);
      setShowOTPVerification(false);
      setResetEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Invalid OTP or reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetToLogin = () => {
    setShowForgotPassword(false);
    setShowOTPVerification(false);
    setResetEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const validateInviteToken = async () => {
    if (!inviteToken) return;

    const validation = staffInviteService.validateInvite(inviteToken);
    
    if (validation.valid && validation.invite) {
      setInviteValid(true);
      setInviteDetails(validation.invite);
      toast.info(`You've been invited to join as ${validation.invite.role}`, {
        description: `Invited by ${validation.invite.invitedByName}`
      });
    } else {
      setInviteValid(false);
      setInviteError(validation.error || 'Invalid invite token');
      toast.error('Invalid invite link', {
        description: validation.error
      });
    }
  };

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!staffName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!inviteToken) return;

    setLoading(true);

    try {
      // Accept invite and create staff account
      const result = staffInviteService.acceptInvite(inviteToken, staffName.trim());

      if (!result.success) {
        toast.error(result.error || 'Failed to accept invite');
        setLoading(false);
        return;
      }

      // Auto-login the new staff member
      const staffUser = {
        id: result.staffId!,
        name: staffName.trim(),
        email: inviteDetails?.email || `${staffName.toLowerCase().replace(/\s+/g, '.')}@takebits.com`,
        role: result.role as 'CHEF' | 'WAITER'
      };

      login(staffUser);

      toast.success(`Welcome to TakeBits! ☕`, {
        description: `You've joined as a ${result.role}`
      });

      // Redirect to appropriate dashboard
      setTimeout(() => {
        if (result.role === 'CHEF') {
          navigate('/chef-dashboard');
        } else {
          navigate('/waiter-dashboard');
        }
      }, 1000);
    } catch (error) {
      toast.error('Failed to accept invite');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
          <CardTitle className="text-foreground">
            {showForgotPassword 
              ? (showOTPVerification ? 'Reset Password' : 'Forgot Password') 
              : isInviteMode 
                ? `Join TakeBits as ${inviteDetails?.role || 'Staff'} ☕`
                : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {showForgotPassword
              ? (showOTPVerification ? 'Enter OTP and new password' : 'Enter your email to receive OTP')
              : isInviteMode
                ? inviteValid 
                  ? `Invited by ${inviteDetails?.invitedByName}` 
                  : 'Invalid or expired invite link'
                : 'Login to your TakeBits account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isInviteMode && inviteValid ? (
            // Staff Invite Acceptance Form
            <form onSubmit={handleAcceptInvite} className="space-y-4">
              {/* Invite Details Banner */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary text-white">
                    {inviteDetails?.role}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Invited {new Date(inviteDetails?.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-foreground">
                  You're joining the TakeBits team! Please enter your name to complete the onboarding.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="staffName" className="flex items-center gap-2 text-foreground">
                  <UserPlus className="h-4 w-4 text-primary" />
                  Your Full Name
                </Label>
                <Input
                  id="staffName"
                  type="text"
                  placeholder="Enter your full name"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  required
                  className="bg-background/50 backdrop-blur-sm border-border focus:border-primary focus:ring-primary"
                  autoFocus
                />
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground">
                  ✓ Your role will be automatically set to <strong>{inviteDetails?.role}</strong>
                  <br />
                  ✓ You'll gain access to the {inviteDetails?.role === 'CHEF' ? 'Chef' : 'Waiter'} Dashboard
                  <br />
                  ✓ This invite link can only be used once
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  'Joining...'
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Accept Invite & Join TakeBits
                  </>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Decline and go to homepage
                </button>
              </div>
            </form>
          ) : isInviteMode && !inviteValid ? (
            // Invalid Invite Error
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">{inviteError}</p>
              </div>
              <Button
                onClick={() => navigate('/')}
                className="w-full"
                variant="outline"
              >
                Return to Homepage
              </Button>
            </div>
          ) : !showForgotPassword ? (
            // Login Form
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  Email
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
                  className="bg-background/50 backdrop-blur-sm border-border focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <Link to="/register" className="text-sm text-primary hover:text-accent transition-colors">
                  Create account
                </Link>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:text-accent transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          ) : !showOTPVerification ? (
            // Forgot Password - Email Form
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <Button
                type="button"
                variant="ghost"
                onClick={resetToLogin}
                className="mb-2 gap-2 hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Button>

              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-foreground">Email Address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="your@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="bg-background/50 backdrop-blur-sm border-border"
                />
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm text-foreground backdrop-blur-sm">
                <p>We'll send a One-Time Password (OTP) to your email address to verify your identity.</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg"
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            // OTP Verification and Reset Password Form
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowOTPVerification(false)}
                className="mb-2 gap-2 hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-sm text-green-800 dark:text-green-200 mb-4 backdrop-blur-sm">
                OTP sent to <strong>{resetEmail}</strong>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-foreground">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="text-center text-lg tracking-widest bg-background/50 backdrop-blur-sm border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-foreground">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-background/50 backdrop-blur-sm border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-foreground">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-background/50 backdrop-blur-sm border-border"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg"
                disabled={loading}
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}