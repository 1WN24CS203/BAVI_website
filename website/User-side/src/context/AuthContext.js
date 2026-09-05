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
          full_name: userProfile.full_name || userProfile.email.split('@')[0],
          email: userProfile.email,
          phone: userProfile.phone || '',
          address: userProfile.address || '',
          role: 'customer',
          status: 'Active Client'
        },
        ...filtered
      ];
      localStorage.setItem('bavi_registered_clients', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to sync to bavi_registered_clients:', e);
    }
  };

  // Helper: Save to local registered accounts registry (so accounts survive offline / reloads)
  const saveToRegisteredAccounts = (account) => {
    if (typeof window === 'undefined' || !account?.email) return;
    try {
      const stored = localStorage.getItem('bavi_registered_accounts');
      const list = stored ? JSON.parse(stored) : [];
      const filtered = list.filter(a => a.email?.toLowerCase() !== account.email.toLowerCase());
      localStorage.setItem('bavi_registered_accounts', JSON.stringify([account, ...filtered]));
    } catch (e) {
      console.warn('Failed to save to registered accounts:', e);
    }
  };

  // Helper: Find account in local registered accounts
  const findRegisteredAccount = (email) => {
    if (typeof window === 'undefined' || !email) return null;
    try {
      const stored = localStorage.getItem('bavi_registered_accounts');
      const list = stored ? JSON.parse(stored) : [];
      return list.find(a => a.email?.toLowerCase() === email.toLowerCase()) || null;
    } catch {
      return null;
    }
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

        // 3. Listen to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (!mounted) return;
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id, session.user.email);
          } else {
            // Only clear if no local session exists
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

  const fetchProfile = async (userId, email) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${userId},user_id.eq.${userId},email.eq.${email}`)
        .maybeSingle();

      if (data && !error) {
        setProfile(data);
        localStorage.setItem('bavi_customer_session', JSON.stringify(data));
        syncToRegisteredClients(data);
        saveToRegisteredAccounts(data);
        return data;
      } else {
        // Fallback to local profile or construct
        const local = findRegisteredAccount(email) || {
          id: userId,
          user_id: userId,
          email,
          full_name: email.split('@')[0],
          role: 'customer'
        };
        setProfile(local);
        localStorage.setItem('bavi_customer_session', JSON.stringify(local));
        syncToRegisteredClients(local);
        return local;
      }
    } catch {
      const fallback = {
        id: userId,
        user_id: userId,
        email,
        full_name: email.split('@')[0],
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

  const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (error) throw error;

        setUser(data.user);
        const userProfile = await fetchProfile(data.user.id, data.user.email);
        localStorage.setItem('bavi_customer_session', JSON.stringify(userProfile));
        syncToRegisteredClients(userProfile);
        saveToRegisteredAccounts({ ...userProfile, password });
        return data;
      } catch (err) {
        // If Supabase fails or credentials reject, check local accounts registry
        const localAcc = findRegisteredAccount(normalizedEmail);
        if (localAcc && (!localAcc.password || localAcc.password === password)) {
          setUser({ id: localAcc.id, email: localAcc.email });
          setProfile(localAcc);
          localStorage.setItem('bavi_customer_session', JSON.stringify(localAcc));
          syncToRegisteredClients(localAcc);
          return { user: localAcc };
        }
        throw err;
      }
    } else {
      // Local storage mode
      const localAcc = findRegisteredAccount(normalizedEmail);
      if (localAcc) {
        if (localAcc.password && localAcc.password !== password) {
          throw new Error('Invalid password for registered account.');
        }
        setUser({ id: localAcc.id, email: localAcc.email });
        setProfile(localAcc);
        localStorage.setItem('bavi_customer_session', JSON.stringify(localAcc));
        syncToRegisteredClients(localAcc);
        return { user: localAcc };
      }

      // New session if not registered before
      const newSession = {
        id: 'user-' + Date.now(),
        email: normalizedEmail,
        password: password,
        full_name: normalizedEmail.split('@')[0],
        phone: '',
        address: 'Channarayapatna, Karnataka',
        role: 'customer'
      };
      setUser({ id: newSession.id, email: newSession.email });
      setProfile(newSession);
      localStorage.setItem('bavi_customer_session', JSON.stringify(newSession));
      saveToRegisteredAccounts(newSession);
      syncToRegisteredClients(newSession);
      return { user: newSession };
    }
  };

  const signup = async (email, password, metadata = {}) => {
    const normalizedEmail = email.trim().toLowerCase();
    const fullName = (metadata.full_name || normalizedEmail.split('@')[0]).trim();
    const phone = (metadata.phone || '').trim();

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: 'customer'
          },
        },
      });
      if (error) throw error;

      const userId = data.user?.id || 'user-' + Date.now();
      const newProfile = {
        id: userId,
        user_id: userId,
        email: normalizedEmail,
        password: password,
        full_name: fullName,
        phone: phone,
        role: 'customer'
      };

      // 1. Direct Supabase profiles upsert to guarantee persistence
      try {
        await supabase.from('profiles').upsert([
          {
            id: userId,
            user_id: userId,
            email: normalizedEmail,
            full_name: fullName,
            phone: phone,
            role: 'customer'
          }
        ], { onConflict: 'id' });
      } catch (err) {
        console.warn('Profile direct upsert notice:', err);
      }

      // 2. Persist locally so it is NEVER lost on reload
      setUser(data.user || { id: userId, email: normalizedEmail });
      setProfile(newProfile);
      localStorage.setItem('bavi_customer_session', JSON.stringify(newProfile));
      saveToRegisteredAccounts(newProfile);
      syncToRegisteredClients(newProfile);

      return data;
    } else {
      // Local storage persistence
      const userId = 'user-' + Date.now();
      const newSession = {
        id: userId,
        user_id: userId,
        email: normalizedEmail,
        password: password,
        full_name: fullName,
        phone: phone,
        address: 'Channarayapatna, Karnataka',
        role: 'customer'
      };

      setUser({ id: newSession.id, email: newSession.email });
      setProfile(newSession);
      localStorage.setItem('bavi_customer_session', JSON.stringify(newSession));
      saveToRegisteredAccounts(newSession);
      syncToRegisteredClients(newSession);

      return { user: newSession };
    }
  };

  const logout = async () => {
    localStorage.removeItem('bavi_customer_session');
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    localStorage.setItem('bavi_customer_session', JSON.stringify(updated));
    saveToRegisteredAccounts(updated);
    syncToRegisteredClients(updated);

    if (isSupabaseConfigured() && user?.id) {
      try {
        await supabase.from('profiles').update(updates).eq('id', user.id);
      } catch (err) {
        console.warn('Supabase profile update notice:', err);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
