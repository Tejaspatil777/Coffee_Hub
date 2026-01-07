// Staff Invite Service - Demo Implementation
// Backend-ready structure for role-based invite links

/*
API (Future):
POST /api/staff/invite
  - Generate token
  - Save invite
  - Send email with invite link
  - Return invite details

POST /api/staff/accept-invite
  - Validate token
  - Create staff account
  - Assign role
  - Mark invite as accepted

GET /api/staff/validate-invite
  - Check token validity
  - Return invite details if valid

GET /api/staff/invites
  - List all invites (admin only)
  - Filter by status, role

DELETE /api/staff/invites/:id
  - Revoke invite (admin only)

Controller Logic:
- Generate secure token (UUID or JWT)
- Save invite with expiry
- Email service integration
- Role-based access control
- One-time use validation
*/

export interface StaffInvite {
  id: string;
  token: string;
  role: 'CHEF' | 'WAITER';
  invitedBy: string;
  invitedByName: string;
  email?: string; // Optional for demo, required for production
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  createdAt: string;
  acceptedAt?: string;
  expiresAt: string;
  acceptedByName?: string;
  acceptedById?: string;
}

class StaffInviteService {
  private storageKey = 'takebits_staff_invites';
  private inviteLinkBase = window.location.origin + '/login';

  // Generate unique invite token
  private generateToken(): string {
    return `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create new staff invite
  createInvite(
    role: 'CHEF' | 'WAITER',
    invitedBy: string,
    invitedByName: string,
    email?: string
  ): { invite: StaffInvite; inviteLink: string } {
    const invites = this.getAllInvites();
    
    const token = this.generateToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days expiry

    const invite: StaffInvite = {
      id: `inv_${Date.now()}`,
      token,
      role,
      invitedBy,
      invitedByName,
      email,
      status: 'PENDING',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    invites.push(invite);
    localStorage.setItem(this.storageKey, JSON.stringify(invites));

    // Generate invite link
    const inviteLink = `${this.inviteLinkBase}?token=${token}&role=${role}`;

    // Trigger event for real-time updates
    window.dispatchEvent(new CustomEvent('inviteCreated', { detail: invite }));

    return { invite, inviteLink };
  }

  // Validate invite token
  validateInvite(token: string): { valid: boolean; invite?: StaffInvite; error?: string } {
    const invites = this.getAllInvites();
    const invite = invites.find(inv => inv.token === token);

    if (!invite) {
      return { valid: false, error: 'Invalid invite link' };
    }

    if (invite.status === 'ACCEPTED') {
      return { valid: false, error: 'This invite has already been used' };
    }

    if (invite.status === 'REVOKED') {
      return { valid: false, error: 'This invite has been revoked' };
    }

    // Check expiry
    const now = new Date();
    const expiresAt = new Date(invite.expiresAt);
    
    if (now > expiresAt) {
      // Auto-update status to expired
      this.updateInviteStatus(invite.id, 'EXPIRED');
      return { valid: false, error: 'This invite link has expired' };
    }

    return { valid: true, invite };
  }

  // Accept invite and create staff account
  acceptInvite(
    token: string,
    staffName: string
  ): { success: boolean; error?: string; staffId?: string; role?: string } {
    const validation = this.validateInvite(token);
    
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const invite = validation.invite!;

    // Create staff user account
    const staffId = `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const staffUser = {
      id: staffId,
      name: staffName,
      email: invite.email || `${staffName.toLowerCase().replace(/\s+/g, '.')}@takebits.com`,
      role: invite.role,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      inviteId: invite.id
    };

    // Add to users storage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(staffUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Update invite status
    const invites = this.getAllInvites();
    const inviteIndex = invites.findIndex(inv => inv.id === invite.id);
    
    if (inviteIndex !== -1) {
      invites[inviteIndex] = {
        ...invites[inviteIndex],
        status: 'ACCEPTED',
        acceptedAt: new Date().toISOString(),
        acceptedByName: staffName,
        acceptedById: staffId
      };
      localStorage.setItem(this.storageKey, JSON.stringify(invites));
    }

    // Trigger event for real-time updates
    window.dispatchEvent(new CustomEvent('inviteAccepted', { 
      detail: { invite: invites[inviteIndex], staffId } 
    }));

    return { 
      success: true, 
      staffId,
      role: invite.role 
    };
  }

  // Get all invites
  getAllInvites(): StaffInvite[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  // Get invite by ID
  getInviteById(id: string): StaffInvite | null {
    const invites = this.getAllInvites();
    return invites.find(inv => inv.id === id) || null;
  }

  // Get invites by admin
  getInvitesByAdmin(adminId: string): StaffInvite[] {
    return this.getAllInvites().filter(inv => inv.invitedBy === adminId);
  }

  // Get pending invites
  getPendingInvites(): StaffInvite[] {
    const invites = this.getAllInvites();
    const now = new Date();

    return invites.filter(inv => {
      if (inv.status !== 'PENDING') return false;
      
      const expiresAt = new Date(inv.expiresAt);
      if (now > expiresAt) {
        // Auto-update expired invites
        this.updateInviteStatus(inv.id, 'EXPIRED');
        return false;
      }
      
      return true;
    });
  }

  // Update invite status
  updateInviteStatus(inviteId: string, status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'): boolean {
    const invites = this.getAllInvites();
    const inviteIndex = invites.findIndex(inv => inv.id === inviteId);

    if (inviteIndex === -1) return false;

    invites[inviteIndex] = {
      ...invites[inviteIndex],
      status
    };

    localStorage.setItem(this.storageKey, JSON.stringify(invites));
    
    // Trigger event for real-time updates
    window.dispatchEvent(new CustomEvent('inviteUpdated', { detail: invites[inviteIndex] }));

    return true;
  }

  // Revoke invite
  revokeInvite(inviteId: string): boolean {
    return this.updateInviteStatus(inviteId, 'REVOKED');
  }

  // Delete invite (admin only)
  deleteInvite(inviteId: string): boolean {
    const invites = this.getAllInvites();
    const filtered = invites.filter(inv => inv.id !== inviteId);

    if (filtered.length === invites.length) return false;

    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    
    // Trigger event for real-time updates
    window.dispatchEvent(new CustomEvent('inviteDeleted', { detail: { inviteId } }));

    return true;
  }

  // Get invite statistics
  getInviteStats(): {
    total: number;
    pending: number;
    accepted: number;
    expired: number;
    revoked: number;
    byRole: { CHEF: number; WAITER: number };
  } {
    const invites = this.getAllInvites();
    
    return {
      total: invites.length,
      pending: invites.filter(inv => inv.status === 'PENDING').length,
      accepted: invites.filter(inv => inv.status === 'ACCEPTED').length,
      expired: invites.filter(inv => inv.status === 'EXPIRED').length,
      revoked: invites.filter(inv => inv.status === 'REVOKED').length,
      byRole: {
        CHEF: invites.filter(inv => inv.role === 'CHEF').length,
        WAITER: invites.filter(inv => inv.role === 'WAITER').length
      }
    };
  }

  // Clean up expired invites
  cleanupExpiredInvites(): number {
    const invites = this.getAllInvites();
    const now = new Date();
    let cleanedCount = 0;

    invites.forEach(invite => {
      if (invite.status === 'PENDING') {
        const expiresAt = new Date(invite.expiresAt);
        if (now > expiresAt) {
          this.updateInviteStatus(invite.id, 'EXPIRED');
          cleanedCount++;
        }
      }
    });

    return cleanedCount;
  }
}

export const staffInviteService = new StaffInviteService();