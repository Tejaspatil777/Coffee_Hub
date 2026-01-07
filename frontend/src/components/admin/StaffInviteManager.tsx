import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Link2, 
  Copy, 
  Check,
  ChefHat,
  UtensilsCrossed,
  Mail,
  Clock,
  XCircle,
  UserCheck,
  Calendar,
  Send,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { staffInviteService, StaffInvite } from '../../services/staffInviteService';
import { useAuth } from '../../auth/AuthProvider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';

export function StaffInviteManager() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<StaffInvite[]>([]);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'CHEF' | 'WAITER'>('CHEF');
  const [optionalEmail, setOptionalEmail] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [showGeneratedLink, setShowGeneratedLink] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadInvites();

    // Listen for invite updates
    const handleInviteUpdate = () => {
      loadInvites();
    };

    window.addEventListener('inviteCreated', handleInviteUpdate);
    window.addEventListener('inviteAccepted', handleInviteUpdate);
    window.addEventListener('inviteUpdated', handleInviteUpdate);
    window.addEventListener('inviteDeleted', handleInviteUpdate);

    return () => {
      window.removeEventListener('inviteCreated', handleInviteUpdate);
      window.removeEventListener('inviteAccepted', handleInviteUpdate);
      window.removeEventListener('inviteUpdated', handleInviteUpdate);
      window.removeEventListener('inviteDeleted', handleInviteUpdate);
    };
  }, []);

  const loadInvites = () => {
    // Clean up expired invites first
    staffInviteService.cleanupExpiredInvites();
    
    // Load all invites
    const allInvites = staffInviteService.getAllInvites();
    
    // Sort by created date (newest first)
    const sortedInvites = allInvites.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    setInvites(sortedInvites);
  };

  const handleGenerateInvite = () => {
    if (!user) return;

    const { invite, inviteLink } = staffInviteService.createInvite(
      selectedRole,
      user.id,
      user.name,
      optionalEmail || undefined
    );

    setGeneratedLink(inviteLink);
    setShowGeneratedLink(true);
    setOptionalEmail('');
    
    toast.success('Invite link generated! ☕', {
      description: `Copy and share the link to invite a ${selectedRole}`
    });

    loadInvites();
  };

  const handleCopyLink = (link: string, inviteId: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(inviteId);
    toast.success('Link copied to clipboard!');
    
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleRevokeInvite = (inviteId: string) => {
    if (confirm('Are you sure you want to revoke this invite? The link will no longer work.')) {
      staffInviteService.revokeInvite(inviteId);
      toast.success('Invite revoked successfully');
      loadInvites();
    }
  };

  const handleDeleteInvite = (inviteId: string) => {
    if (confirm('Are you sure you want to delete this invite record?')) {
      staffInviteService.deleteInvite(inviteId);
      toast.success('Invite deleted successfully');
      loadInvites();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case 'ACCEPTED':
        return <Badge className="bg-green-500 text-white">Accepted</Badge>;
      case 'EXPIRED':
        return <Badge variant="secondary" className="bg-gray-500 text-white">Expired</Badge>;
      case 'REVOKED':
        return <Badge variant="secondary" className="bg-red-500 text-white">Revoked</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'CHEF' 
      ? <ChefHat className="h-4 w-4 text-primary" />
      : <UtensilsCrossed className="h-4 w-4 text-accent" />;
  };

  const stats = staffInviteService.getInviteStats();
  const pendingInvites = invites.filter(inv => inv.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl text-foreground mb-2">Staff Invite Links</h3>
          <p className="text-sm text-muted-foreground">
            Generate and manage role-based invite links for new staff members
          </p>
        </div>
        
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent text-white">
              <Link2 className="h-4 w-4 mr-2" />
              Generate Invite Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Staff Invite Link</DialogTitle>
              <DialogDescription>
                Create a unique invite link for a new staff member
              </DialogDescription>
            </DialogHeader>
            
            {!showGeneratedLink ? (
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="role">Staff Role *</Label>
                  <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CHEF">
                        <div className="flex items-center gap-2">
                          <ChefHat className="h-4 w-4" />
                          Chef
                        </div>
                      </SelectItem>
                      <SelectItem value="WAITER">
                        <div className="flex items-center gap-2">
                          <UtensilsCrossed className="h-4 w-4" />
                          Waiter
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="staff@example.com"
                    value={optionalEmail}
                    onChange={(e) => setOptionalEmail(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Optional: For record keeping only (not used for email sending in demo)
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground">
                    📧 <strong>Note:</strong> In production, this would send an email with the invite link. 
                    For demo purposes, you'll copy and share the link manually.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <Check className="h-5 w-5 text-green-500" />
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Invite link generated successfully!
                  </p>
                </div>

                <div>
                  <Label>Invite Link</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={generatedLink}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="icon"
                      onClick={() => handleCopyLink(generatedLink, 'temp')}
                      className="flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2 text-sm text-muted-foreground">
                  <p>✅ Share this link with the new {selectedRole.toLowerCase()}</p>
                  <p>🔒 Link expires in 7 days</p>
                  <p>🔑 One-time use only</p>
                  <p>👤 Auto-assigns {selectedRole} role on acceptance</p>
                </div>
              </div>
            )}

            <DialogFooter>
              {!showGeneratedLink ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowInviteDialog(false);
                      setOptionalEmail('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerateInvite}
                    className="bg-gradient-to-r from-primary to-accent text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Generate Link
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setShowInviteDialog(false);
                    setShowGeneratedLink(false);
                    setGeneratedLink('');
                  }}
                  className="w-full"
                >
                  Done
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-0">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invites</p>
                <p className="text-2xl text-foreground mt-1">{stats.total}</p>
              </div>
              <Link2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-0">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl text-yellow-600 dark:text-yellow-400 mt-1">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-0">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="text-2xl text-green-600 dark:text-green-400 mt-1">{stats.accepted}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-0">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chefs / Waiters</p>
                <p className="text-lg text-foreground mt-1">{stats.byRole.CHEF} / {stats.byRole.WAITER}</p>
              </div>
              <ChefHat className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invites List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Invite History</CardTitle>
          <CardDescription className="text-muted-foreground">
            Track and manage all staff invite links
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <div className="text-center py-12">
              <Link2 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No invites generated yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Click "Generate Invite Link" to create your first staff invite
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {invites.map((invite) => {
                  const inviteLink = `${window.location.origin}/staff-invite?token=${invite.token}&role=${invite.role}`;
                  const canCopy = invite.status === 'PENDING';
                  
                  return (
                    <div 
                      key={invite.id} 
                      className={`p-4 rounded-lg border transition-all ${ 
                        invite.status === 'PENDING' 
                          ? 'border-primary/30 bg-primary/5' 
                          : 'border-border bg-muted/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center gap-2 mb-2">
                            {getRoleIcon(invite.role)}
                            <Badge variant="outline" className="border-primary/20">
                              {invite.role}
                            </Badge>
                            {getStatusBadge(invite.status)}
                            {invite.status === 'PENDING' && (
                              <Badge variant="outline" className="border-yellow-500/20 text-yellow-600">
                                <Clock className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </div>

                          {/* Details */}
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <UserCheck className="h-3 w-3" />
                              <span>Invited by: {invite.invitedByName}</span>
                            </div>
                            
                            {invite.email && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span>{invite.email}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Created: {new Date(invite.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>

                            {invite.status === 'ACCEPTED' && invite.acceptedByName && (
                              <div className="flex items-center gap-2 text-green-600">
                                <Check className="h-3 w-3" />
                                <span>Accepted by: {invite.acceptedByName}</span>
                                {invite.acceptedAt && (
                                  <span className="text-xs text-muted-foreground">
                                    on {new Date(invite.acceptedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            )}

                            {invite.status === 'PENDING' && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span className="text-xs">
                                  Expires: {new Date(invite.expiresAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Invite Link (for pending invites) */}
                          {invite.status === 'PENDING' && (
                            <div className="mt-3 p-2 rounded bg-muted/50 border border-border">
                              <div className="flex items-center gap-2">
                                <code className="text-xs text-foreground truncate flex-1 font-mono">
                                  {inviteLink}
                                </code>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCopyLink(inviteLink, invite.id)}
                                  className="flex-shrink-0"
                                >
                                  {copiedId === invite.id ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          {invite.status === 'PENDING' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevokeInvite(invite.id)}
                              className="border-red-500/20 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Revoke
                            </Button>
                          )}
                          
                          {(invite.status === 'EXPIRED' || invite.status === 'REVOKED' || invite.status === 'ACCEPTED') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteInvite(invite.id)}
                              className="border-gray-500/20"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Demo Notice */}
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-blue-500/20 flex-shrink-0">
            <Mail className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-sm">
            <p className="text-foreground mb-1">
              <strong>Demo Mode:</strong> Email Integration
            </p>
            <p className="text-muted-foreground">
              In production, invite links would be sent automatically via email using a service like SendGrid, 
              Resend, or AWS SES. For this demo, copy and share links manually.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
