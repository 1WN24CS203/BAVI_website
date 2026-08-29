'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const DesignerAuthContext = createContext({
  designer: null,
  loading: true,
  hasOwner: false,
  registerOwner: async () => {},
  submitAccessRequest: async () => {},
  checkRequestStatus: () => null,
  getRequests: () => [],
  approveRequest: async () => {},
  rejectRequest: async () => {},
  login: async () => {},
  logout: () => {},
});

// Session duration: 24 hours
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;

export function DesignerAuthProvider({ children }) {
  const [designer, setDesigner] = useState(null);
  const [hasOwner, setHasOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to get owner
  const getOwner = () => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('bavi_site_owner');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const saveOwner = (ownerData) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('bavi_site_owner', JSON.stringify(ownerData));
      setHasOwner(true);
    } catch (err) {
      console.warn('Failed to save owner:', err);
    }
  };

  // Helper for requests
  const getStoredRequests = () => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('bavi_designer_access_requests');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveRequests = (requests) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('bavi_designer_access_requests', JSON.stringify(requests));
    } catch (err) {
      console.warn('Failed to save requests:', err);
    }
  };

  // Helper for approved designers
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
    // 1. Check if owner exists
    const owner = getOwner();
    setHasOwner(!!owner);

    // 2. Check active session
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

  // 1. FIRST REGISTRATION: Register as Site Owner / Admin
  const registerOwner = async (ownerData) => {
    const { fullName, email, password, phone, specialization, bio } = ownerData;

    if (!fullName || !email || !password) {
      throw new Error('Please enter your full name, email, and password.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const ownerSession = {
      id: 'owner-' + Date.now(),
      company_code: 'BAVI-OWNER-ADMIN',
      full_name: fullName.trim(),
      email: normalizedEmail,
      password: password,
      phone: phone?.trim() || '',
      specialization: specialization || 'Principal Architect & Site Owner',
      bio: bio?.trim() || '',
      isOwner: true,
      role: 'owner',
      registeredAt: new Date().toISOString(),
      sessionCreatedAt: Date.now()
    };

    saveOwner(ownerSession);
    setDesigner(ownerSession);
    localStorage.setItem('bavi_designer_session', JSON.stringify(ownerSession));

    // Optional Supabase registration
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signUp({
          email: normalizedEmail,
          password: password,
          options: {
            data: {
              full_name: ownerSession.full_name,
              role: 'owner'
            }
          }
        });
      } catch (err) {
        console.warn('Supabase owner registration notice:', err);
      }
    }

    return ownerSession;
  };

  // 2. SUBSEQUENT REGISTRATIONS: Submit Access Request to Owner
  const submitAccessRequest = async (applicantData) => {
    const { fullName, email, phone, password, specialization, councilRegNo, bio } = applicantData;

    if (!fullName || !email || !password) {
      throw new Error('Please provide your full name, email, and password.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const allRequests = getStoredRequests();

    const existing = allRequests.find(r => r.email === normalizedEmail && r.status !== 'REJECTED');
    if (existing) {
      if (existing.status === 'PENDING') {
        throw new Error('An application with this email is already awaiting owner review.');
      } else if (existing.status === 'APPROVED') {
        throw new Error(`Your application is already approved! Your security key is: ${existing.generatedCode}`);
      }
    }

    const owner = getOwner();

    const newRequest = {
      id: 'req-' + Date.now(),
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || '',
      password: password,
      specialization: specialization || 'Interior Architect',
      councilRegNo: councilRegNo?.trim() || '',
      bio: bio?.trim() || '',
      status: 'PENDING',
      submittedTo: owner ? owner.full_name : 'BAVI Owner',
      requestedAt: new Date().toISOString(),
      approvedAt: null,
      generatedCode: null,
      rejectionReason: null
    };

    const updated = [newRequest, ...allRequests.filter(r => r.email !== normalizedEmail)];
    saveRequests(updated);

    return newRequest;
  };

  // 3. Check Status
  const checkRequestStatus = (email) => {
    if (!email) return null;
    const normalizedEmail = email.trim().toLowerCase();
    const allRequests = getStoredRequests();
    return allRequests.find(r => r.email === normalizedEmail) || null;
  };

  // 4. Get all requests
  const getRequests = () => {
    return getStoredRequests();
  };

  // 5. Owner approves request & generates security key
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
          approvedBy: designer?.full_name || 'Site Owner'
        };
      }
      return r;
    });

    saveRequests(updatedRequests);

    // Save to approved designers
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
      approvedBy: designer?.full_name || 'Site Owner'
    };

    const approvedList = getApprovedDesigners();
    const updatedApproved = [approvedDesigner, ...approvedList.filter(d => d.email !== targetReq.email)];
    saveApprovedDesigners(updatedApproved);

    return { request: targetReq, token, designer: approvedDesigner };
  };

  // 6. Owner rejects request
  const rejectRequest = async (requestId, reason = 'Credentials could not be verified by owner') => {
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

  // 7. Login
  const login = async (email, password, companyCode) => {
    if (!email || !email.trim()) {
      throw new Error('Email is required.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const formattedCode = companyCode?.trim().toUpperCase();

    // Check if this is the registered Site Owner
    const owner = getOwner();
    if (owner && owner.email.toLowerCase() === normalizedEmail) {
      if (owner.password && owner.password !== password) {
        throw new Error('Incorrect password for Site Owner account.');
      }
      const sessionData = { ...owner, sessionCreatedAt: Date.now() };
      setDesigner(sessionData);
      localStorage.setItem('bavi_designer_session', JSON.stringify(sessionData));
      return sessionData;
    }

    // If not owner, must provide security key
    if (!formattedCode) {
      throw new Error('Security Key code is required for designer access. (If you are the owner, sign in with your registered owner email).');
    }

    // Check approved designers
    const approvedList = getApprovedDesigners();
    const approvedMatch = approvedList.find(
      d => d.company_code === formattedCode && d.email.toLowerCase() === normalizedEmail
    );

    if (approvedMatch) {
      if (approvedMatch.password && approvedMatch.password !== password) {
        throw new Error('Incorrect password.');
      }
      const sessionData = { ...approvedMatch, sessionCreatedAt: Date.now() };
      setDesigner(sessionData);
      localStorage.setItem('bavi_designer_session', JSON.stringify(sessionData));
      return sessionData;
    }

    // Check if applicant is pending
    const pendingReq = getStoredRequests().find(r => r.email === normalizedEmail);
    if (pendingReq) {
      if (pendingReq.status === 'PENDING') {
        throw new Error('Your designer application is pending approval by the Site Owner.');
      } else if (pendingReq.status === 'REJECTED') {
        throw new Error(`Your application was not approved: ${pendingReq.rejectionReason || 'Please contact owner.'}`);
      }
    }

    throw new Error(
      'Authentication failed. Invalid email, password, or security key. ' +
      'If you have not been approved yet, please submit a request on the registration page.'
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
        hasOwner,
        registerOwner,
        submitAccessRequest,
        checkRequestStatus,
        getRequests,
        approveRequest,
        rejectRequest,
        login,
        logout,
      }}
    >
      {children}
    </DesignerAuthContext.Provider>
  );
}

export const useDesignerAuth = () => useContext(DesignerAuthContext);
