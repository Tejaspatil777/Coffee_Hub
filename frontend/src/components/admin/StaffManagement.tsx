import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  ChefHat, 
  UtensilsCrossed, 
  AlertCircle,
  CheckCircle,
  UserX,
  UserCheck,
  Activity,
  Link2,
  Copy,
  Check,
  X,
  Clock,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { 
  getAllStaff, 
  updateStaffStatus, 
  syncStaffDataWithUsers, 
  initializeStaffData,
  recalculateStaffOrdersCounts,
  type StaffData 
} from '../../services/staffManagementService';
import { handleStaffUnavailable } from '../../services/orderReassignmentService';
import { staffInviteService, StaffInvite } from '../../services/staffInviteService';
import { useAuth } from '../../auth/AuthProvider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function StaffManagement() {
  const [staff, setStaff] = useState<StaffData[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'CHEF' | 'WAITER'>('CHEF');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [showLink, setShowLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<StaffInvite[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize staff data on first load
    initializeStaffData();
    syncStaffDataWithUsers();
    loadStaff();

    // Recalculate orders count
    recalculateStaffOrdersCounts();

    // Listen for updates
    const handleStaffUpdate = () => {
      syncStaffDataWithUsers();
      loadStaff();
    };

    window.addEventListener('staffStatusUpdated', handleStaffUpdate);
    window.addEventListener('ordersUpdated', handleStaffUpdate);

    return () => {
      window.removeEventListener('staffStatusUpdated', handleStaffUpdate);
      window.removeEventListener('ordersUpdated', handleStaffUpdate);
    };
  }, []);

  const loadStaff = () => {
    recalculateStaffOrdersCounts();
    const staffData = getAllStaff();
    setStaff(staffData);
  };

  const handleToggleStatus = async (staffId: string, currentStatus: string) => {
    setLoading(true);
    
    try {
      const newStatus = currentStatus === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
      
      // If making staff unavailable, handle their orders
      if (newStatus === 'UNAVAILABLE') {
        const result = handleStaffUnavailable(staffId);
        
        // Update staff status
        updateStaffStatus(staffId, newStatus);
        
        if (result.affectedOrders.length > 0) {
          toast.warning(
            `${result.staffName} is now unavailable. ${result.affectedOrders.length} order(s) returned to queue.`,
            {
              description: 'Orders need to be reassigned to available staff',
              duration: 5000
            }
          );
        } else {
          toast.success(`${result.staffName} marked as unavailable`);
        }
      } else {
        // Making staff available again
        const staffMember = staff.find(s => s.staffId === staffId);
        updateStaffStatus(staffId, newStatus);
        toast.success(`${staffMember?.name} is now available for orders`);
      }
      
      loadStaff();
    } catch (error) {
      toast.error('Failed to update staff status');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const chefs = staff.filter(s => s.role === 'CHEF');
  const waiters = staff.filter(s => s.role === 'WAITER');
  const availableStaff = staff.filter(s => s.status === 'AVAILABLE').length;
  const unavailableStaff = staff.filter(s => s.status === 'UNAVAILABLE').length;

  const StaffCard = ({ member }: { member: StaffData }) => (
    <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className={`p-3 rounded-full ${
            member.role === 'CHEF' 
              ? 'bg-primary/10' 
              : 'bg-accent/10'
          }`}>
            {member.role === 'CHEF' ? (
              <ChefHat className="h-5 w-5 text-primary" />
            ) : (
              <UtensilsCrossed className="h-5 w-5 text-accent" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-foreground">{member.name}</p>
              <Badge variant="outline" className="border-primary text-primary">
                {member.role}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{member.email}</p>
            {member.assignedOrdersCount !== undefined && member.assignedOrdersCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {member.assignedOrdersCount} active order{member.assignedOrdersCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {member.status === 'AVAILABLE' ? (
              <Badge className="bg-green-500 text-white">
                <UserCheck className="h-3 w-3 mr-1" />
                Available
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-500 text-white">
                <UserX className="h-3 w-3 mr-1" />
                Unavailable
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {member.status === 'AVAILABLE' ? 'Set Unavailable' : 'Set Available'}
            </span>
            <Switch
              checked={member.status === 'AVAILABLE'}
              onCheckedChange={() => handleToggleStatus(member.staffId, member.status)}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const handleInviteSubmit = () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    const { invite, inviteLink } = staffInviteService.createInvite(
      inviteRole,
      user.id,
      user.name,
      inviteEmail || undefined
    );

    setGeneratedLink(inviteLink);
    setShowLink(true);
    toast.success('Invite link generated! ☕');
    
    // Load pending invites
    setPendingInvites(staffInviteService.getPendingInvites());
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const loadPendingInvites = () => {
    setPendingInvites(staffInviteService.getPendingInvites());
  };

  useEffect(() => {
    loadPendingInvites();

    const handleInviteUpdate = () => {
      loadPendingInvites();
    };

    window.addEventListener('inviteCreated', handleInviteUpdate);
    window.addEventListener('inviteAccepted', handleInviteUpdate);

    return () => {
      window.removeEventListener('inviteCreated', handleInviteUpdate);
      window.removeEventListener('inviteAccepted', handleInviteUpdate);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl text-foreground mt-1">{staff.length}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl text-green-600 dark:text-green-400 mt-1">{availableStaff}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unavailable</p>
                <p className="text-2xl text-gray-600 dark:text-gray-400 mt-1">{unavailableStaff}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Staff Availability Management</CardTitle>
          <CardDescription className="text-muted-foreground">
            Toggle staff availability. When marked unavailable, their preparing orders return to queue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chefs Section */}
          {chefs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ChefHat className="h-5 w-5 text-primary" />
                <h3 className="text-foreground">Chefs ({chefs.length})</h3>
              </div>
              <div className="space-y-3">
                {chefs.map(chef => (
                  <StaffCard key={chef.staffId} member={chef} />
                ))}
              </div>
            </div>
          )}

          {chefs.length > 0 && waiters.length > 0 && (
            <Separator className="bg-border" />
          )}

          {/* Waiters Section */}
          {waiters.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <UtensilsCrossed className="h-5 w-5 text-accent" />
                <h3 className="text-foreground">Waiters ({waiters.length})</h3>
              </div>
              <div className="space-y-3">
                {waiters.map(waiter => (
                  <StaffCard key={waiter.staffId} member={waiter} />
                ))}
              </div>
            </div>
          )}

          {staff.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No staff members found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add staff members from the Staff tab to enable availability management
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-foreground">
                <strong>How it works:</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Toggle staff between Available and Unavailable status</li>
                <li>When staff becomes unavailable, their preparing orders automatically return to queue</li>
                <li>Customers receive notifications about order delays</li>
                <li>Unavailable staff cannot be assigned new orders</li>
                <li>Use the Order Reassignment tab to assign queued orders to available staff</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Staff Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogTrigger className="hidden">Invite Staff</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Staff</DialogTitle>
            <DialogDescription>
              Invite a new staff member to your restaurant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="email@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={inviteRole}
                onValueChange={(value) => setInviteRole(value as 'CHEF' | 'WAITER')}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role">
                    {inviteRole}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHEF">Chef</SelectItem>
                  <SelectItem value="WAITER">Waiter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setInviteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleInviteSubmit}
            >
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Staff Button */}
      <Button
        type="button"
        onClick={() => setInviteDialogOpen(true)}
      >
        Invite Staff
      </Button>
    </div>
  );
}