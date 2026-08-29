'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const DesignerAuthContext = createContext({
  designer: null,
  loading: true,
  login: async () => {},
  submitAccessRequest: async () => {},
  checkRequestStatus: () => null,
  getRequests: () => [],
  approveRequest: async () => {},
  rejectRequest: async () => {},
  logout: () => {},
});

// Master / Owner Designers who are permanently pre-authorized
export const MASTER_DESIGNERS = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    company_code: 'BAVI-DES-7890',
    full_name: 'Arun Bahubali',
    email: 'interiorsbavi@gmail.com',
    phone: '8277762487',
    specialization: 'Principal Architect & Founder',
    isOwner: true,
    bio: '! WE BOND YOUR SPACE WITH BAHUBALI GRACE !',
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    company_code: 'BAVI-DES-1024',
    full_name: 'Ananya Hegde',
    email: 'ananya.hegde@bavi.in',
    phone: '8277762487',
    specialization: 'Head of Visionary Interior Design',
    isOwner: false,
    bio: '! WE BOND YOUR SPACE WITH BAHUBALI GRACE !',
  }
];

// Session validity: 24 hours
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;

export function DesignerAuthProvider({ children }) {
  const [designer, setDesigner] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to read requests from storage
  const getStoredRequests = () => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('bavi_designer_access_requests');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Helper to save requests to storage
  const saveRequests = (requests) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('bavi_designer_access_requests', JSON.stringify(requests));
    } catch (err) {
      console.warn('Failed to save designer requests:', err);
    }
  };

  // Helper to get approved designers
  const getApprovedDesigners = () => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('bavi_approved_designers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveApprovedDesigners = (designers) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('bavi_approved_designers', JSON.stringify(designers));
    } catch (err) {
      console.warn('Failed to save approved designers:', err);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('bavi_designer_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.full_name && parsed.sessionCreatedAt) {
          const elapsed = Date.now() - parsed.sessionCreatedAt;
          if (elapsed < SESSION_EXPIRY_MS) {
            setDesigner(parsed);
          } else {
            localStorage.removeItem('bavi_designer_session');
            setDesigner(null);
          }
        } else if (parsed && parsed.full_name) {
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

  // 1. Submit Access Request by new applicant
  const submitAccessRequest = async (applicantData) => {
    const { fullName, email, phone, password, specialization, councilRegNo, bio, approverId, approverName } = applicantData;

    if (!fullName || !email || !password) {
      throw new Error('Please provide your full name, corporate email, and password.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const allRequests = getStoredRequests();

    // Check if pending or approved request already exists for this email
    const existing = allRequests.find(r => r.email === normalizedEmail && r.status !== 'REJECTED');
    if (existing) {
      if (existing.status === 'PENDING') {
        throw new Error('An access request with this email is already awaiting approval from ' + (existing.approverName || 'the architect') + '.');
      } else if (existing.status === 'APPROVED') {
        throw new Error(`Your application is already approved! Your security token is: ${existing.generatedCode}. You can log in now.`);
      }
    }

    const newRequest = {
      id: 'req-' + Date.now(),
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || '',
      password: password, // preserved for login verification once approved
      specialization: specialization || 'Principal Luxury Villa Architect',
      councilRegNo: councilRegNo?.trim() || '',
      bio: bio?.trim() || '',
      approverId: approverId || MASTER_DESIGNERS[0].id,
      approverName: approverName || MASTER_DESIGNERS[0].full_name,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      approvedAt: null,
      generatedCode: null,
      rejectionReason: null
    };

    const updated = [newRequest, ...allRequests.filter(r => r.email !== normalizedEmail)];
    saveRequests(updated);

    // Optional Supabase backup
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('designer_requests').insert([{
          full_name: newRequest.fullName,
          email: newRequest.email,
          phone: newRequest.phone,
          specialization: newRequest.specialization,
          council_reg_no: newRequest.councilRegNo,
          approver_name: newRequest.approverName,
          status: 'PENDING'
        }]);
      } catch (err) {
        console.warn('Supabase request log error:', err);
      }
    }

    return newRequest;
  };

  // 2. Check Request Status
  const checkRequestStatus = (email) => {
    if (!email) return null;
    const normalizedEmail = email.trim().toLowerCase();
    const allRequests = getStoredRequests();
    return allRequests.find(r => r.email === normalizedEmail) || null;
  };

  // 3. Get all requests (for dashboard review)
  const getRequests = () => {
    return getStoredRequests();
  };

  // 4. Approve request & generate Unique Security Token
  const approveRequest = async (requestId, customCode) => {
    const allRequests = getStoredRequests();
    const targetReq = allRequests.find(r => r.id === requestId);
    if (!targetReq) throw new Error('Request not found.');

    const token = customCode || `BAVI-DES-${Math.floor(1000 + Math.random() * 9000)}`;

    const updatedRequests = allRequests.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'APPROVED',
          generatedCode: token,
          approvedAt: new Date().toISOString(),
          approvedBy: designer?.full_name || 'Master Architect'
        };
      }
      return r;
    });

    saveRequests(updatedRequests);

    // Add to approved designers for login
    const approvedDesigner = {
      id: 'des-' + Date.now(),
      company_code: token,
      full_name: targetReq.fullName,
      email: targetReq.email,
      password: targetReq.password,
      phone: targetReq.phone,
      specialization: targetReq.specialization,
      councilRegNo: targetReq.councilRegNo,
      bio: targetReq.bio,
      isOwner: false,
      approvedAt: new Date().toISOString(),
      approvedBy: designer?.full_name || 'Master Architect'
    };

    const approvedList = getApprovedDesigners();
    const updatedApproved = [approvedDesigner, ...approvedList.filter(d => d.email !== targetReq.email)];
    saveApprovedDesigners(updatedApproved);

    // Supabase sync
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('designer_requests').update({
          status: 'APPROVED',
          generated_code: token
        }).eq('email', targetReq.email);
      } catch (err) {
        console.warn('Supabase approval sync error:', err);
      }
    }

    return { request: targetReq, token, designer: approvedDesigner };
  };

  // 5. Reject request
  const rejectRequest = async (requestId, reason = 'Credentials could not be verified') => {
    const allRequests = getStoredRequests();
    const updatedRequests = allRequests.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'REJECTED',
          rejectionReason: reason,
          rejectedAt: new Date().toISOString()
        };
      }
      return r;
    });
    saveRequests(updatedRequests);
    return true;
  };

  // 6. Login Function
  const login = async (email, password, companyCode) => {
    if (!email || !email.trim()) {
      throw new Error('Email is required.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    if (!companyCode || !companyCode.trim()) {
      throw new Error('Security key code is required.');
    }

    const formattedCode = companyCode.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    // Check Master Designers (Owner / Principal Architects)
    const masterMatch = MASTER_DESIGNERS.find(
      d => d.company_code === formattedCode && d.email.toLowerCase() === normalizedEmail
    );

    if (masterMatch) {
      const sessionData = { ...masterMatch, sessionCreatedAt: Date.now() };
      setDesigner(sessionData);
      localStorage.setItem('bavi_designer_session', JSON.stringify(sessionData));
      return sessionData;
    }

    // Check Approved Designers List
    const approvedList = getApprovedDesigners();
    const approvedMatch = approvedList.find(
      d => d.company_code === formattedCode && d.email.toLowerCase() === normalizedEmail
    );

    if (approvedMatch) {
      if (approvedMatch.password && approvedMatch.password !== password) {
        throw new Error('Incorrect password. Please verify your portal password.');
      }
      const sessionData = { ...approvedMatch, sessionCreatedAt: Date.now() };
      setDesigner(sessionData);
      localStorage.setItem('bavi_designer_session', JSON.stringify(sessionData));
      return sessionData;
    }

    // Check if user has a pending request
    const pendingReq = getStoredRequests().find(r => r.email === normalizedEmail);
    if (pendingReq) {
      if (pendingReq.status === 'PENDING') {
        throw new Error(`Your application is currently pending approval by ${pendingReq.approverName || 'the master architect'}. Once approved, you will receive your security key.`);
      } else if (pendingReq.status === 'REJECTED') {
        throw new Error(`Your application was not approved: ${pendingReq.rejectionReason || 'Please contact BAVI administration.'}`);
      }
    }

    // If Supabase is configured, try auth as secondary verification
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password
        });
        if (!error && data?.user) {
          const sessionData = {
            id: data.user.id,
            company_code: formattedCode,
            full_name: data.user.user_metadata?.full_name || normalizedEmail.split('@')[0],
            email: normalizedEmail,
            phone: data.user.user_metadata?.phone || '',
            specialization: data.user.user_metadata?.specialization || 'Architectural Design',
            sessionCreatedAt: Date.now()
          };
          setDesigner(sessionData);
          localStorage.setItem('bavi_designer_session', JSON.stringify(sessionData));
          return sessionData;
        }
      } catch {
        // fall through
      }
    }

    throw new Error(
      'Authentication failed. Invalid email, password, or security token. ' +
      'If you are a new architect, please submit an access request on the registration page.'
    );
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
        submitAccessRequest,
        checkRequestStatus,
        getRequests,
        approveRequest,
        rejectRequest,
        logout,
      }}
    >
      {children}
    </DesignerAuthContext.Provider>
  );
}

export const useDesignerAuth = () => useContext(DesignerAuthContext);
