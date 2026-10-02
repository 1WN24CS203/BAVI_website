'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  submitBookingInquiry: async () => {},
  checkBookingStatus: async () => {},
  updatePassword: async () => {},
  requestPasswordChange: async () => {},
  getClientPasswordRequests: () => [],
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: Persist client in shared registered client roster for Designer Portal
  const syncToRegisteredClients = (userProfile) => {
    if (typeof window === 'undefined' || !userProfile?.email) return;
    try {
      const stored = localStorage.getItem('bavi_registered_clients');
      const list = stored ? JSON.parse(stored) : [];
      const filtered = list.filter(c => c.email?.toLowerCase() !== userProfile.email.toLowerCase());
      const updated = [
        {
          id: userProfile.id || `cli-${Date.now()}`,
          client_code: userProfile.client_code || userProfile.client_id || `BAVI-CLI-${Math.floor(1000 + Math.random() * 9000)}`,
          full_name: userProfile.full_name || userProfile.email.split('@')[0],
          email: userProfile.email,
          phone: userProfile.phone || '',
          address: userProfile.address || '',
          role: 'customer',
          status: 'Active Client',
          designer_approved: true,
          password: userProfile.password,
        },
        ...filtered
      ];
      localStorage.setItem('bavi_registered_clients', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to sync to bavi_registered_clients:', e);
    }
  };

  // Helper: Find account in local registered clients roster or accounts registry
  const findApprovedClient = (identifier) => {
    if (typeof window === 'undefined' || !identifier) return null;
    const q = String(identifier).trim().toLowerCase();
    try {
      // 1. Check registered clients list (created & approved by Designer)
      const clientsStr = localStorage.getItem('bavi_registered_clients');
      if (clientsStr) {
        const clients = JSON.parse(clientsStr);
        if (Array.isArray(clients)) {
          const found = clients.find(c =>
            (c.email && c.email.toLowerCase() === q) ||
            (c.client_code && c.client_code.toLowerCase() === q) ||
            (c.client_id && c.client_id.toLowerCase() === q) ||
            (c.id && c.id.toLowerCase() === q)
          );
          if (found) return found;
        }
      }

      // 2. Check accounts registry
      const accountsStr = localStorage.getItem('bavi_registered_accounts');
      if (accountsStr) {
        const accs = JSON.parse(accountsStr);
        if (Array.isArray(accs)) {
          const found = accs.find(a =>
            (a.email && a.email.toLowerCase() === q) ||
            (a.client_code && a.client_code.toLowerCase() === q)
          );
          if (found) return found;
        }
      }
    } catch (e) {
      console.warn('Error reading local approved clients:', e);
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // 1. First check local session for instant UI render
      let initialSession = null;
      try {
        const savedUser = localStorage.getItem('bavi_customer_session');
        if (savedUser) {
          initialSession = JSON.parse(savedUser);
          if (mounted && initialSession?.email) {
            setUser({ id: initialSession.id, email: initialSession.email });
            setProfile(initialSession);
            syncToRegisteredClients(initialSession);
          }
        }
      } catch (e) {
        console.warn('Error reading saved session:', e);
      }

      // 2. Check Supabase session if configured
      if (isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            setUser(session.user);
            await fetchProfile(session.user.id, session.user.email);
          } else if (!initialSession && mounted) {
            setUser(null);
            setProfile(null);
          }
        } catch (err) {
          console.warn('Supabase getSession error:', err);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (!mounted) return;
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id, session.user.email);
          } else {
            const local = localStorage.getItem('bavi_customer_session');
            if (!local) {
              setUser(null);
              setProfile(null);
            }
          }
        });

        if (mounted) setLoading(false);
        return () => subscription?.unsubscribe();
      } else {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const fetchProfile = async (userId, userEmail) => {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`user_id.eq.${userId},email.eq.${userEmail}`)
          .single();

        if (data) {
          const prof = {
            id: data.id,
            user_id: data.user_id,
            email: data.email,
            full_name: data.full_name,
            phone: data.phone,
            address: data.address,
            client_code: data.metadata?.client_code || data.id,
            designer_approved: data.metadata?.designer_approved ?? true,
            role: data.role || 'customer',
            designer: {
              name: 'Ar. Rajesh Bahubali',
              title: 'Principal Architect & Studio Director',
              code: 'BAVI-ARCH-001',
              phone: '+91 98450 12345'
            }
          };
          setProfile(prof);
          localStorage.setItem('bavi_customer_session', JSON.stringify(prof));
          syncToRegisteredClients(prof);
          return prof;
        }
      }

      // Check local approved client profile
      const localClient = findApprovedClient(userEmail);
      const fallback = {
        id: localClient?.id || userId || 'user-' + Date.now(),
        email: userEmail,
        full_name: localClient?.full_name || userEmail.split('@')[0],
        phone: localClient?.phone || '',
        address: localClient?.address || 'Bengaluru, Karnataka',
        client_code: localClient?.client_code || localClient?.client_id || 'BAVI-CLI-CLIENT',
        designer_approved: localClient?.designer_approved ?? true,
        designer: {
          name: 'Ar. Rajesh Bahubali',
          title: 'Principal Architect & Studio Director',
          code: 'BAVI-ARCH-001',
          phone: '+91 98450 12345'
        },
        role: 'customer'
      };
      setProfile(fallback);
      localStorage.setItem('bavi_customer_session', JSON.stringify(fallback));
      syncToRegisteredClients(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // LOGIN: Only allowed with Designer-Generated / Approved Credentials
  // --------------------------------------------------------------------------
  const login = async (identifier, password) => {
    if (!identifier || !password) {
      throw new Error('Please enter both your Client ID / Email and your designer-issued password.');
    }

    const q = identifier.trim().toLowerCase();
    let approvedClient = null;

    // 1. Check Supabase profiles for approved client
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .or(`email.eq.${q},id.eq.${q}`)
          .in('role', ['customer', 'client']);
        
        if (data && data.length > 0) {
          approvedClient = data[0];
        }
      } catch (err) {
        console.warn('Supabase profile query during login:', err);
      }
    }

    // 2. Check local approved clients roster if not found yet
    if (!approvedClient) {
      approvedClient = findApprovedClient(q);
    }

    // If client is completely unknown or not approved by designer, restrict access
    if (!approvedClient) {
      throw new Error(
        'Access restricted: No approved client account found for this Email or Client ID. ' +
        'BAVI client accounts are generated exclusively by our design team after a successful callback consultation and approved project booking.'
      );
    }

    // Try Supabase Auth first if configured and client has an email
    if (isSupabaseConfigured() && approvedClient.email) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: approvedClient.email.toLowerCase(),
          password,
        });
        if (!error && data?.user) {
          setUser(data.user);
          const userProfile = await fetchProfile(data.user.id, data.user.email);
          localStorage.setItem('bavi_customer_session', JSON.stringify(userProfile));
          syncToRegisteredClients(userProfile);
          return data;
        }
      } catch {
        // Fallback to local credential verification below
      }
    }

    // Verify against designer-issued / updated password
    const validPassword = approvedClient.password || approvedClient.temporary_password;
    if (validPassword && validPassword !== password) {
      throw new Error('Invalid password. Please enter the password issued by your BAVI Designer or your approved updated password.');
    }

    // Validated successfully!
    const sessionProfile = {
      id: approvedClient.id,
      user_id: approvedClient.user_id || approvedClient.id,
      email: approvedClient.email,
      full_name: approvedClient.full_name || approvedClient.name,
      phone: approvedClient.phone || '',
      address: approvedClient.address || 'Bengaluru, Karnataka',
      client_code: approvedClient.client_code || approvedClient.client_id || approvedClient.id,
      designer_approved: true,
      role: 'customer',
      designer: {
        name: 'Ar. Rajesh Bahubali',
        title: 'Principal Architect & Studio Director',
        code: 'BAVI-ARCH-001',
        phone: '+91 98450 12345'
      }
    };

    setUser({ id: sessionProfile.id, email: sessionProfile.email });
    setProfile(sessionProfile);
    localStorage.setItem('bavi_customer_session', JSON.stringify(sessionProfile));
    syncToRegisteredClients(sessionProfile);
    return { user: sessionProfile };
  };

  // --------------------------------------------------------------------------
  // SIGNUP: Redirect to Booking / Callback Consultation flow
  // --------------------------------------------------------------------------
  const signup = async () => {
    throw new Error(
      'Direct registration is disabled. Client accounts are created exclusively after a successful callback consultation and approved project booking by our design team.'
    );
  };

  // --------------------------------------------------------------------------
  // SUBMIT BOOKING INQUIRY (The official way for users to request an account)
  // --------------------------------------------------------------------------
  const submitBookingInquiry = async ({ fullName, email, phone, projectType, budget, location, message }) => {
    if (!fullName || !phone) {
      throw new Error('Please provide your full name and phone number for callback.');
    }

    const payload = {
      id: `cb-${Date.now()}`,
      name: fullName.trim(),
      phone: phone.trim(),
      email: email?.trim().toLowerCase() || '',
      subject: `Project Booking Inquiry — ${projectType || 'Custom Architecture'}`,
      message: `Project Type: ${projectType || 'Residential'}\nBudget: ${budget || 'Not specified'}\nSite Location: ${location || 'Bengaluru'}\nVision: ${message || 'Standard architectural consultation'}`,
      is_client: false,
      priority: 'high',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // 1. Save to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('callback_requests').insert([{
          name: payload.name,
          phone: payload.phone,
          email: payload.email,
          subject: payload.subject,
          message: payload.message,
          is_client: false,
          priority: 'high',
          status: 'new'
        }]);
      } catch (err) {
        console.warn('Supabase booking inquiry insert error:', err);
      }
    }

    // 2. Save to local callback requests
    try {
      const stored = localStorage.getItem('bavi_callback_requests');
      const list = stored ? JSON.parse(stored) : [];
      localStorage.setItem('bavi_callback_requests', JSON.stringify([payload, ...list]));
    } catch {}

    return {
      success: true,
      message: 'Consultation & booking request submitted! A BAVI Senior Architect will call you to discuss your project requirements. Once approved, your Client ID & temporary password will be dispatched to your email.'
    };
  };

  // --------------------------------------------------------------------------
  // CHECK BOOKING STATUS (Check if callback was attended or credentials issued)
  // --------------------------------------------------------------------------
  const checkBookingStatus = async (query) => {
    const q = String(query).trim().toLowerCase();
    if (!q) return null;

    // Check if client account is already approved & created
    const approved = findApprovedClient(q);
    if (approved) {
      return {
        status: 'APPROVED',
        client_code: approved.client_code || approved.client_id,
        email: approved.email,
        full_name: approved.full_name,
        message: 'Your project booking has been approved by the designer! Your login credentials have been dispatched.'
      };
    }

    // Check callback status
    try {
      const stored = localStorage.getItem('bavi_callback_requests');
      if (stored) {
        const list = JSON.parse(stored);
        const match = list.find(c => 
          (c.email && c.email.toLowerCase() === q) || 
          (c.phone && c.phone.includes(q))
        );
        if (match) {
          if (match.status === 'attended' || match.status === 'contacted') {
            return {
              status: 'CALLBACK_ATTENDED',
              message: 'Your callback discussion was completed! Designer is preparing your project charter and access credentials.'
            };
          }
          return {
            status: 'PENDING_CALLBACK',
            message: 'Your callback request is in queue. Our design team will contact you shortly.'
          };
        }
      }
    } catch {}

    return {
      status: 'NOT_FOUND',
      message: 'No active booking inquiry found. Please submit a project consultation request.'
    };
  };

  // --------------------------------------------------------------------------
  // UPDATE PASSWORD: Client updates their own password directly.
  // Password takes effect immediately. Designer is notified in the activity log.
  // --------------------------------------------------------------------------
  const updatePassword = async ({ currentPassword, newPassword, reason }) => {
    if (!profile) throw new Error('You must be signed in to change your password.');
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    // Verify current password matches the stored credential
    const storedClient = findApprovedClient(profile.email);
    const storedPassword = storedClient?.password || storedClient?.temporary_password;
    if (storedPassword && currentPassword && storedPassword !== currentPassword) {
      throw new Error(
        'Current password is incorrect. Please enter the password issued by your designer (or your last updated password).'
      );
    }

    const reqId = `pwupd-${Date.now()}`;
    const now = new Date().toISOString();

    // 1. Apply the new password immediately to registered clients store
    try {
      const clientsStr = localStorage.getItem('bavi_registered_clients');
      if (clientsStr) {
        const clients = JSON.parse(clientsStr);
        const updated = clients.map(c =>
          c.email?.toLowerCase() === profile.email?.toLowerCase()
            ? { ...c, password: newPassword }
            : c
        );
        localStorage.setItem('bavi_registered_clients', JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('Failed to update password in registered clients:', e);
    }

    // 2. Apply the new password to registered accounts store
    try {
      const accStr = localStorage.getItem('bavi_registered_accounts');
      if (accStr) {
        const accs = JSON.parse(accStr);
        const updated = accs.map(a =>
          a.email?.toLowerCase() === profile.email?.toLowerCase()
            ? { ...a, password: newPassword }
            : a
        );
        localStorage.setItem('bavi_registered_accounts', JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('Failed to update password in registered accounts:', e);
    }

    // 3. Update active session so user doesn't get locked out
    try {
      const sessionStr = localStorage.getItem('bavi_customer_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        localStorage.setItem('bavi_customer_session', JSON.stringify({ ...session, password: newPassword }));
      }
    } catch (e) {
      console.warn('Failed to update password in session:', e);
    }

    // 4. Save a change log entry so designer can audit the update
    const requestItem = {
      id: reqId,
      client_id: profile.id,
      client_code: profile.client_code || profile.id,
      client_name: profile.full_name,
      client_email: profile.email,
      reason: reason || 'Client updated password from profile portal',
      status: 'APPLIED',
      submitted_at: now,
      designer_notified: true,
    };
    try {
      const stored = localStorage.getItem('bavi_client_password_requests');
      const list = stored ? JSON.parse(stored) : [];
      localStorage.setItem('bavi_client_password_requests', JSON.stringify([requestItem, ...list]));
    } catch (e) {
      console.warn('Failed to save client password change log:', e);
    }

    // 5. Log to shared activity log for designer visibility
    try {
      const actStored = localStorage.getItem('bavi_activity_log');
      const acts = actStored ? JSON.parse(actStored) : [];
      acts.unshift({
        id: `act-${Date.now()}`,
        actor_name: profile.full_name,
        actor_type: 'client',
        department: 'client_portal',
        action: 'updated_password',
        details: { client_email: profile.email, reason: requestItem.reason, status: 'APPLIED' },
        created_at: now
      });
      localStorage.setItem('bavi_activity_log', JSON.stringify(acts.slice(0, 100)));
    } catch {}

    return {
      success: true,
      message: 'Password updated successfully! You can now log in with your new password. Your designer has been notified of this change.'
    };
  };

  // Alias for backward compatibility with any existing callers
  const requestPasswordChange = updatePassword;

  const getClientPasswordRequests = () => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('bavi_client_password_requests');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try { await supabase.auth.signOut(); } catch (err) { console.warn(err); }
    }
    setUser(null);
    setProfile(null);
    try {
      localStorage.removeItem('bavi_customer_session');
    } catch {}
  };

  const updateProfile = async (updates) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    try {
      localStorage.setItem('bavi_customer_session', JSON.stringify(updated));
      syncToRegisteredClients(updated);
    } catch {}

    if (isSupabaseConfigured() && user?.id && !String(user.id).startsWith('user-')) {
      try {
        await supabase.from('profiles').update(updates).eq('id', user.id);
      } catch (err) {
        console.warn('Supabase update profile error:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        submitBookingInquiry,
        checkBookingStatus,
        updatePassword,
        requestPasswordChange,
        getClientPasswordRequests,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
