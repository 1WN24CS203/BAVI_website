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

export const MASTER_DESIGNERS = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    company_code: 'BAVI-DES-7890',
    full_name: 'Arun Bahubali',
    email: 'Interiorsbavi@gmail.com',
    phone: '8277762487',
    specialization: 'Principal Architect & Visionary Interiors',
    bio: '! WE BOND YOUR SPACE WITH BAHUBALI GRACE !',
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    company_code: 'BAVI-DES-1024',
    full_name: 'Ananya Hegde',
    email: 'Interiorsbavi@gmail.com',
    phone: '8277762487',
    specialization: 'Head of Visionary Interior Design',
    bio: '! WE BOND YOUR SPACE WITH BAHUBALI GRACE !',
  }
];

export function DesignerAuthProvider({ children }) {
  const [designer, setDesigner] = useState(null);
  const [loading, setLoading] = useState(true);

  const getRegisteredDesigners = () => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('bavi_registered_designers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('bavi_designer_session');
    if (saved) {
      try {
        setDesigner(JSON.parse(saved));
      } catch {
        setDesigner(null);
      }
    } else {
      setDesigner(null);
    }
    setLoading(false);
  }, []);

  const login = async (email, password, companyCode) => {
    const formattedCode = companyCode?.trim().toUpperCase();
    const allDesigners = [...MASTER_DESIGNERS, ...getRegisteredDesigners()];
    
    // Verify Company Code against valid & registered designers
    const match = allDesigners.find(
      (d) => d.company_code === formattedCode || d.email?.toLowerCase() === email?.toLowerCase()
    );

    if (!match) {
      throw new Error('Invalid Security Company Code or Email. Please verify your credentials.');
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signInWithPassword({
          email,
          password,
        });
      } catch {
        // Fallback
      }
    }

    setDesigner(match);
    localStorage.setItem('bavi_designer_session', JSON.stringify(match));
    return match;
  };

  const register = async (designerData) => {
    const randomCode = `BAVI-DES-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDesigner = {
      id: 'des-' + Date.now(),
      company_code: designerData.companyCode?.trim().toUpperCase() || randomCode,
      full_name: designerData.fullName,
      email: designerData.email || 'Interiorsbavi@gmail.com',
      phone: designerData.phone || '8277762487',
      specialization: designerData.specialization || 'Architectural Design & Visionary Interiors',
      bio: '! WE BOND YOUR SPACE WITH BAHUBALI GRACE !',
      registeredAt: new Date().toISOString()
    };

    if (isSupabaseConfigured() && designerData.password) {
      try {
        await supabase.auth.signUp({
          email: designerData.email,
          password: designerData.password,
          options: {
            data: {
              full_name: designerData.fullName,
              role: 'designer',
              company_code: newDesigner.company_code
            }
          }
        });
      } catch (err) {
        console.warn('Supabase signup fallback:', err);
      }
    }

    const existing = getRegisteredDesigners();
    const updated = [newDesigner, ...existing.filter(d => d.email !== newDesigner.email)];
    localStorage.setItem('bavi_registered_designers', JSON.stringify(updated));

    setDesigner(newDesigner);
    localStorage.setItem('bavi_designer_session', JSON.stringify(newDesigner));
    return newDesigner;
  };

  const logout = () => {
    localStorage.removeItem('bavi_designer_session');
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
