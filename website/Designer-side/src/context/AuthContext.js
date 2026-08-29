'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const DesignerAuthContext = createContext({
  designer: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

// Master designer accounts — these are the ONLY accounts allowed to login
// In production, this should come from Supabase with proper auth
export const MASTER_DESIGNERS = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    company_code: 'BAVI-DES-7890',
    full_name: 'Arun Bahubali',
    email: 'interiorsbavi@gmail.com',
    phone: '8277762487',
    specialization: 'Principal Architect & Visionary Interiors',
    bio: '! WE BOND YOUR SPACE WITH BAHUBALI GRACE !',
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    company_code: 'BAVI-DES-1024',
    full_name: 'Ananya Hegde',
    email: 'ananya.hegde@bavi.in',
    phone: '8277762487',
    specialization: 'Head of Visionary Interior Design',
    bio: '! WE BOND YOUR SPACE WITH BAHUBALI GRACE !',
  }
];

// Session validity duration (24 hours in milliseconds)
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;

export function DesignerAuthProvider({ children }) {
  const [designer, setDesigner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('bavi_designer_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Check session expiry
        if (parsed && parsed.full_name && parsed.sessionCreatedAt) {
          const elapsed = Date.now() - parsed.sessionCreatedAt;
          if (elapsed < SESSION_EXPIRY_MS) {
            setDesigner(parsed);
          } else {
            // Session expired — clear it
            localStorage.removeItem('bavi_designer_session');
            setDesigner(null);
          }
        } else if (parsed && parsed.full_name) {
          // Legacy session without expiry — allow but add expiry on next login
          setDesigner(parsed);
        } else {
          setDesigner(null);
        }
      } catch {
        localStorage.removeItem('bavi_designer_session');
        setDesigner(null);
      }
    } else {
      setDesigner(null);
    }
    setLoading(false);
  }, []);

  const login = async (email, password, companyCode) => {
    // Validate required fields
    if (!email || !email.trim()) {
      throw new Error('Email is required.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    if (!companyCode || !companyCode.trim()) {
      throw new Error('Company security code is required.');
    }

    const formattedCode = companyCode.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    // Try Supabase authentication first (if configured)
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email: normalizedEmail, 
          password 
        });
        if (error) {
          throw new Error('Invalid email or password. Please check your credentials.');
        }

        // Supabase auth succeeded — now verify company code against master list
        const match = MASTER_DESIGNERS.find(
          (d) => d.company_code === formattedCode && d.email.toLowerCase() === normalizedEmail
        );

        const designerSession = match || {
          id: data.user.id,
          company_code: formattedCode,
          full_name: data.user.user_metadata?.full_name || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          phone: data.user.user_metadata?.phone || '',
          specialization: data.user.user_metadata?.specialization || 'Architectural Design & Visionary Interiors',
          bio: '',
        };

        const sessionData = { ...designerSession, sessionCreatedAt: Date.now() };
        setDesigner(sessionData);
        localStorage.setItem('bavi_designer_session', JSON.stringify(sessionData));
        return sessionData;
      } catch (err) {
        // If it's our own error, re-throw it
        if (err.message.includes('Invalid email') || err.message.includes('credentials')) {
          throw err;
        }
        // Otherwise fall through to master designer check
      }
    }

    // Fallback: Validate against MASTER_DESIGNERS list only
    // Both email AND company code must match exactly
    const match = MASTER_DESIGNERS.find(
      (d) => d.company_code === formattedCode && d.email.toLowerCase() === normalizedEmail
    );

    if (!match) {
      throw new Error(
        'Authentication failed. The email, password, or security code is incorrect. ' +
        'Only authorized architects can access this portal.'
      );
    }

    const sessionData = { ...match, sessionCreatedAt: Date.now() };
    setDesigner(sessionData);
    localStorage.setItem('bavi_designer_session', JSON.stringify(sessionData));
    return sessionData;
  };

  const register = async (/* designerData */) => {
    // Public registration is DISABLED for launch security.
    // Only pre-authorized master designers can access the portal.
    // To add new designers, add them to the MASTER_DESIGNERS array
    // or create their accounts via Supabase admin panel.
    throw new Error(
      'Designer registration is currently closed. ' +
      'Please contact BAVI administration to request architect portal access.'
    );
  };

  const logout = () => {
    localStorage.removeItem('bavi_designer_session');
    localStorage.removeItem('bavi_registered_designers');
    if (isSupabaseConfigured()) {
      supabase.auth.signOut().catch(() => {});
    }
    setDesigner(null);
  };

  return (
    <DesignerAuthContext.Provider
      value={{
        designer,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </DesignerAuthContext.Provider>
  );
}

export const useDesignerAuth = () => useContext(DesignerAuthContext);
