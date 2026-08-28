'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const DesignerAuthContext = createContext({
  designer: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  switchDemoDesigner: () => {},
});

export const VALID_DESIGNERS = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    company_code: 'BAVI-DES-7890',
    full_name: 'Arun Bahubali',
    email: 'arun.designer@bavi.in',
    phone: '+91 98450 12345',
    specialization: 'Principal Architect & Luxury Villa Specialist',
    bio: 'Over 14 years shaping iconic luxury residential structures and villas in Karnataka.',
    customers_count: 6,
    active_projects_count: 4,
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    company_code: 'BAVI-DES-1024',
    full_name: 'Ananya Hegde',
    email: 'ananya.interiors@bavi.in',
    phone: '+91 98450 67890',
    specialization: 'Head of Visionary Interior Design',
    bio: 'Specialist in Italian minimalist bespoke interiors, high-end penthouses, and lighting design.',
    customers_count: 5,
    active_projects_count: 3,
  }
];

export function DesignerAuthProvider({ children }) {
  const [designer, setDesigner] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to retrieve custom registered designers
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
        setDesigner(VALID_DESIGNERS[0]);
      }
    } else {
      // Default to Arun Bahubali for immediate seamless testing
      setDesigner(VALID_DESIGNERS[0]);
      localStorage.setItem('bavi_designer_session', JSON.stringify(VALID_DESIGNERS[0]));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, companyCode) => {
    const formattedCode = companyCode?.trim().toUpperCase();
    const allDesigners = [...VALID_DESIGNERS, ...getRegisteredDesigners()];
    
    // 1. Verify Company Code against valid & registered designers
    const match = allDesigners.find(
      (d) => d.company_code === formattedCode || d.email?.toLowerCase() === email?.toLowerCase()
    );

    if (!match) {
      throw new Error('Invalid Company Code or Email. Please verify your credentials or onboard as a new designer.');
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          console.warn('Supabase auth fallback active:', error.message);
        }
      } catch {
        // Fallback
      }
    }

    // Set designer profile
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
      email: designerData.email,
      phone: designerData.phone || '+91 98450 XXXXX',
      specialization: designerData.specialization || 'Architectural Design & Engineering',
      council_reg_no: designerData.councilRegNo || 'CA/2024/' + Math.floor(10000 + Math.random() * 90000),
      bio: designerData.bio || 'Validated practicing architect with Bahubali Builders & Visionary Interiors.',
      customers_count: 0,
      active_projects_count: 0,
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

    // Store in registered designers
    const existing = getRegisteredDesigners();
    const updated = [newDesigner, ...existing.filter(d => d.email !== newDesigner.email)];
    localStorage.setItem('bavi_registered_designers', JSON.stringify(updated));

    // Automatically log in
    setDesigner(newDesigner);
    localStorage.setItem('bavi_designer_session', JSON.stringify(newDesigner));
    return newDesigner;
  };

  const logout = () => {
    localStorage.removeItem('bavi_designer_session');
    setDesigner(null);
  };

  const switchDemoDesigner = (index) => {
    const selected = VALID_DESIGNERS[index] || VALID_DESIGNERS[0];
    setDesigner(selected);
    localStorage.setItem('bavi_designer_session', JSON.stringify(selected));
  };

  return (
    <DesignerAuthContext.Provider
      value={{
        designer,
        loading,
        login,
        register,
        logout,
        switchDemoDesigner,
      }}
    >
      {children}
    </DesignerAuthContext.Provider>
  );
}

export const useDesignerAuth = () => useContext(DesignerAuthContext);
