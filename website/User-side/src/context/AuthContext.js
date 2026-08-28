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
  switchDemoCustomer: () => {},
});

// Demo fallback customers for seamless prototyping
export const DEMO_CUSTOMERS = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    email: 'rajesh.sharma@example.com',
    full_name: 'Rajesh Sharma',
    phone: '+91 98765 11111',
    address: 'Plot #42, Indiranagar, Bengaluru',
    role: 'customer',
    designer: {
      id: 'd1111111-1111-1111-1111-111111111111',
      name: 'Arun Bahubali',
      title: 'Principal Architect',
      email: 'arun.designer@bavi.in',
      phone: '+91 98450 12345',
      code: 'BAVI-DES-7890'
    }
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    email: 'pooja.reddy@example.com',
    full_name: 'Pooja Reddy',
    phone: '+91 98765 22222',
    address: 'Villa 18, Palm Meadows, Whitefield, Bengaluru',
    role: 'customer',
    designer: {
      id: 'd2222222-2222-2222-2222-222222222222',
      name: 'Ananya Hegde',
      title: 'Head of Visionary Interior Design',
      email: 'ananya.interiors@bavi.in',
      phone: '+91 98450 67890',
      code: 'BAVI-DES-1024'
    }
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for demo session or supabase session
    const savedDemoUser = localStorage.getItem('bavi_customer_demo_user');
    if (savedDemoUser) {
      try {
        const parsed = JSON.parse(savedDemoUser);
        setUser({ id: parsed.id, email: parsed.email });
        setProfile(parsed);
        setLoading(false);
        return;
      } catch {
        // Continue
      }
    }

    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id, session.user.email);
        } else {
          // Default to first demo customer so the user can immediately experience the dashboard
          const defaultDemo = DEMO_CUSTOMERS[0];
          setUser({ id: defaultDemo.id, email: defaultDemo.email });
          setProfile(defaultDemo);
          setLoading(false);
        }
      }).catch(() => {
        const defaultDemo = DEMO_CUSTOMERS[0];
        setUser({ id: defaultDemo.id, email: defaultDemo.email });
        setProfile(defaultDemo);
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
      // Supabase is in demo/prototype mode
      const defaultDemo = DEMO_CUSTOMERS[0];
      setUser({ id: defaultDemo.id, email: defaultDemo.email });
      setProfile(defaultDemo);
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (userId, email) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, designer:designers(*)')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile(data);
      } else {
        setProfile({
          id: userId,
          email,
          full_name: email.split('@')[0],
          role: 'customer',
          designer: DEMO_CUSTOMERS[0].designer
        });
      }
    } catch {
      setProfile(DEMO_CUSTOMERS[0]);
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
      return data;
    } else {
      // Match demo user or create session
      const found = DEMO_CUSTOMERS.find(c => c.email.toLowerCase() === email.toLowerCase()) || {
        id: 'c-demo-' + Date.now(),
        email,
        full_name: email.split('@')[0],
        phone: '+91 98765 00000',
        address: 'Bengaluru, Karnataka',
        role: 'customer',
        designer: DEMO_CUSTOMERS[0].designer
      };
      setUser({ id: found.id, email: found.email });
      setProfile(found);
      localStorage.setItem('bavi_customer_demo_user', JSON.stringify(found));
      return { user: found };
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
      return data;
    } else {
      const newUser = {
        id: 'c-demo-' + Date.now(),
        email,
        full_name: metadata.full_name || email.split('@')[0],
        phone: metadata.phone || '+91 98765 00000',
        address: 'Bengaluru, Karnataka',
        role: 'customer',
        designer: DEMO_CUSTOMERS[0].designer
      };
      setUser({ id: newUser.id, email: newUser.email });
      setProfile(newUser);
      localStorage.setItem('bavi_customer_demo_user', JSON.stringify(newUser));
      return { user: newUser };
    }
  };

  const logout = async () => {
    localStorage.removeItem('bavi_customer_demo_user');
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    localStorage.setItem('bavi_customer_demo_user', JSON.stringify(updated));
    if (isSupabaseConfigured() && user?.id) {
      await supabase.from('profiles').update(updates).eq('id', user.id);
    }
  };

  const switchDemoCustomer = (customerIndex) => {
    const selected = DEMO_CUSTOMERS[customerIndex] || DEMO_CUSTOMERS[0];
    setUser({ id: selected.id, email: selected.email });
    setProfile(selected);
    localStorage.setItem('bavi_customer_demo_user', JSON.stringify(selected));
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
        switchDemoCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
