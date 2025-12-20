import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mail, Trash2, ChefHat, User, X, Calendar, Copy, Check, Users, MailX } from 'lucide-react';
import { toast } from 'react-toastify';

const API_BASE = "http://localhost:8080";

function AdminStaff() {
  const [pendingInvites, setPendingInvites] = useState([]);
  const [registeredStaff, setRegisteredStaff] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('registered');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'chef',
  });

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { 
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    } : { "Content-Type": "application/json" };
  };

  // Load registered staff - FIXED VERSION
  const loadRegisteredStaff = async () => {
    try {
      console.log("🚀 Loading registered staff...");
      
      const res = await fetch(`${API_BASE}/api/admin/staff/registered`, {
        method: "GET",
        headers: getAuthHeader(),
      });

      console.log("📡 Response status:", res.status);
      
      if (res.status === 403 || res.status === 401) {
        handleAuthError();
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ Loaded registered staff:", data);

      // ✅ NORMALIZE ROLES: Convert "CHEF" → "chef", "WAITER" → "waiter"
      const normalizedStaff = (data.staff || []).map(staff => ({
        ...staff,
        role: staff.role.toLowerCase(),
        id: staff.id || `staff-${Date.now()}`,
        createdAt: staff.createdAt || new Date().toISOString()
      }));

      console.log("👥 Normalized staff:", normalizedStaff);
      setRegisteredStaff(normalizedStaff);

    } catch (error) {
      console.error("💥 Load registered staff error:", error);
      toast.error("Failed to load registered staff: " + error.message);
    }
  };

  // Load pending invites
  const loadPendingInvites = async () => {
    setLoading(true);
    try {
      console.log("Loading pending invites...");
      
      const res = await fetch(`${API_BASE}/api/admin/staff/invites`, {
        method: "GET",
        headers: getAuthHeader(),
      });

      if (res.status === 403 || res.status === 401) {
        handleAuthError();
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log("Loaded pending invites:", data);

      const mapped = data.map(inv => ({
        id: inv.id,
        token: inv.token,
        email: inv.email,
        name: inv.name,
        role: inv.role.toLowerCase(), // Normalize to lowercase
        inviteSent: true,
        inviteExpiry: inv.expiresAt,
        inviteLink: `http://localhost:5173/staff/register?token=${inv.token}`,
        invitedBy: inv.invitedByAdmin,
      }));

      setPendingInvites(mapped);
    } catch (error) {
      console.error("Load invites error:", error);
      toast.error("Failed to load pending invites: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = () => {
    toast.error("Session expired. Please login again.");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Debug effect
  useEffect(() => {
    console.log("🔄 Registered staff state:", registeredStaff);
    console.log("👨‍🍳 Chefs count:", chefs.length);
    console.log("👨‍💼 Waiters count:", waiters.length);
  }, [registeredStaff]);

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "ADMIN" && user.role !== "admin") {
      toast.error("Admin access required");
      window.location.href = "/dashboard";
      return;
    }
    
    // Load both types of data
    loadRegisteredStaff();
    loadPendingInvites();
  }, []);

  const handleAddStaff = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error("Please fill all fields");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check if email already exists in registered staff
    if (registeredStaff.some(s => s.email === formData.email)) {
      toast.error("Staff member with this email is already registered");
      return;
    }

    // Check if email already exists in pending invites
    if (pendingInvites.some(s => s.email === formData.email)) {
      toast.error("Invitation already sent to this email");
      return;
    }

    // Add temporary to pending invites
    const tempInvite = {
      id: `temp-${Date.now()}`,
      token: null,
      email: formData.email,
      name: formData.name,
      role: formData.role,
      inviteSent: false,
      inviteExpiry: null,
      inviteLink: null,
      invitedBy: "admin"
    };

    setPendingInvites(prev => [tempInvite, ...prev]);
    toast.success(`${formData.name} added. Send invitation email to complete.`);
    setShowAddModal(false);
    setFormData({ name: "", email: "", role: "chef" });
    setActiveTab('invites');
  };

  const sendInvite = async (staffId) => {
    const member = pendingInvites.find(s => s.id === staffId);
    if (!member) {
      toast.error("Staff member not found");
      return;
    }

    try {
      console.log("Sending invite to:", member.email);
      
      const res = await fetch(`${API_BASE}/api/admin/staff/invite`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({
          name: member.name,
          email: member.email,
          role: member.role.toUpperCase(),
        }),
      });

      if (res.status === 403 || res.status === 401) {
        handleAuthError();
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to send invite" }));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log("Invite response data:", data);

      // Update pending invites with real invite data
      const updated = pendingInvites.map(s =>
        s.id === staffId
          ? {
              ...s,
              id: data.id || s.id,
              token: data.token,
              inviteSent: true,
              inviteExpiry: data.expiresAt,
              inviteLink: `http://localhost:5173/staff/register?token=${data.token}`,
            }
          : s
      );

      setPendingInvites(updated);
      toast.success(data.message || "Invitation sent successfully!");
      
      // Reload data
      setTimeout(() => {
        loadPendingInvites();
        loadRegisteredStaff();
      }, 1000);
    } catch (error) {
      console.error("Send invite error:", error);
      toast.error("Failed to send invitation: " + error.message);
    }
  };

  const copyInviteLink = (token) => {
    if (!token) {
      toast.error("No invite link available");
      return;
    }
    
    const link = `http://localhost:5173/staff/register?token=${token}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopiedToken(token);
        toast.success("Invite link copied to clipboard!");
        setTimeout(() => setCopiedToken(null), 2000);
      })
      .catch(() => toast.error("Failed to copy link"));
  };

  const deleteInvite = async (id, token) => {
    if (!window.confirm("Are you sure you want to delete this invitation?")) return;

    // If it's a temp invite (no token yet)
    if (!token || id.startsWith('temp')) {
      setPendingInvites(prev => prev.filter(s => s.id !== id));
      toast.success('Invitation removed');
      return;
    }

    // Delete from backend
    try {
      const res = await fetch(`${API_BASE}/api/admin/staff/invite/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });

      if (res.ok) {
        setPendingInvites(prev => prev.filter(s => s.id !== id));
        toast.success('Invitation deleted');
      } else {
        throw new Error('Failed to delete from server');
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete invitation");
    }
  };

  const RegisteredStaffCard = ({ staff }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full ${staff.role === 'chef' ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'}`}>
            {staff.role === 'chef' ? (
              <ChefHat className="h-6 w-6 text-white" />
            ) : (
              <User className="h-6 w-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {staff.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {staff.email}
            </p>
            <span className={`inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full ${staff.role === 'chef' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'}`}>
              {staff.role.toUpperCase()}
            </span>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Registered: {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
        <div className={`text-sm ${staff.enabled ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'} rounded-full px-3 py-1`}>
          {staff.enabled ? 'Active' : 'Inactive'}
        </div>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p>Member since: {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : 'Unknown'}</p>
      </div>
    </motion.div>
  );

  const PendingInviteCard = ({ invite }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full ${invite.role === 'chef' ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'}`}>
            {invite.role === 'chef' ? (
              <ChefHat className="h-6 w-6 text-white" />
            ) : (
              <User className="h-6 w-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {invite.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {invite.email}
            </p>
            <span className={`inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full ${invite.role === 'chef' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'}`}>
              {invite.role.toUpperCase()} (Pending)
            </span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => deleteInvite(invite.id, invite.token)}
          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
          title="Delete invitation"
        >
          <Trash2 className="h-4 w-4" />
        </motion.button>
      </div>

      {invite.inviteSent ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
            <Calendar className="h-4 w-4" />
            <span>
              Expires: {invite.inviteExpiry ? new Date(invite.inviteExpiry).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => copyInviteLink(invite.token)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              disabled={!invite.token}
            >
              {copiedToken === invite.token ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span>Copy Invite Link</span>
            </button>
            
            <button
              onClick={() => sendInvite(invite.id)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all"
              title="Resend invitation"
            >
              <Mail className="h-4 w-4" />
              <span>Resend</span>
            </button>
          </div>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => sendInvite(invite.id)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              <span>Send Invitation Email</span>
            </>
          )}
        </motion.button>
      )}
    </motion.div>
  );

  // Filter staff - roles are already normalized to lowercase
  const chefs = registeredStaff.filter(s => s.role === 'chef');
  const waiters = registeredStaff.filter(s => s.role === 'waiter');
  const pendingChefs = pendingInvites.filter(s => s.role === 'chef');
  const pendingWaiters = pendingInvites.filter(s => s.role === 'waiter');

  // Debug info
  console.log("📊 Current state:", {
    totalStaff: registeredStaff.length,
    chefs: chefs.length,
    waiters: waiters.length,
    pendingInvites: pendingInvites.length
  });

  if (loading && pendingInvites.length === 0 && registeredStaff.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading staff data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Staff Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage registered staff and pending invitations
          </p>
          <div className="text-xs text-gray-500 mt-1">
            📊 Debug: Total Registered: {registeredStaff.length} | Chefs: {chefs.length} | Waiters: {waiters.length}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Invite Staff</span>
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('registered')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'registered' ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
          <Users className="inline mr-2 h-5 w-5" />
          Registered Staff ({registeredStaff.length})
        </button>
        <button
          onClick={() => setActiveTab('invites')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'invites' ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
          <MailX className="inline mr-2 h-5 w-5" />
          Pending Invites ({pendingInvites.length})
        </button>
      </div>

      {/* Registered Staff Tab */}
      {activeTab === 'registered' && (
        <>
          {/* Chefs Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
              <ChefHat className="h-6 w-6 text-orange-500" />
              <span>Registered Chefs ({chefs.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {chefs.map(chef => (
                  <RegisteredStaffCard key={chef.id} staff={chef} />
                ))}
              </AnimatePresence>
              {chefs.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No registered chefs yet</p>
                  <p className="text-sm mt-2">Invite chefs using the "Invite Staff" button</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Waiters Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
              <User className="h-6 w-6 text-emerald-500" />
              <span>Registered Waiters ({waiters.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {waiters.map(waiter => (
                  <RegisteredStaffCard key={waiter.id} staff={waiter} />
                ))}
              </AnimatePresence>
              {waiters.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No registered waiters yet</p>
                  <p className="text-sm mt-2">Invite waiters using the "Invite Staff" button</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}

      {/* Pending Invites Tab */}
      {activeTab === 'invites' && (
        <>
          {/* Pending Chefs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
              <ChefHat className="h-6 w-6 text-orange-500" />
              <span>Pending Chef Invites ({pendingChefs.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {pendingChefs.map(invite => (
                  <PendingInviteCard key={invite.id} invite={invite} />
                ))}
              </AnimatePresence>
              {pendingChefs.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <MailX className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No pending chef invitations</p>
                  <p className="text-sm mt-2">Invite chefs using the "Invite Staff" button</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Pending Waiters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
              <User className="h-6 w-6 text-emerald-500" />
              <span>Pending Waiter Invites ({pendingWaiters.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {pendingWaiters.map(invite => (
                  <PendingInviteCard key={invite.id} invite={invite} />
                ))}
              </AnimatePresence>
              {pendingWaiters.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <MailX className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No pending waiter invitations</p>
                  <p className="text-sm mt-2">Invite waiters using the "Invite Staff" button</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Invite New Staff
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleAddStaff}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter staff name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="staff@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'chef' })}
                        className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${formData.role === 'chef' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'}`}
                      >
                        <ChefHat className={`h-6 w-6 mb-2 ${formData.role === 'chef' ? 'text-orange-600' : 'text-gray-500'}`} />
                        <span className={`font-medium ${formData.role === 'chef' ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'}`}>
                          Chef
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'waiter' })}
                        className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${formData.role === 'waiter' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'}`}
                      >
                        <User className={`h-6 w-6 mb-2 ${formData.role === 'waiter' ? 'text-emerald-600' : 'text-gray-500'}`} />
                        <span className={`font-medium ${formData.role === 'waiter' ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>
                          Waiter
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
                  >
                    Add Staff
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminStaff;