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
  getApprovedDesignersList: () => [],
  getAllActivityLog: () => [],
  logActivity: () => {},
});

// Session duration: 24 hours
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;

// Departments
const BASE_DEPARTMENTS = {
  architecture: { name: 'architecture', display: 'Architecture & Design' },
  construction: { name: 'construction', display: 'Construction & Management' },
  marketing: { name: 'marketing', display: 'Marketing & Sales' },
  tech: { name: 'tech', display: 'Tech & Digitalization' },
  admin: { name: 'admin', display: 'Owner / Administration' },
};

export function DesignerAuthProvider({ children }) {
  const [designer, setDesigner] = useState(null);
  const [hasOwner, setHasOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState(BASE_DEPARTMENTS);

  // --- LocalStorage helpers for Departments ---
  const getStoredDepts = () => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('bavi_departments');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  };

  const saveDepts = (depts) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('bavi_departments', JSON.stringify(depts));
      setDepartments(depts);
    } catch (err) { console.warn('Failed to save departments:', err); }
  };

  // Department change requests
  const getDeptRequests = () => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('bavi_department_requests');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  };

  const saveDeptRequests = (reqs) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('bavi_department_requests', JSON.stringify(reqs));
    } catch (err) { console.warn('Failed to save dept requests:', err); }
  };

  // --- LocalStorage helpers ---
  const getOwner = () => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('bavi_site_owner');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  };

  const saveOwner = (ownerData) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('bavi_site_owner', JSON.stringify(ownerData));
      // Once owner registers, set keyless-disabled flag
      localStorage.setItem('bavi_owner_keyless_disabled', 'true');
      setHasOwner(true);
    } catch (err) {
      console.warn('Failed to save owner:', err);
    }
  };

  const getStoredRequests = () => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('bavi_designer_access_requests');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  };

  const saveRequests = (requests) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('bavi_designer_access_requests', JSON.stringify(requests));
    } catch (err) {
      console.warn('Failed to save requests:', err);
    }
  };

  const getApprovedDesigners = () => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('bavi_approved_designers');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  };

  const saveApprovedDesigners = (designers) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('bavi_approved_designers', JSON.stringify(designers));
    } catch (err) {
      console.warn('Failed to save approved designers:', err);
    }
  };

  // --- Activity Log ---
  const getActivityLog = () => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('bavi_activity_log');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  };

  const saveActivityLog = (logs) => {
    if (typeof window === 'undefined') return;
    try {
      // Keep last 500 entries
      const trimmed = logs.slice(0, 500);
      localStorage.setItem('bavi_activity_log', JSON.stringify(trimmed));
    } catch (err) {
      console.warn('Failed to save activity log:', err);
    }
  };

  const logActivity = (action, resourceType, resourceName, details = {}) => {
    const log = getActivityLog();
    const entry = {
      id: 'log-' + Date.now(),
      actor_id: designer?.id || 'unknown',
      actor_name: designer?.full_name || 'Unknown',
      actor_type: designer?.isOwner ? 'owner' : 'designer',
      department: designer?.department || 'admin',
      action,
      resource_type: resourceType,
      resource_name: resourceName,
      details,
      created_at: new Date().toISOString(),
    };
    saveActivityLog([entry, ...log]);
  };

  const getAllActivityLog = () => getActivityLog();

  // --- Init ---
  useEffect(() => {
    const owner = getOwner();
    setHasOwner(!!owner);

    // Load dynamic departments
    const storedDepts = getStoredDepts();
    if (storedDepts) setDepartments(storedDepts);

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
          // Legacy session without sessionCreatedAt — assign fresh timestamp and re-save
          const refreshed = { ...parsed, sessionCreatedAt: Date.now() };
          localStorage.setItem('bavi_designer_session', JSON.stringify(refreshed));
          setDesigner(refreshed);
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

  // ================================================================
  // 1. REGISTER OWNER (First-time only)
  // ================================================================
  const registerOwner = async (ownerData) => {
    const { fullName, email, password, phone, specialization, bio } = ownerData;

    if (!fullName || !email || !password) {
      throw new Error('Please enter your full name, email, and password.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    // Check if owner already exists
    const existingOwner = getOwner();
    if (existingOwner) {
      throw new Error('A site owner has already been registered. New owners must be approved by the existing owner.');
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
      department: 'admin',
      permissions: {
        view_all_projects: true,
        manage_all_departments: true,
        approve_keys: true,
        view_callbacks: true,
        manage_employees: true,
        manage_permissions: true,
        view_activity_log: true,
      },
      registeredAt: new Date().toISOString(),
      sessionCreatedAt: Date.now(),
    };

    saveOwner(ownerSession);
    setDesigner(ownerSession);
    localStorage.setItem('bavi_designer_session', JSON.stringify(ownerSession));

    // Log activity
    const log = getActivityLog();
    saveActivityLog([{
      id: 'log-' + Date.now(),
      actor_id: ownerSession.id,
      actor_name: ownerSession.full_name,
      actor_type: 'owner',
      department: 'admin',
      action: 'owner_registered',
      resource_type: 'system',
      resource_name: 'Site Owner Registration',
      details: { email: normalizedEmail },
      created_at: new Date().toISOString(),
    }, ...log]);

    // Optional Supabase registration
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signUp({
          email: normalizedEmail,
          password: password,
          options: { data: { full_name: ownerSession.full_name, role: 'owner' } },
        });
      } catch (err) {
        console.warn('Supabase owner registration notice:', err);
      }
    }

    return ownerSession;
  };

  // ================================================================
  // 2. SUBMIT ACCESS REQUEST (Employees & subsequent "owners")
  // ================================================================
  const submitAccessRequest = async (applicantData) => {
    const { fullName, email, phone, password, specialization, councilRegNo, bio, department, requestedRole } = applicantData;

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
    const isKeylessDisabled = localStorage.getItem('bavi_owner_keyless_disabled') === 'true';

    // Determine if this is an owner request or employee request
    const isOwnerRequest = requestedRole === 'owner';

    const newRequest = {
      id: 'req-' + Date.now(),
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || '',
      password: password,
      specialization: specialization || 'Interior Architect',
      councilRegNo: councilRegNo?.trim() || '',
      bio: bio?.trim() || '',
      department: department || 'architecture',
      requestedRole: requestedRole || 'designer',
      isOwnerRequest: isOwnerRequest,
      // If keyless is disabled for owners, they only get approval (no key)
      keylessDisabled: isOwnerRequest && isKeylessDisabled,
      status: 'PENDING',
      submittedTo: owner ? owner.full_name : 'BAVI Owner',
      requestedAt: new Date().toISOString(),
      approvedAt: null,
      generatedCode: null,
      rejectionReason: null,
    };

    const updated = [newRequest, ...allRequests.filter(r => r.email !== normalizedEmail)];
    saveRequests(updated);

    return newRequest;
  };

  // ================================================================
  // 3. CHECK REQUEST STATUS
  // ================================================================
  const checkRequestStatus = (email) => {
    if (!email) return null;
    const normalizedEmail = email.trim().toLowerCase();
    const allRequests = getStoredRequests();
    return allRequests.find(r => r.email === normalizedEmail) || null;
  };

  // ================================================================
  // 4. GET ALL REQUESTS
  // ================================================================
  const getRequests = () => getStoredRequests();

  // ================================================================
  // 5. APPROVE REQUEST
  // ================================================================
  const approveRequest = async (requestId, customCode) => {
    const allRequests = getStoredRequests();
    const targetReq = allRequests.find(r => r.id === requestId);
    if (!targetReq) throw new Error('Request not found.');

    const isOwnerRequest = targetReq.isOwnerRequest;
    const isKeylessDisabled = localStorage.getItem('bavi_owner_keyless_disabled') === 'true';

    // For owner requests when keyless is disabled: approval only, no security key
    let token;
    if (isOwnerRequest && isKeylessDisabled) {
      token = 'APPROVAL-ONLY';
    } else {
      token = customCode || `BAVI-DES-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const updatedRequests = allRequests.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'APPROVED',
          generatedCode: token,
          approvedAt: new Date().toISOString(),
          approvedBy: designer?.full_name || 'Site Owner',
        };
      }
      return r;
    });

    saveRequests(updatedRequests);

    // Determine permissions based on department and role
    const departmentPermissions = {
      architecture: {
        view_own_projects: true,
        manage_own_projects: true,
        upload_documents: true,
        approve_stages: true,
        view_client_requirements: true,
        create_srs: true,
      },
      construction: {
        view_assigned_projects: true,
        manage_materials: true,
        manage_inspections: true,
        manage_contractors: true,
        manage_safety: true,
        manage_equipment: true,
        approve_stages: true,
      },
      marketing: {
        view_callbacks: true,
        manage_callbacks: true,
        manage_leads: true,
        view_consultations: true,
        view_client_feedback: true,
      },
      tech: {
        manage_tech_systems: true,
        manage_digital_assets: true,
        request_add_department: true,
        request_remove_department: true,
        view_system_logs: true,
        manage_integrations: true,
      },
      admin: {
        view_all_projects: true,
        manage_all_departments: true,
        approve_keys: true,
        view_callbacks: true,
        manage_employees: true,
        manage_permissions: true,
        view_activity_log: true,
      },
    };

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
      department: targetReq.department || 'architecture',
      role: targetReq.requestedRole || 'designer',
      isOwner: isOwnerRequest && !isKeylessDisabled,
      permissions: departmentPermissions[targetReq.department] || departmentPermissions.architecture,
      approvedAt: new Date().toISOString(),
      approvedBy: designer?.full_name || 'Site Owner',
    };

    const approvedList = getApprovedDesigners();
    const updatedApproved = [approvedDesigner, ...approvedList.filter(d => d.email !== targetReq.email)];
    saveApprovedDesigners(updatedApproved);

    // Log activity
    logActivity('approved_access_request', 'employee', targetReq.fullName, {
      department: targetReq.department,
      role: targetReq.requestedRole,
      securityKey: token,
    });

    return { request: targetReq, token, designer: approvedDesigner };
  };

  // ================================================================
  // 6. REJECT REQUEST
  // ================================================================
  const rejectRequest = async (requestId, reason = 'Credentials could not be verified by owner') => {
    const allRequests = getStoredRequests();
    const targetReq = allRequests.find(r => r.id === requestId);
    const updatedRequests = allRequests.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'REJECTED',
          rejectionReason: reason,
          rejectedAt: new Date().toISOString(),
        };
      }
      return r;
    });
    saveRequests(updatedRequests);

    // Log activity
    logActivity('rejected_access_request', 'employee', targetReq?.fullName || 'Unknown', { reason });

    return true;
  };

  // ================================================================
  // 7. LOGIN
  // ================================================================
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

      // Log activity
      const log = getActivityLog();
      saveActivityLog([{
        id: 'log-' + Date.now(),
        actor_id: owner.id,
        actor_name: owner.full_name,
        actor_type: 'owner',
        department: 'admin',
        action: 'owner_login',
        resource_type: 'session',
        resource_name: 'Owner Login',
        details: {},
        created_at: new Date().toISOString(),
      }, ...log]);

      return sessionData;
    }

    // Check for approval-only owners (no security key needed)
    const approvedList = getApprovedDesigners();
    const approvalOnlyMatch = approvedList.find(
      d => d.email.toLowerCase() === normalizedEmail && d.company_code === 'APPROVAL-ONLY'
    );

    if (approvalOnlyMatch) {
      if (approvalOnlyMatch.password && approvalOnlyMatch.password !== password) {
        throw new Error('Incorrect password.');
      }
      const sessionData = { ...approvalOnlyMatch, sessionCreatedAt: Date.now() };
      setDesigner(sessionData);
      localStorage.setItem('bavi_designer_session', JSON.stringify(sessionData));
      return sessionData;
    }

    // If not owner, must provide security key
    if (!formattedCode) {
      throw new Error('Security Key code is required for employee access. (If you are the owner, sign in with your registered owner email).');
    }

    // Check approved designers with security key
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

      // Log activity
      const log = getActivityLog();
      saveActivityLog([{
        id: 'log-' + Date.now(),
        actor_id: approvedMatch.id,
        actor_name: approvedMatch.full_name,
        actor_type: 'designer',
        department: approvedMatch.department || 'architecture',
        action: 'employee_login',
        resource_type: 'session',
        resource_name: 'Employee Login',
        details: { department: approvedMatch.department },
        created_at: new Date().toISOString(),
      }, ...log]);

      return sessionData;
    }

    // Check if applicant is pending
    const pendingReq = getStoredRequests().find(r => r.email === normalizedEmail);
    if (pendingReq) {
      if (pendingReq.status === 'PENDING') {
        throw new Error('Your access application is pending approval by the Site Owner.');
      } else if (pendingReq.status === 'REJECTED') {
        throw new Error(`Your application was not approved: ${pendingReq.rejectionReason || 'Please contact owner.'}`);
      }
    }

    throw new Error(
      'Authentication failed. Invalid email, password, or security key. ' +
      'If you have not been approved yet, please submit a request on the registration page.'
    );
  };

  // ================================================================
  // 8. LOGOUT
  // ================================================================
  const logout = () => {
    // Log activity before clearing session
    if (designer) {
      const log = getActivityLog();
      saveActivityLog([{
        id: 'log-' + Date.now(),
        actor_id: designer.id,
        actor_name: designer.full_name,
        actor_type: designer.isOwner ? 'owner' : 'designer',
        department: designer.department || 'admin',
        action: 'logout',
        resource_type: 'session',
        resource_name: 'Session Logout',
        details: {},
        created_at: new Date().toISOString(),
      }, ...log]);
    }

    localStorage.removeItem('bavi_designer_session');
    if (isSupabaseConfigured()) {
      supabase.auth.signOut().catch(() => {});
    }
    setDesigner(null);
  };

  // ================================================================
  // 9. DEPARTMENT MANAGEMENT (Tech & Digitalization)
  // ================================================================

  // Tech submits a request to add/remove a department — owner must approve
  const submitDepartmentRequest = (action, deptData) => {
    if (designer?.department !== 'tech' && !designer?.isOwner) {
      throw new Error('Only Tech & Digitalization department can submit department change requests.');
    }
    const allReqs = getDeptRequests();
    const newReq = {
      id: 'dreq-' + Date.now(),
      action, // 'add' | 'remove'
      deptKey: deptData.key?.toLowerCase().replace(/\s+/g, '_'),
      deptDisplay: deptData.display,
      deptRoutes: deptData.routes || [],
      requestedBy: designer?.full_name,
      requestedByDept: designer?.department,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: null,
    };
    saveDeptRequests([newReq, ...allReqs]);
    logActivity('submitted_dept_request', 'department', deptData.display, { action });
    return newReq;
  };

  // Owner approves a department change request
  const approveDepartmentRequest = (reqId) => {
    if (!designer?.isOwner && designer?.department !== 'admin') {
      throw new Error('Only the Site Owner can approve department changes.');
    }
    const allReqs = getDeptRequests();
    const req = allReqs.find(r => r.id === reqId);
    if (!req) throw new Error('Department request not found.');

    const currentDepts = getStoredDepts() || { ...BASE_DEPARTMENTS };

    if (req.action === 'add') {
      if (currentDepts[req.deptKey]) {
        throw new Error(`Department "${req.deptDisplay}" already exists.`);
      }
      currentDepts[req.deptKey] = { name: req.deptKey, display: req.deptDisplay, custom: true };
    } else if (req.action === 'remove') {
      // Never allow removing base departments or admin/tech
      const protected_depts = ['admin', 'tech', 'architecture', 'construction', 'marketing'];
      if (protected_depts.includes(req.deptKey)) {
        throw new Error(`The "${req.deptDisplay}" department is protected and cannot be removed.`);
      }
      delete currentDepts[req.deptKey];
    }

    saveDepts(currentDepts);

    const updated = allReqs.map(r => r.id === reqId
      ? { ...r, status: 'APPROVED', approvedAt: new Date().toISOString(), approvedBy: designer?.full_name }
      : r
    );
    saveDeptRequests(updated);
    logActivity('approved_dept_request', 'department', req.deptDisplay, { action: req.action });
    return currentDepts;
  };

  // Owner rejects a department change request
  const rejectDepartmentRequest = (reqId, reason = 'Not approved by owner') => {
    const allReqs = getDeptRequests();
    const updated = allReqs.map(r => r.id === reqId
      ? { ...r, status: 'REJECTED', rejectedAt: new Date().toISOString(), rejectionReason: reason }
      : r
    );
    saveDeptRequests(updated);
    logActivity('rejected_dept_request', 'department', reqId, { reason });
    return true;
  };

  const getDepartmentRequests = () => getDeptRequests();

  // ================================================================
  // 9. UTILITY: Get approved designers list (for owner)
  // ================================================================
  const getApprovedDesignersList = () => getApprovedDesigners();

  return (
    <DesignerAuthContext.Provider
      value={{
        designer,
        loading,
        hasOwner,
        departments,
        registerOwner,
        submitAccessRequest,
        checkRequestStatus,
        getRequests,
        approveRequest,
        rejectRequest,
        login,
        logout,
        getApprovedDesignersList,
        getAllActivityLog,
        logActivity,
        // Department management
        submitDepartmentRequest,
        approveDepartmentRequest,
        rejectDepartmentRequest,
        getDepartmentRequests,
      }}
    >
      {children}
    </DesignerAuthContext.Provider>
  );
}

export const useDesignerAuth = () => useContext(DesignerAuthContext);
