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

  useEffect(() => {
    // Check saved session in local storage or Supabase
    const savedUser = localStorage.getItem('bavi_customer_session');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser({ id: parsed.id, email: parsed.email });
        setProfile(parsed);
        setLoading(false);
        return;
      } catch {
        // Fallback
      }
    }

    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id, session.user.email);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }).catch(() => {
        setUser(null);
        setProfile(null);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id, session.user.email);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      });

      return () => subscription?.unsubscribe();
    } else {
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (userId, email) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile(data);
      } else {
        setProfile({
          id: userId,
          email,
          full_name: email.split('@')[0],
          role: 'customer'
        });
      }
    } catch {
      setProfile({
        id: userId,
        email,
        full_name: email.split('@')[0],
        role: 'customer'
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setUser(data.user);
      fetchProfile(data.user.id, data.user.email);
      return data;
    } else {
      const savedUser = localStorage.getItem('bavi_customer_session');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.email.toLowerCase() === email.toLowerCase()) {
          setUser({ id: parsed.id, email: parsed.email });
          setProfile(parsed);
          return { user: parsed };
        }
      }
      const newSession = {
        id: 'user-' + Date.now(),
        email,
        full_name: email.split('@')[0],
        phone: '',
        address: 'Channarayapatna, Karnataka',
        role: 'customer'
      };
      setUser({ id: newSession.id, email: newSession.email });
      setProfile(newSession);
      localStorage.setItem('bavi_customer_session', JSON.stringify(newSession));
      return { user: newSession };
    }
  };

  const signup = async (email, password, metadata = {}) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      if (error) throw error;

      if (data.user) {
        try {
          await supabase.from('profiles').insert([
            {
              id: data.user.id,
              email: data.user.email,
              full_name: metadata.full_name || email.split('@')[0],
              phone: metadata.phone || '',
              role: 'customer'
            }
          ]);
        } catch (err) {
          console.warn('Profile insert error:', err);
        }
      }

      setUser(data.user);
      const newProfile = {
        id: data.user.id,
        email: data.user.email,
        full_name: metadata.full_name || email.split('@')[0],
        phone: metadata.phone || '',
        role: 'customer'
      };
      setProfile(newProfile);
      localStorage.setItem('bavi_customer_session', JSON.stringify(newProfile));
      return data;
    } else {
      const newSession = {
        id: 'user-' + Date.now(),
        email,
        full_name: metadata.full_name || email.split('@')[0],
        phone: metadata.phone || '',
        address: 'Channarayapatna, Karnataka',
        role: 'customer'
      };
      setUser({ id: newSession.id, email: newSession.email });
      setProfile(newSession);
      localStorage.setItem('bavi_customer_session', JSON.stringify(newSession));
      return { user: newSession };
    }
  };

  const logout = async () => {
    localStorage.removeItem('bavi_customer_session');
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    localStorage.setItem('bavi_customer_session', JSON.stringify(updated));
    if (isSupabaseConfigured() && user?.id) {
      await supabase.from('profiles').update(updates).eq('id', user.id);
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
