import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  UserCheck, 
  ChefHat,
  UtensilsCrossed,
  Mail,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { staffInviteService, StaffInvite } from '../services/staffInviteService';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../auth/AuthProvider';

export default function StaffInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invite, setInvite] = useState<StaffInvite | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');

  const token = searchParams.get('token');
  const role = searchParams.get('role');

  useEffect(() => {
    validateInvite();
  }, [token]);

  const validateInvite = async () => {
    setValidating(true);
    
    if (!token) {
      setError('Invalid invite link: No token provided');
      setValidating(false);
      setLoading(false);
      return;
    }

    // Simulate API delay for demo
    await new Promise(resolve => setTimeout(resolve, 800));

    const validation = staffInviteService.validateInvite(token);
    
    if (!validation.valid) {
      setError(validation.error || 'Invalid invite link');
      setValidating(false);
      setLoading(false);
      return;
    }

    setInvite(validation.invite!);
    setValidating(false);
    setLoading(false);
  };

  const handleAcceptInvite = async () => {
    if (!staffName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!token) {
      toast.error('Invalid invite token');
      return;
    }

    setAccepting(true);

    // Simulate API delay for demo
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = staffInviteService.acceptInvite(token, staffName.trim());

    if (!result.success) {
      toast.error(result.error || 'Failed to accept invite');
      setAccepting(false);
      return;
    }

    // Auto-login the staff member
    const staffUser = {
      id: result.staffId!,
      name: staffName.trim(),
      email: invite?.email || `${staffName.toLowerCase().replace(/\s+/g, '.')}@takebits.com`,
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
    }, 1500);
  };

  const getRoleIcon = (role: string) => {
    if (role === 'CHEF') {
      return <ChefHat className="h-12 w-12 text-primary" />;
    }
    return <UtensilsCrossed className="h-12 w-12 text-primary" />;
  };

  const getRoleColor = (role: string) => {
    if (role === 'CHEF') {
      return 'bg-orange-500';
    }
    return 'bg-blue-500';
  };

  if (loading || validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl border-border">
          <CardContent className="pt-12 pb-12 text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-xl text-foreground mb-2">Validating Invite...</h3>
            <p className="text-muted-foreground">Please wait while we verify your invite link</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl border-border">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="mb-6 p-4 rounded-full bg-red-500/10 w-fit mx-auto">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-xl text-foreground mb-2">Invalid Invite Link</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Possible reasons:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>The invite link has already been used</li>
                <li>The invite link has expired</li>
                <li>The invite link has been revoked</li>
                <li>Invalid or malformed invite token</li>
              </ul>
            </div>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="mt-6"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-xl border-border">
        {/* Header */}
        <CardHeader className="text-center pb-6">
          <div className="mb-6">
            <div className={`${getRoleColor(invite.role)} p-4 rounded-full w-fit mx-auto mb-4`}>
              {getRoleIcon(invite.role)}
            </div>
            <CardTitle className="text-3xl text-foreground mb-2">
              Welcome to TakeBits! ☕
            </CardTitle>
            <CardDescription className="text-lg">
              You've been invited to join as a <Badge className="ml-1 bg-primary text-white">{invite.role}</Badge>
            </CardDescription>
          </div>

          {/* Invite Details */}
          <div className="bg-muted/50 rounded-lg p-6 border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start gap-3">
                <UserCheck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Invited by</p>
                  <p className="text-sm text-foreground">{invite.invitedByName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Invited on</p>
                  <p className="text-sm text-foreground">
                    {new Date(invite.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {invite.email && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="text-sm text-foreground">{invite.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 md:col-span-2">
                <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Expires on</p>
                  <p className="text-sm text-foreground">
                    {new Date(invite.expiresAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Accept Invite Form */}
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="staffName" className="text-foreground">Your Full Name</Label>
              <Input
                id="staffName"
                placeholder="Enter your full name"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="mt-2"
                disabled={accepting}
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-2">
                This name will be displayed across the TakeBits system
              </p>
            </div>

            {/* Role Information */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <h4 className="text-sm text-foreground mb-2">Your Role: {invite.role}</h4>
              <p className="text-xs text-muted-foreground">
                {invite.role === 'CHEF' 
                  ? 'You will have access to order management, kitchen operations, and menu preparation features.'
                  : 'You will have access to table management, order serving, and customer service features.'}
              </p>
            </div>

            {/* Terms Notice */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                By accepting this invite, you agree to follow TakeBits policies and maintain the highest standards of service quality.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleAcceptInvite}
              disabled={accepting || !staffName.trim()}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-white"
              size="lg"
            >
              {accepting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Accept & Join as {invite.role}
                </>
              )}
            </Button>
            
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              disabled={accepting}
              size="lg"
            >
              Decline
            </Button>
          </div>

          {/* Demo Notice */}
          <div className="text-center pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              🔒 This is a secure invite link that can only be used once
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
