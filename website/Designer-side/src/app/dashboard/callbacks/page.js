'use client';

import { useState, useEffect } from 'react';
import {
  PhoneCall, Clock, CheckCircle2, User, Mail, Phone, MessageSquare,
  AlertCircle, Filter, Calendar, ArrowUpRight, Sparkles, CheckCircle, RefreshCw, 
  ShieldCheck, KeyRound, Send, Copy, Check, Eye, X, Building, Layers
} from 'lucide-react';
import DesignerHeader from '@/components/Header';
import {
  Button, Badge, Card, Toast, Tabs,
  EmptyState, Divider, Tag, StatusDot, SearchInput, Avatar
} from '@/components/astryx';
import { useDesignerAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const DEFAULT_STAGES = [
  { id: 'stage-1', title: 'Architectural Blueprint & Spatial Planning', progress: 0, status: 'pending', documents: [], queries: [] },
  { id: 'stage-2', title: '3D Photorealistic Interior Concepts', progress: 0, status: 'pending', documents: [], queries: [] },
  { id: 'stage-3', title: 'Structural & MEP Engineering Sanctions', progress: 0, status: 'pending', documents: [], queries: [] },
  { id: 'stage-4', title: 'Material Procurement & Finish Specifications', progress: 0, status: 'pending', documents: [], queries: [] },
  { id: 'stage-5', title: 'On-Site Construction & Millwork Execution', progress: 0, status: 'pending', documents: [], queries: [] },
  { id: 'stage-6', title: 'Quality Snagging & Turnkey Handover', progress: 0, status: 'pending', documents: [], queries: [] },
];

export default function CallbackRequestsPage() {
  const { designer, logActivity } = useDesignerAuth();
  const [callbacks, setCallbacks] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Booking & Credential Generation Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingTarget, setBookingTarget] = useState(null);
  const [bookingData, setBookingData] = useState({
    fullName: '',
    phone: '',
    email: '',
    clientCode: '',
    generatedPassword: '',
    projectTitle: '',
    category: 'residential',
    budget: '',
    location: '',
  });

  // Official Email Dispatch Preview Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [dispatchedEmail, setDispatchedEmail] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadCallbacks();
  }, []);

  const normalizeStatus = (rawStatus) => {
    if (!rawStatus) return 'pending';
    const s = String(rawStatus).toLowerCase();
    if (s === 'attended' || s === 'contacted') return 'attended';
    if (s === 'resolved' || s === 'completed' || s === 'booked') return 'resolved';
    return 'pending';
  };

  const loadCallbacks = async () => {
    let list = [];
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('callback_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          list = data.map(c => ({
            ...c,
            name: c.name || 'Inquiry Contact',
            phone: c.phone || 'Not provided',
            is_client: Boolean(c.is_client),
            status: normalizeStatus(c.status),
            created_at: c.created_at || new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch callbacks error:', err);
      }
    }

    if (list.length === 0) {
      try {
        const stored = localStorage.getItem('bavi_callback_requests');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed.map(c => ({
              ...c,
              name: c.name || c.clientName || 'Inquiry Contact',
              phone: c.phone || 'Not provided',
              is_client: Boolean(c.is_client ?? c.isClient ?? false),
              status: normalizeStatus(c.status),
              created_at: c.created_at || c.requestedAt || new Date().toISOString(),
            }));
          }
        }
      } catch {}
    }

    setCallbacks(list);
  };

  const saveCallbacks = (data) => {
    try {
      localStorage.setItem('bavi_callback_requests', JSON.stringify(data));
    } catch {}
    setCallbacks(data);
  };

  const showToast = (msg) => { setToastMsg(msg); setToastVisible(true); };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return `Bavi#${Math.floor(1000 + Math.random() * 9000)}@${code}`;
  };

  const generateClientCode = () => {
    return `BAVI-CLI-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  // Status Handlers
  const handleMarkAttended = async (id) => {
    const updated = callbacks.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'attended',
          attended_at: new Date().toISOString(),
          attended_by: designer?.full_name || 'Design Team Architect',
        };
      }
      return c;
    });
    saveCallbacks(updated);

    if (isSupabaseConfigured() && !String(id).startsWith('cb-')) {
      try {
        await supabase.from('callback_requests').update({
          status: 'contacted',
          contacted_at: new Date().toISOString(),
          assigned_to_name: designer?.full_name || 'Design Team Architect',
        }).eq('id', id);
      } catch (err) {
        console.warn('Failed to update callback in Supabase:', err);
      }
    }

    showToast('Callback discussion recorded as Attended!');
    const target = callbacks.find(c => c.id === id);
    logActivity('attended_callback', 'callback', target?.name || 'Inquiry', { status: 'attended' });
  };

  const handleMarkResolved = async (id) => {
    const updated = callbacks.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          attended_at: c.attended_at || new Date().toISOString(),
          attended_by: c.attended_by || designer?.full_name || 'Design Team Architect',
        };
      }
      return c;
    });
    saveCallbacks(updated);

    if (isSupabaseConfigured() && !String(id).startsWith('cb-')) {
      try {
        await supabase.from('callback_requests').update({
          status: 'completed',
          contacted_at: new Date().toISOString(),
          assigned_to_name: designer?.full_name || 'Design Team Architect',
        }).eq('id', id);
      } catch (err) {
        console.warn('Failed to resolve callback in Supabase:', err);
      }
    }

    showToast('Callback request marked as Resolved!');
    const target = callbacks.find(c => c.id === id);
    logActivity('resolved_callback', 'callback', target?.name || 'Inquiry', { status: 'resolved' });
  };

  const handleRevertPending = async (id) => {
    const updated = callbacks.map(c => {
      if (c.id === id) {
        return { ...c, status: 'pending' };
      }
      return c;
    });
    saveCallbacks(updated);

    if (isSupabaseConfigured() && !String(id).startsWith('cb-')) {
      try {
        await supabase.from('callback_requests').update({ status: 'new' }).eq('id', id);
      } catch (err) {
        console.warn('Failed to revert callback in Supabase:', err);
      }
    }
    showToast('Callback request moved back to Pending (Unattended)');
  };

  // Open Project Booking & Credential Generator Modal
  // RULE: A user account can only be created AFTER the callback has been attended
  const openBookingApproval = (cb) => {
    if (cb.status === 'pending') {
      showToast('⚠️ Please mark the callback as Attended first (confirm a successful call took place) before issuing client credentials.');
      return;
    }
    setBookingTarget(cb);
    setBookingData({
      fullName: cb.name || '',
      phone: cb.phone || '',
      email: cb.email || '',
      clientCode: generateClientCode(),
      generatedPassword: generatePassword(),
      projectTitle: `${cb.name}'s Luxury Architectural Commission`,
      category: 'residential',
      budget: '7500000',
      location: 'Bengaluru / Site Plot',
    });
    setBookingModalOpen(true);
  };

  // Confirm Project Booking & Dispatch Credentials
  // RULE: User account is ONLY created after a successful callback is confirmed
  const handleConfirmBookingAndDispatch = async (e) => {
    e.preventDefault();
    if (!bookingData.email || !bookingData.fullName) {
      showToast('Client Name and Email are mandatory for issuing credentials.', 'error');
      return;
    }
    // Hard guard: callback must be attended before creating an account
    if (bookingTarget && bookingTarget.status === 'pending') {
      showToast('❌ Account creation blocked: The callback must be marked as Attended (a real call must take place) before issuing credentials.');
      setBookingModalOpen(false);
      return;
    }

    const clientId = `cli-${Date.now()}`;
    const clientRecord = {
      id: clientId,
      user_id: clientId,
      client_code: bookingData.clientCode,
      full_name: bookingData.fullName,
      email: bookingData.email.toLowerCase().trim(),
      phone: bookingData.phone,
      address: bookingData.location,
      role: 'customer',
      status: 'Active Client',
      designer_approved: true,
      password: bookingData.generatedPassword,
      approved_by: designer?.full_name || 'Design Team Architect',
      approved_at: new Date().toISOString(),
    };

    // 1. Sync to registered clients roster
    try {
      const stored = localStorage.getItem('bavi_registered_clients');
      const list = stored ? JSON.parse(stored) : [];
      const filtered = list.filter(c => c.email?.toLowerCase() !== clientRecord.email.toLowerCase());
      localStorage.setItem('bavi_registered_clients', JSON.stringify([clientRecord, ...filtered]));

      // Also save in registered accounts for offline login
      const accStored = localStorage.getItem('bavi_registered_accounts');
      const accList = accStored ? JSON.parse(accStored) : [];
      const accFiltered = accList.filter(a => a.email?.toLowerCase() !== clientRecord.email.toLowerCase());
      localStorage.setItem('bavi_registered_accounts', JSON.stringify([clientRecord, ...accFiltered]));
    } catch (err) {
      console.warn('Local client sync error:', err);
    }

    // 2. Insert/Update in Supabase profiles
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('profiles').upsert([{
          full_name: clientRecord.full_name,
          email: clientRecord.email,
          phone: clientRecord.phone,
          address: clientRecord.address,
          role: 'customer',
          metadata: {
            client_code: clientRecord.client_code,
            designer_approved: true,
            approved_by: designer?.full_name,
            approved_at: clientRecord.approved_at,
          }
        }], { onConflict: 'email' });
      } catch (err) {
        console.warn('Supabase profile upsert error:', err);
      }
    }

    // 3. Create Project Record
    const projectId = `proj-${Date.now()}`;
    const newProject = {
      id: projectId,
      title: bookingData.projectTitle,
      category: bookingData.category,
      location: bookingData.location,
      budget: parseFloat(bookingData.budget) || 0,
      client_id: clientId,
      client_name: clientRecord.full_name,
      client_email: clientRecord.email,
      client_phone: clientRecord.phone,
      progress: 0,
      completion_percentage: 0,
      status: 'planning',
      srs_status: 'not_started',
      stages: DEFAULT_STAGES.map(s => ({ ...s })),
      documents: [],
      created_at: new Date().toISOString(),
    };

    try {
      const pStored = localStorage.getItem('bavi_projects_full') || localStorage.getItem('bavi_projects');
      const pList = pStored ? JSON.parse(pStored) : [];
      localStorage.setItem('bavi_projects_full', JSON.stringify([newProject, ...pList]));
      localStorage.setItem('bavi_projects', JSON.stringify([newProject, ...pList]));
      localStorage.setItem('bavi_client_active_project', JSON.stringify(newProject));
    } catch (err) {
      console.warn('Local project save error:', err);
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('projects').insert([{
          title: newProject.title,
          category: newProject.category,
          location: newProject.location,
          budget: newProject.budget,
          client_name: newProject.client_name,
          client_email: newProject.client_email,
          client_phone: newProject.client_phone,
          stages: newProject.stages,
          documents: [],
          status: 'planning'
        }]);
      } catch (err) {
        console.warn('Supabase project insert error:', err);
      }
    }

    // 4. Update callback status to resolved / booked
    if (bookingTarget) {
      handleMarkResolved(bookingTarget.id);
    }

    // 5. Prepare and display official email dispatch preview
    const emailPayload = {
      to: clientRecord.email,
      clientName: clientRecord.full_name,
      clientId: clientRecord.client_code,
      password: bookingData.generatedPassword,
      projectTitle: bookingData.projectTitle,
      loginUrl: 'http://localhost:3000/login',
      designerName: designer?.full_name || 'Ar. Rajesh Bahubali',
      dispatchedAt: new Date().toISOString(),
    };

    setDispatchedEmail(emailPayload);
    setBookingModalOpen(false);
    setEmailModalOpen(true);

    showToast(`Project booked & Credentials issued for ${clientRecord.full_name}!`);
    logActivity('approved_project_booking', 'client', clientRecord.full_name, {
      clientId: clientRecord.client_code,
      project: bookingData.projectTitle,
      dispatchedTo: clientRecord.email,
    });
  };

  const handleCopyCredentials = () => {
    if (!dispatchedEmail) return;
    const text = 
`BAVI ARCHITECTURAL STUDIO — CLIENT ONBOARDING
Client Name: ${dispatchedEmail.clientName}
Client ID: ${dispatchedEmail.clientId}
Portal Login: ${dispatchedEmail.loginUrl}
Email ID: ${dispatchedEmail.to}
Temporary Password: ${dispatchedEmail.password}
Project Title: ${dispatchedEmail.projectTitle}
Assigned Designer: ${dispatchedEmail.designerName}

Please log in and co-pilot your architectural roadmap. You may update your password in the portal with designer notification.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Filter Categories
  const pendingCallbacks = callbacks.filter(c => c.status === 'pending');
  const attendedCallbacks = callbacks.filter(c => c.status === 'attended');
  const resolvedCallbacks = callbacks.filter(c => c.status === 'resolved');
  const clientCallbacks = callbacks.filter(c => c.is_client);
  const nonClientCallbacks = callbacks.filter(c => !c.is_client);

  const getFilteredCallbacks = () => {
    let list = callbacks;
    if (activeTab === 'pending') list = pendingCallbacks;
    else if (activeTab === 'attended') list = attendedCallbacks;
    else if (activeTab === 'resolved') list = resolvedCallbacks;
    else if (activeTab === 'client') list = clientCallbacks;
    else if (activeTab === 'non-client') list = nonClientCallbacks;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(q) ||
        c.subject?.toLowerCase().includes(q)
      );
    }
    return list;
  };

  const filtered = getFilteredCallbacks();

  const tabs = [
    { value: 'all', label: 'All Inquiries', count: callbacks.length },
    { value: 'pending', label: 'Pending Callback', count: pendingCallbacks.length },
    { value: 'attended', label: 'Callback Attended', count: attendedCallbacks.length },
    { value: 'resolved', label: 'Booked / Resolved', count: resolvedCallbacks.length },
    { value: 'non-client', label: 'Website Booking Leads', count: nonClientCallbacks.length },
  ];

  return (
    <>
      <DesignerHeader
        title="Callback &amp; Booking Concierge"
        subtitle="Manage callback conversations, approve project bookings, and issue client credentials"
      />

      <div style={{ padding: '0 4px' }}>
        {/* Notice Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(201, 168, 76, 0.08)',
          border: '1px solid rgba(201, 168, 76, 0.28)',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="#c9a84c" />
            <span style={{ fontSize: '0.86rem', color: '#e8e8e8' }}>
              <strong>Exclusive Client Access Workflow:</strong> Conduct callback conversation → Review architectural scope → Click <em>&quot;Approve Project &amp; Issue Credentials&quot;</em> to generate Client ID and mail temporary password.
            </span>
          </div>
          <Tag variant="gold">Gated Client Onboarding</Tag>
        </div>

        {/* Metrics Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.7rem', color: '#6e6e6e', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Total Inquiries</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8f8f8', marginTop: '4px' }}>{callbacks.length}</div>
          </Card>
          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.7rem', color: '#eab308', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Pending Callback</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#eab308', marginTop: '4px' }}>{pendingCallbacks.length}</div>
          </Card>
          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.7rem', color: '#60a5fa', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Callback Attended</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#60a5fa', marginTop: '4px' }}>{attendedCallbacks.length}</div>
          </Card>
          <Card variant="elevated" padding="md">
            <div style={{ fontSize: '0.7rem', color: '#4ade80', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Booked &amp; Credentials Issued</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#4ade80', marginTop: '4px' }}>{resolvedCallbacks.length}</div>
          </Card>
        </div>

        {/* Tab & Search Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(val) => setActiveTab(val)}
          />
          <div style={{ width: '280px' }}>
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by client, phone, email..."
              size="sm"
            />
          </div>
        </div>

        {/* Requests Feed */}
        {filtered.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map((cb) => {
              const isPending = cb.status === 'pending';
              const isAttended = cb.status === 'attended';
              const isResolved = cb.status === 'resolved';

              return (
                <Card key={cb.id} variant="bordered" padding="md">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                    <div style={{ display: 'flex', gap: '14px', flex: 1, minWidth: '280px' }}>
                      <Avatar
                        name={cb.name}
                        size="md"
                        color={isResolved ? 'success' : (isAttended ? 'info' : 'warning')}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{cb.name}</span>

                          {/* Status Badge */}
                          {isPending && <Badge variant="warning" dot>Pending Callback</Badge>}
                          {isAttended && <Badge variant="info" dot>Callback Attended</Badge>}
                          {isResolved && <Badge variant="success" dot>Booked &amp; Approved</Badge>}

                          {cb.is_client && <Badge variant="gold">Registered Client</Badge>}
                        </div>

                        {/* Contact Meta */}
                        <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '0.8rem', color: '#a0a0a0', marginBottom: '8px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Phone size={13} color="#c9a84c" /> {cb.phone}
                          </span>
                          {cb.email && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Mail size={13} color="#c9a84c" /> {cb.email}
                            </span>
                          )}
                        </div>

                        {/* Subject & Scope Notes */}
                        {cb.subject && (
                          <div style={{ fontSize: '0.85rem', color: '#c9a84c', fontWeight: 600, marginBottom: '4px' }}>
                            {cb.subject}
                          </div>
                        )}
                        {cb.message && (
                          <div style={{
                            fontSize: '0.82rem',
                            color: '#b0b0b0',
                            lineHeight: 1.5,
                            background: '#161616',
                            padding: '10px 14px',
                            borderRadius: '6px',
                            marginBottom: '8px',
                            borderLeft: '3px solid #c9a84c',
                            whiteSpace: 'pre-line'
                          }}>
                            {cb.message}
                          </div>
                        )}

                        {/* Timestamps */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.73rem', color: '#666' }}>
                          <span>
                            Received: {new Date(cb.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>

                          {cb.attended_at && (
                            <span style={{ color: '#60a5fa', fontWeight: 500 }}>
                              • Callback Attended by {cb.attended_by || 'Architect'}
                            </span>
                          )}

                          {cb.resolved_at && (
                            <span style={{ color: '#4ade80', fontWeight: 500 }}>
                              • Approved on {new Date(cb.resolved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Direct Link to Booking & Credential Dispatch */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                      {/* Priority Button: Approve Project & Issue Credentials */}
                      {/* RULE: Only enabled AFTER callback is attended — account created only after successful call */}
                      <div title={isPending ? 'Mark callback as Attended first (confirm a successful call)' : 'Approve and issue client credentials'}>
                        <Button
                          size="sm"
                          variant={isPending ? 'ghost' : 'gold'}
                          icon={KeyRound}
                          onClick={() => openBookingApproval(cb)}
                          style={{
                            boxShadow: isPending ? 'none' : '0 0 15px rgba(201, 168, 76, 0.3)',
                            fontWeight: 700,
                            opacity: isPending ? 0.45 : 1,
                            cursor: isPending ? 'not-allowed' : 'pointer',
                            border: isPending ? '1px dashed #555' : undefined,
                          }}
                        >
                          {isPending ? '🔒 Attend Callback First' : 'Approve Project & Issue Credentials'}
                        </Button>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        {isPending && (
                          <Button
                            size="sm"
                            variant="info"
                            icon={PhoneCall}
                            onClick={() => handleMarkAttended(cb.id)}
                          >
                            Mark Attended
                          </Button>
                        )}

                        {isAttended && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRevertPending(cb.id)}
                          >
                            Revert to Pending
                          </Button>
                        )}

                        {isResolved && (
                          <Button
                            size="sm"
                            variant="outline"
                            icon={RefreshCw}
                            onClick={() => handleMarkAttended(cb.id)}
                          >
                            Re-Open
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={PhoneCall}
            title="No Inbound Inquiries Found"
            description="Callback requests will appear here in real-time when prospective clients submit project booking requests on the website."
            action={
              <Button variant="outline" icon={RefreshCw} onClick={loadCallbacks}>
                Refresh Inquiries
              </Button>
            }
          />
        )}

        {/* Modal 1: Approve Project Booking & Generate Credentials */}
        {bookingModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}>
            <div style={{
              background: '#12131a',
              border: '1px solid rgba(201, 168, 76, 0.4)',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={24} color="#c9a84c" />
                  <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>
                    Approve Project &amp; Issue Credentials
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <p style={{ fontSize: '0.84rem', color: '#aaa', lineHeight: '1.5', marginBottom: '20px' }}>
                This action approves the client commission, registers their private account, creates their project roadmap, and generates secure credentials.
              </p>

              <form onSubmit={handleConfirmBookingAndDispatch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  background: 'rgba(201, 168, 76, 0.08)',
                  border: '1px dashed rgba(201, 168, 76, 0.3)',
                  borderRadius: '10px',
                  padding: '16px'
                }}>
                  <div style={{ fontSize: '0.78rem', color: '#c9a84c', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
                    Auto-Generated Credentials (Dispatched to Client)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '4px' }}>Client ID</label>
                      <input
                        type="text"
                        value={bookingData.clientCode}
                        readOnly
                        style={{
                          width: '100%',
                          background: '#0d0d12',
                          border: '1px solid #333',
                          color: '#c9a84c',
                          fontWeight: 700,
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '0.75rem', color: '#888' }}>Temporary Password</label>
                        <button
                          type="button"
                          onClick={() => setBookingData(p => ({ ...p, generatedPassword: generatePassword() }))}
                          style={{ background: 'transparent', border: 'none', color: '#c9a84c', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Re-roll
                        </button>
                      </div>
                      <input
                        type="text"
                        value={bookingData.generatedPassword}
                        onChange={(e) => setBookingData({ ...bookingData, generatedPassword: e.target.value })}
                        style={{
                          width: '100%',
                          background: '#0d0d12',
                          border: '1px solid #333',
                          color: '#22c55e',
                          fontWeight: 700,
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '0.85rem'
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#bbb', display: 'block', marginBottom: '4px' }}>Client Full Name *</label>
                    <input
                      type="text"
                      value={bookingData.fullName}
                      onChange={(e) => setBookingData({ ...bookingData, fullName: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #333', background: '#1a1b24', color: '#fff', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#bbb', display: 'block', marginBottom: '4px' }}>Dispatch Email Address *</label>
                    <input
                      type="email"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #333', background: '#1a1b24', color: '#fff', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#bbb', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                    <input
                      type="text"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #333', background: '#1a1b24', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#bbb', display: 'block', marginBottom: '4px' }}>Project Category</label>
                    <select
                      value={bookingData.category}
                      onChange={(e) => setBookingData({ ...bookingData, category: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #333', background: '#1a1b24', color: '#fff', fontSize: '0.85rem' }}
                    >
                      <option value="residential">Residential Villa</option>
                      <option value="commercial">Commercial Interior</option>
                      <option value="interior">Luxury Interior Fitout</option>
                      <option value="renovation">Turnkey Renovation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#bbb', display: 'block', marginBottom: '4px' }}>Project Title *</label>
                  <input
                    type="text"
                    value={bookingData.projectTitle}
                    onChange={(e) => setBookingData({ ...bookingData, projectTitle: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #333', background: '#1a1b24', color: '#fff', fontSize: '0.85rem' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#bbb', display: 'block', marginBottom: '4px' }}>Budget (₹ INR)</label>
                    <input
                      type="number"
                      value={bookingData.budget}
                      onChange={(e) => setBookingData({ ...bookingData, budget: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #333', background: '#1a1b24', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#bbb', display: 'block', marginBottom: '4px' }}>Site Location</label>
                    <input
                      type="text"
                      value={bookingData.location}
                      onChange={(e) => setBookingData({ ...bookingData, location: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #333', background: '#1a1b24', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
                  <Button
                    type="submit"
                    variant="gold"
                    icon={Send}
                    style={{ flex: 1, padding: '12px', fontWeight: 700 }}
                  >
                    Approve Commission &amp; Dispatch Credentials Mail
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setBookingModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Official Dispatched Email Preview */}
        {emailModalOpen && dispatchedEmail && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}>
            <div style={{
              background: '#0d0e15',
              border: '1px solid rgba(201, 168, 76, 0.4)',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 70px rgba(0,0,0,0.95)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 color="#22c55e" size={22} />
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Credentials Mailed to Client</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Styled Corporate Email Preview Box */}
              <div style={{
                background: '#161722',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '18px',
                fontFamily: 'monospace, sans-serif'
              }}>
                <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', marginBottom: '12px', fontSize: '0.8rem', color: '#aaa' }}>
                  <div><strong>From:</strong> BAVI Architectural Studio &lt;concierge@bavi.in&gt;</div>
                  <div><strong>To:</strong> {dispatchedEmail.to}</div>
                  <div><strong>Subject:</strong> Welcome to BAVI — Project Booking Approved &amp; Portal Credentials</div>
                  <div><strong>Date:</strong> {new Date(dispatchedEmail.dispatchedAt).toLocaleString('en-IN')}</div>
                </div>

                <div style={{ fontSize: '0.86rem', color: '#e0e0e0', lineHeight: '1.6' }}>
                  <p>Dear {dispatchedEmail.clientName},</p>
                  <p>We are delighted to confirm that following our callback conversation, your commission for <strong>{dispatchedEmail.projectTitle}</strong> has been officially approved!</p>
                  
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px dashed #c9a84c',
                    borderRadius: '8px',
                    padding: '14px',
                    margin: '14px 0'
                  }}>
                    <div style={{ color: '#c9a84c', fontWeight: 700, marginBottom: '6px' }}>Your Client Portal Access:</div>
                    <div><strong>Client ID:</strong> <span style={{ color: '#fff' }}>{dispatchedEmail.clientId}</span></div>
                    <div><strong>Login Email:</strong> <span style={{ color: '#fff' }}>{dispatchedEmail.to}</span></div>
                    <div><strong>Temporary Password:</strong> <span style={{ color: '#22c55e', fontWeight: 700 }}>{dispatchedEmail.password}</span></div>
                    <div><strong>Portal URL:</strong> <a href={dispatchedEmail.loginUrl} target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>{dispatchedEmail.loginUrl}</a></div>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#999', margin: 0 }}>
                    Security Note: You may change your password anytime directly within your client profile by submitting a notification to your designer.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <Button
                  size="sm"
                  variant={copied ? 'success' : 'gold'}
                  icon={copied ? Check : Copy}
                  onClick={handleCopyCredentials}
                >
                  {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEmailModalOpen(false)}
                >
                  Close &amp; Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        <Toast message={toastMsg} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
      </div>
    </>
  );
}
